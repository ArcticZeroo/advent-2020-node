import { config } from 'dotenv';
import { readFileSync } from 'fs';
import * as path from 'path';
import * as advent from 'advent-api';
import * as util from 'util';
import { InfiniteGrid } from '../../common/grid';
import { IPoint } from '../../common/models';
import * as reducers from '../../common/reducers';
import {
    chars,
    column,
    combinations,
    first,
    keysOf,
    last,
    lines,
    paragraphs,
    PointMath,
    reversed
} from '../../common/utils';

config();

const year = 2020;
const day = 20;

const input = readFileSync(path.resolve(path.join(__dirname, 'input.txt')), 'utf-8');

const submit = async (part: 1 | 2, answer: unknown) => {
    const response = await advent.submitAnswer({ year, day, part, answer }, { cookie: process.env.ADVENT_COOKIE });
    console.log(response);
    const text = await response.text();
    console.log(text);
    return response;
};

type Tile = Array<string>;
type TileRecord = Record<string, Tile>;

enum Axis {
    none = 'none',
    vertical = 'vertical',
    horizontal = 'horizontal',
}

const reflectOnAxis = (image: Tile, axis: Axis): Tile => {
    if (axis === Axis.none) {
        return image;
    }

    if (axis === Axis.vertical) {
        return reversed(image);
    }

    return image.map(line => reversed(line));
};

const reflectImage = (image: Tile) => image.map(line => reversed(line));

const tileDataRaw = paragraphs(input);
const tiles: TileRecord = tileDataRaw.reduce((allTiles, tileDataParagraph) => {
    const tileDataLines = lines(tileDataParagraph);
    const [id, ...image] = tileDataLines;
    allTiles[id.replace(/[^\d]/g, '')] = image;
    return allTiles;
}, {});

enum BoxSide {
    top = 'top',
    right = 'right',
    bottom = 'bottom',
    left = 'left',
}

type Border = string;

const getBorder = (image: Tile, side: BoxSide): Border => {
    if (side === BoxSide.top) {
        return image[0];
    }

    if (side === BoxSide.bottom) {
        return last(image);
    }

    if (side === BoxSide.left) {
        return image.map(line => line[0]).join('');
    }

    const lastColumn = image[0].length - 1;
    return image.map(line => line[lastColumn]).join('');
};

const getBordersOnAxis = (image: Tile, axis: Axis) => {
    if (axis === Axis.horizontal) {
        return { [BoxSide.left]: getBorder(image, BoxSide.left), [BoxSide.right]: getBorder(image, BoxSide.right) };
    }

    return { [BoxSide.top]: getBorder(image, BoxSide.top), [BoxSide.bottom]: getBorder(image, BoxSide.bottom) };
};

const sideToAxis = {
    [BoxSide.top]:    Axis.vertical,
    [BoxSide.right]:  Axis.horizontal,
    [BoxSide.bottom]: Axis.vertical,
    [BoxSide.left]:   Axis.horizontal,
};

const axisToCrossAxis = {
    [Axis.horizontal]: Axis.vertical,
    [Axis.vertical]:   Axis.horizontal,
    [Axis.none]:       Axis.none,
};

const sideToOpposite = {
    [BoxSide.left]:   BoxSide.right,
    [BoxSide.right]:  BoxSide.left,
    [BoxSide.top]:    BoxSide.bottom,
    [BoxSide.bottom]: BoxSide.top
};

const getDirectionOffset = (sideDirection: BoxSide): IPoint => {
    if (sideDirection === BoxSide.top) {
        return { x: 0, y: -1 };
    }

    if (sideDirection === BoxSide.bottom) {
        return { x: 0, y: 1 };
    }

    if (sideDirection === BoxSide.left) {
        return { x: -1, y: 0 };
    }

    if (sideDirection === BoxSide.right) {
        return { x: 1, y: 0 };
    }
};

const allTileIds = Object.keys(tiles);

interface IBorderMatch {
    side: BoxSide;
    isReflected?: boolean;
}

type MatchingBorders<T = IBorderMatch> = { [K in BoxSide]?: IBorderMatch };

const getBordersForAllSides = (image: Tile): Record<BoxSide, Border> => {
    return Object.values(BoxSide).reduce((borders, side) => {
        borders[side] = getBorder(image, side);
        return borders;
    }, {}) as Record<BoxSide, Border>;
};

const rotateImageClockwise = (image: Tile): Tile => {
    const newTile: Tile = [];
    for (let x = 0; x < image.length; x++) {
        const newRow = [];
        for (let y = image.length - 1; y >= 0; y--) {
            newRow.push(image[y][x]);
        }
        newTile.push(newRow.join(''));
    }
    return newTile;
};

const rotateSidesClockwise = (...sides: BoxSide[]): BoxSide[] => {
    const allBoxSides = Object.keys(BoxSide);
    return sides.map(side => {
        return BoxSide[allBoxSides[(allBoxSides.indexOf(side) + 1) % allBoxSides.length]];
    });
};

const generateImagePermutations = function (image: Tile) {
    return [
        image,
        reflectImage(image),
    ].flatMap(currentImage => {
        const rotations = [currentImage];
        for (let i = 0; i < 3; i++) {
            currentImage = rotateImageClockwise(currentImage);
            rotations.push(currentImage);
        }
        return rotations;
    });
};

interface INeighborMatch {
    localSide: BoxSide;
    remoteSide: BoxSide;
    isReflected: boolean;
}

const findFirstBorderMatch = (localBorders: Record<BoxSide, string>, remoteBorders: Record<BoxSide, string>): INeighborMatch => {
    for (const localSide of keysOf(localBorders)) {
        const localBorder = localBorders[localSide];
        for (const remoteSide of keysOf(remoteBorders)) {
            const remoteBorder = remoteBorders[remoteSide];
            if (localBorder === remoteBorder) {
                return {
                    localSide,
                    remoteSide,
                    isReflected: false
                };
            }
            if (reversed(localBorder) === remoteBorder) {
                return {
                    localSide,
                    remoteSide,
                    isReflected: true
                };
            }
        }
    }
};

interface INeighbor {
    tileId: string;
    matchingBorder: INeighborMatch;
}

class NeighborMap extends Map<string, INeighbor[]> {
    private _ensureExists(tileId: string) {
        if (!this.has(tileId)) {
            this.set(tileId, []);
        }
    }

    private _push(localTileId: string, neighbor: INeighbor) {
        this._ensureExists(localTileId);
        const tiles = this.get(localTileId);
        tiles.push(neighbor);
    }

    private _getRemoteNeighbor(localTileId: string, remoteTileId: string) {
        return this.get(remoteTileId).find(neighbor => neighbor.tileId === localTileId);
    }

    addRelation(localTileId: string, neighbor: INeighbor) {
        this._push(localTileId, neighbor);
        const localNeighborForRemote: INeighbor = {
            tileId:         localTileId,
            matchingBorder: {
                localSide:   neighbor.matchingBorder.remoteSide,
                remoteSide:  neighbor.matchingBorder.localSide,
                isReflected: neighbor.matchingBorder.isReflected,
            }
        };
        this._push(neighbor.tileId, localNeighborForRemote);
    }

    rotateRelations(localTileId: string) {
        for (const neighbor of this.get(localTileId)) {
            [neighbor.matchingBorder.localSide] = rotateSidesClockwise(neighbor.matchingBorder.localSide);
            const remoteNeighbor = this._getRemoteNeighbor(localTileId, neighbor.tileId);
            remoteNeighbor.matchingBorder.remoteSide = neighbor.matchingBorder.localSide;
        }
    }

    reflectRelations(localTileId: string) {
        // Reflections are all horizontal.
        for (const neighbor of this.get(localTileId)) {
            neighbor.matchingBorder.localSide = sideToOpposite[neighbor.matchingBorder.localSide];
            neighbor.matchingBorder.isReflected = !neighbor.matchingBorder.isReflected;
            const remoteNeighbor = this._getRemoteNeighbor(localTileId, neighbor.tileId);
            remoteNeighbor.matchingBorder.remoteSide = neighbor.matchingBorder.localSide;
            remoteNeighbor.matchingBorder.isReflected = neighbor.matchingBorder.isReflected;
        }
    }

    findExpectedNeighbor(localTileId: string | undefined, neighborDirection: BoxSide) {
        if (!localTileId) {
            return undefined;
        }

        return this.get(localTileId).find(neighbor => neighbor.matchingBorder.localSide === neighborDirection)?.tileId;
    }
}

const neighbors = new NeighborMap();

for (const [localTileId, remoteTileId] of combinations(allTileIds, 2)) {
    const localBorders = getBordersForAllSides(tiles[localTileId]);
    const remoteBorders = getBordersForAllSides(tiles[remoteTileId]);
    const matchingBorder = findFirstBorderMatch(localBorders, remoteBorders);
    if (matchingBorder) {
        neighbors.addRelation(localTileId, {
            matchingBorder,
            tileId: remoteTileId,
        });
    }
}

const rotate = tileId => {
    tiles[tileId] = rotateImageClockwise(tileId);
    neighbors.rotateRelations(tileId);
};

const reflect = tileId => {
    tiles[tileId] = reflectImage(tileId);
    neighbors.reflectRelations(tileId);
};

const doesBorderMatch = (localTile: Tile, neighborTileId: string, localSide: BoxSide) => {
    if (!neighborTileId) {
        return true;
    }

    const localBorder = getBorder(localTile, localSide);
    const remoteBorder = getBorder(tiles[neighborTileId], sideToOpposite[localSide]);
    // console.log('comparing border of', localSide, 'and', sideToOpposite[localSide], ':', localBorder, remoteBorder, 'for local/neighbor', localTileId, neighborTileId);
    return localBorder === remoteBorder;
};

const findPermutation = (localTileId: string, leftNeighborId: string, topNeighborId: string) => {
    for (const permutation of generateImagePermutations(tiles[localTileId])) {
        if (doesBorderMatch(permutation, leftNeighborId, BoxSide.left) && doesBorderMatch(permutation, topNeighborId, BoxSide.top)) {
            return permutation;
        }
    }
};

const findArrangement = (currentIndex: number = 0, placed: Set<string> = new Set<string>()) => {
    if (currentIndex >= allTileIds.length) {
        return true;
    }

    const y = currentIndex % squareSize;
    const x = Math.floor(currentIndex / squareSize);

    const topNeighborId = imageMatrix.get({ x, y: y - 1 });
    const leftNeighborId = imageMatrix.get({ x: x - 1, y });

    for (const tileId of allTileIds) {
        if (placed.has(tileId)) {
            continue;
        }

        // console.log('attempting to place', tileId);

        const isFirstPiece = !topNeighborId && !leftNeighborId;

        if (!isFirstPiece) {
            const validPermutation = findPermutation(tileId, leftNeighborId, topNeighborId);
            if (!validPermutation) {
                continue;
            }
            tiles[tileId] = validPermutation;
        }

        imageMatrix.set({ x, y }, tileId);
        placed.add(tileId);

        if (isFirstPiece) {
            for (const permutation of generateImagePermutations(tiles[tileId])) {
                tiles[tileId] = permutation;
                if (findArrangement(currentIndex + 1, placed)) {
                    return true;
                }
            }
        } else {
            if (findArrangement(currentIndex + 1, placed)) {
                return true;
            }
        }

        placed.delete(tileId);
    }
};

class ImageMatrix extends InfiniteGrid<string> {
    constructor(squareSize: number) {
        super();
        for (let y = 0; y < squareSize; y++) {
            for (let x = 0; x < squareSize; x++) {
                this.set({ x, y }, '');
            }
        }
    }
}

const squareSize = Math.sqrt(allTileIds.length);
const imageMatrix = new ImageMatrix(squareSize);

const foundArrangement = findArrangement();
if (!foundArrangement) {
    throw new Error('Arrangement failed');
}

const part1 = () => {
    console.log(imageMatrix.corners.map(point => imageMatrix.get(point)).reduce(...reducers.multiply()));
};

const part1solve = async () => {
    const tileCount = Object.keys(tiles).length;
    const squareSideLength = Math.sqrt(tileCount);

    interface INeighborCandidate {
        tileId: string;
        matchingBorders: MatchingBorders;
    }

    const getSidesFromCandidates = (candidates: INeighborCandidate[]) => candidates
        .flatMap(candidate => Object.keys(candidate.matchingBorders).map(value => BoxSide[value]));

    const findArrangement = () => {
        console.log('attempting to find arrangement...');

        const possibleNeighborsByBorderId = new Map<string, Array<INeighborCandidate>>();
        const ensureTileIdExists = (tileId: string) => {
            if (!possibleNeighborsByBorderId.has(tileId)) {
                possibleNeighborsByBorderId.set(tileId, []);
            }
        };
        const addNeighbor = (tileId: string, neighborTileId: string, bordersFromTileToNeighbor: MatchingBorders) => {
            // console.log('adding neighbor', tileId, 'and', neighborTileId);

            const localBorderMatch = { ...bordersFromTileToNeighbor };
            const neighborBorderMatch: MatchingBorders = Object.keys(bordersFromTileToNeighbor).reduce((borders, localBorder) => {
                const neighborBorder = bordersFromTileToNeighbor[localBorder];
                borders[neighborBorder.side] = { side: localBorder, isReflected: neighborBorder.isReflected };
                return borders;
            }, {});

            // console.log(localBorderMatch);
            // console.log(neighborBorderMatch);

            const pushCandidate = (id: string, candidate: INeighborCandidate) => {
                ensureTileIdExists(id);
                const existingCandidates = possibleNeighborsByBorderId.get(id);
                existingCandidates.push(candidate);
            };

            pushCandidate(tileId, { tileId: neighborTileId, matchingBorders: localBorderMatch });
            pushCandidate(neighborTileId, { tileId, matchingBorders: neighborBorderMatch });
        };

        const replaceSide = (tileId: string, oldSide: BoxSide, newSide: BoxSide, isReflected?: boolean) => {
            const localCandidates = possibleNeighborsByBorderId.get(tileId);
            for (const localCandidate of localCandidates) {
                if (!localCandidate.matchingBorders[oldSide]) {
                    continue;
                }
                const neighborCandidate = possibleNeighborsByBorderId.get(localCandidate.tileId).find(candidate => candidate.tileId === tileId);
                const localMatch: IBorderMatch = localCandidate.matchingBorders[oldSide];
                const neighborMatch: IBorderMatch = neighborCandidate.matchingBorders[localMatch.side];
                delete localCandidate.matchingBorders[oldSide];
                delete neighborCandidate.matchingBorders[localMatch.side];
                localCandidate.matchingBorders[newSide] = localMatch;
                neighborCandidate.matchingBorders[localMatch.side] = { ...neighborMatch, side: newSide };

                if (isReflected != null) {
                    localMatch.isReflected = isReflected;
                    neighborCandidate.matchingBorders[localMatch.side].isReflected = isReflected;
                }
            }
        };

        const applyReflections = (tileId: string) => {
            const candidates = possibleNeighborsByBorderId.get(tileId);
            const reflectedCandidates = candidates
                .filter(candidate => Object.keys(candidate.matchingBorders)
                    .every(side => candidate.matchingBorders[side].isReflected)
                );

            let currentCornerSides = getSidesFromCandidates(candidates);

            if (reflectedCandidates.length) {
                const reflectedSides = getSidesFromCandidates(reflectedCandidates);
                const currentSidesByAxis = currentCornerSides.reduce((sides, side) => {
                    const axis = sideToAxis[BoxSide[side]];
                    if (!sides.hasOwnProperty(axis)) {
                        sides[axis] = [];
                    }
                    sides[axis].push(side);
                    return sides;
                }, {});

                const axesToReflectAcross: Axis[] = Object.keys(currentSidesByAxis)
                    .filter(axis => currentSidesByAxis[axis].every(side => reflectedSides.includes(side)))
                    .map(value => Axis[value]);

                for (const axis of axesToReflectAcross) {
                    const crossAxis = axisToCrossAxis[axis];
                    tiles[tileId] = reflectOnAxis(tiles[tileId], crossAxis);
                    const affectedSides = currentSidesByAxis[axis];
                    for (const affectedSide of affectedSides) {
                        replaceSide(tileId, affectedSide, sideToOpposite[affectedSide], false);
                    }
                }
            }
        };

        const rotateClockwise = (tileId: string) => {
            tiles[tileId] = rotateImageClockwise(tiles[tileId]);
            const candidates = possibleNeighborsByBorderId.get(tileId);
            for (const candidate of candidates) {
                const matchingCandidate = possibleNeighborsByBorderId.get(candidate.tileId).find(match => match.tileId === tileId);
                for (const currentSide of Object.keys(candidate.matchingBorders)) {
                    const [newSide] = rotateSidesClockwise(BoxSide[currentSide]);
                    const matchingBorderSide: IBorderMatch = candidate.matchingBorders[currentSide];
                    candidate.matchingBorders[newSide] = matchingBorderSide;
                    delete candidate.matchingBorders[currentSide];
                    matchingCandidate.matchingBorders[matchingBorderSide.side] = {
                        side:        newSide,
                        isReflected: matchingBorderSide.isReflected
                    };
                }
            }
        };

        const autoRotate = (tileId: string, neighbor: INeighborCandidate) => {
            let [localSide] = Object.keys(neighbor.matchingBorders).map(value => BoxSide[value]) as BoxSide[];
            while (neighbor.matchingBorders[localSide].side !== sideToOpposite[localSide]) {
                rotateClockwise(tileId);
                [localSide] = rotateSidesClockwise(localSide);
            }
        };

        const autoPlace = (tileId: string) => {
            const allPlacedIds = new Set(imageMatrix.values());

            if (allPlacedIds.has(tileId)) {
                return;
            }

            console.log('placing tile id', tileId);

            applyReflections(tileId);

            const neighbors = possibleNeighborsByBorderId.get(tileId);

            const firstExistingConstraint = neighbors.find(candidate => allPlacedIds.has(candidate.tileId));

            if (!firstExistingConstraint) {
                throw new Error('No constraints have been placed yet. Cannot determine auto-placement');
            }

            autoRotate(tileId, firstExistingConstraint);

            const [matchingSide] = Object.keys(firstExistingConstraint.matchingBorders) as BoxSide[];

            const constraintPosition = imageMatrix.find(neighborId => neighborId === firstExistingConstraint.tileId);
            const constraintSide = firstExistingConstraint.matchingBorders[matchingSide].side;
            const constraintOffset = getDirectionOffset(constraintSide);
            console.log('constraint is at', constraintPosition, 'and we are trying to place onto the', constraintSide, 'which has an offset of', constraintOffset);

            imageMatrix.set(PointMath.add(constraintPosition, constraintOffset), tileId);

            for (const neighbor of neighbors) {
                if (!allPlacedIds.has(neighbor.tileId)) {
                    autoPlace(neighbor.tileId);
                }
            }
        };

        for (let i = 0; i < allTileIds.length - 1; i++) {
            const currentTileId = allTileIds[i];
            const currentTile = tiles[currentTileId];

            const currentTileBorders = Object.values(BoxSide).reduce((sides, side) => {
                sides[side] = getBorder(currentTile, side);
                return sides;
            }, {});

            // console.log('checking neighbors for tile', currentTileId);
            for (let j = i + 1; j < allTileIds.length; j++) {
                const possibleNeighborTileId = allTileIds[j];
                // console.log('checking neighbor', possibleNeighborTileId);
                const possibleNeighborTile = tiles[possibleNeighborTileId];
                const neighborBordersBySide = getBordersForAllSides(possibleNeighborTile);
                const reflectedNeighborBordersBySide = Object.values(BoxSide).reduce((borders, side) => {
                    borders[side] = reversed(neighborBordersBySide[side]);
                    return borders;
                }, {});

                // todo: in the case they're symmetrical, we're fucked
                const matchingSides: MatchingBorders = {};

                for (const currentBorderSide of Object.values(BoxSide)) {
                    const currentTileBorder = currentTileBorders[currentBorderSide];

                    // console.log('checking side', currentBorderSide, 'with axis', axis);
                    // console.log('checking against desired border', currentTileBorder);

                    const matchingBorders = (borders: MatchingBorders): BoxSide[] => {
                        // console.log('checking matching borders:', borders);
                        return Object.keys(borders).filter(possibleMatchSide => borders[possibleMatchSide] === currentTileBorder).map(value => BoxSide[value]);
                    };

                    const applyMatch = (borders, isReflected: boolean = false) => {
                        const matches = matchingBorders(borders);
                        if (matches.length) {
                            const [matchingSide] = matches;
                            // console.log(`found a match with isReflected=${isReflected ? 'yes' : 'no'} on neighbor side ${matchingSide} and local side ${currentBorderSide}`);
                            matchingSides[currentBorderSide] = { side: matchingSide, isReflected };
                        }
                    };

                    applyMatch(neighborBordersBySide, false);
                    applyMatch(reflectedNeighborBordersBySide, true);
                }

                if (Object.keys(matchingSides).length) {
                    addNeighbor(currentTileId, possibleNeighborTileId, matchingSides);
                }
            }
        }

        const possibleNeighborEntries = [...possibleNeighborsByBorderId.entries()];
        const possibleCorners = possibleNeighborEntries.filter(([id, candidates]) => candidates.length === 2);

        console.log('part 1:', possibleCorners.map(([id]) => id).reduce(...reducers.multiply()));

        const imageMatrix = new InfiniteGrid<string>();
        for (let y = 0; y < squareSideLength; y++) {
            for (let x = 0; x < squareSideLength; x++) {
                // initialize with empty tile IDs
                imageMatrix.set({ x, y }, '');
            }
        }

        const matrixCorners = imageMatrix.corners;

        for (const cornerPoint of matrixCorners) {
            const [[cornerTileId, cornerTileCandidates]] = possibleCorners.splice(0, 1);

            applyReflections(cornerTileId);
            let currentCornerSides = getSidesFromCandidates(cornerTileCandidates);

            const desiredHorizontalSide = cornerPoint.x === 0 ? BoxSide.right : BoxSide.left;
            const desiredVerticalSide = cornerPoint.y === 0 ? BoxSide.bottom : BoxSide.top;

            while (!(currentCornerSides.includes(desiredHorizontalSide) && currentCornerSides.includes(desiredVerticalSide))) {
                currentCornerSides = rotateSidesClockwise(...currentCornerSides);
                rotateClockwise(cornerTileId);
            }

            imageMatrix.set(cornerPoint, cornerTileId);

            for (const neighbor of cornerTileCandidates) {
                console.log('placing neighbor from corner', cornerTileId);
                autoPlace(neighbor.tileId);
            }
        }

        // const possibleEdges = possibleNeighborEntries.filter(([id, candidates]) => candidates.length === 3);
        //
        // console.log('possible corners:', util.inspect(possibleCorners));
        // console.log('possible edges:', util.inspect(possibleEdges));
        //
        for (const tileId of possibleNeighborsByBorderId.keys()) {
            const candidates = possibleNeighborsByBorderId.get(tileId);
            console.log(tileId, 'has', candidates.length, 'candidate(s):');
            for (const candidate of candidates) {
                console.log(`  ${candidate.tileId}: ${util.inspect(candidate.matchingBorders)}`);
            }
        }

        const output = [];
        for (let matrixX = imageMatrix.minValues.x; matrixX <= imageMatrix.maxValues.x; matrixX++) {
            const lines = [];
            for (let matrixY = imageMatrix.minValues.y; matrixY <= imageMatrix.maxValues.y; matrixY++) {
                const tile = tiles[imageMatrix.get({ x: matrixX, y: matrixY })];
                if (tile) {
                    for (let i = 0; i < tile.length; i++) {
                        if (i >= lines.length) {
                            lines.push('');
                        }
                        lines[i] += tile[i];
                    }
                } else {
                    for (let i = 0; i < lines.length; i++) {
                        lines[i] += Array(lines.length).fill('').join(' ');
                    }
                }
            }
            output.push(lines.join('\n'));
        }
        console.log(output.join('\n'));
    };

    console.log('There are', tileCount, 'tiles');
    console.log(findArrangement());
};

const part2 = async () => {

};

const run = async () => {
    await part1();
    await part2();
};

run().catch(console.error);
//
// const testTile = lines(`
// #....
// #...,
// #....
// #....
// ...##
// `);
//
// const serializeTile = (tile: Tile) => tile.map(line => chars(line).join(' ')).join('\n');
//
// const uniqueTiles = new Set<string>();
//
// let currentTile = [...testTile];
// for (const axis of Object.values(Axis)) {
//     console.log('Axis:', axis);
//     currentTile = reflectOnAxis(testTile, axis);
//     for (let i = 0; i < 4; i++) {
//         const serialized = serializeTile(currentTile);
//         console.log('Tile:', '\n' + serialized);
//
//         if (uniqueTiles.has(serialized)) {
//             console.log('Tile already exists');
//         }
//
//         uniqueTiles.add(serialized);
//         currentTile = rotateImageClockwise(currentTile);
//     }
// }
//
// console.log([...uniqueTiles.values()].join('\n\n'));
//
// console.log('there are', uniqueTiles.size, 'unique tiles');