import assert from 'assert';
import exp from 'constants';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import * as path from 'path';
import * as advent from 'advent-api';
import * as util from 'util';
import { Counter } from '../../common/counter';
import { InfiniteGrid } from '../../common/grid';
import { IPoint } from '../../common/models';
import * as reducers from '../../common/reducers';
import {
    allIndexesOf,
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

type Tile = Array<string>;
type TileRecord = Record<string, Tile>;

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

const sideToOpposite = {
    [BoxSide.left]:   BoxSide.right,
    [BoxSide.right]:  BoxSide.left,
    [BoxSide.top]:    BoxSide.bottom,
    [BoxSide.bottom]: BoxSide.top
};

const allTileIds = Object.keys(tiles);

const rotateArrayClockwise = <T>(items: T[][]): T[][] => {
    const result: T[][] = [];
    for (let x = 0; x < items.length; x++) {
        const row = [];
        for (let y = items[0].length - 1; y >= 0; y--) {
            row.push(items[y][x]);
        }
        result.push(row);
    }
    return result;
};

const rotateImageClockwise = (image: Tile): Tile => {
    return rotateArrayClockwise(image.map(chars)).map(line => line.join(''));
};

const generateImagePermutations = function* (originalImage: Tile) {
    const rotationsOf = function* (image: Tile) {
        yield image;
        for (let i = 0; i < 3; i++) {
            image = rotateImageClockwise(image);
            yield image;
        }
    };

    yield* rotationsOf(originalImage);
    yield* rotationsOf(reflectImage(originalImage));
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

const serializeTile = (tile: Tile) => tile.map(line => chars(line).join(' ')).join('\n');


const part1 = () => {
    console.log(imageMatrix.corners.map(point => imageMatrix.get(point)).reduce(...reducers.multiply()));
};

const part2 = async () => {
    const fullImage = [];

    for (const y of imageMatrix.allY) {
        const rowLines = [];
        for (const [, id] of imageMatrix.row(y)) {
            const tile = tiles[id];
            const tileWithoutBorders = tile.slice(1, tile.length - 1).map(line => line.slice(1, line.length - 1));
            for (const [i, line] of tileWithoutBorders.entries()) {
                if (i >= rowLines.length) {
                    rowLines[i] = '';
                }
                rowLines[i] += line;
            }
        }
        fullImage.push(...rowLines);
    }

    const seaMonsterPatternRaw = `                  # 
#    ##    ##    ###
 #  #  #  #  #  #   `.split('\n');
    const seaMonsterBodyChar = '#';
    const seaMonsterPatternCoordinates = seaMonsterPatternRaw.flatMap((line, y) => allIndexesOf(line.split(''), seaMonsterBodyChar).map(x => ({
        x,
        y
    })));
    const seaMonsterWidth = seaMonsterPatternRaw[0].length;
    const seaMonsterHeight = seaMonsterPatternRaw.length;
    console.log(seaMonsterPatternCoordinates);

    for (const permutation of generateImagePermutations(fullImage)) {
        const seaMonsterPartsInImage = new InfiniteGrid<boolean>();
        let seaMonsters = 0;
        for (let y = 0; y < permutation.length - (seaMonsterHeight - 1); y++) {
            for (let x = 0; x < permutation[y].length - (seaMonsterWidth - 1); x++) {
                const point = { x, y };

                const seaMonsterOffsetCoordinates = seaMonsterPatternCoordinates.map(offset => PointMath.add(offset, point));
                if (seaMonsterOffsetCoordinates.every(coordinate => permutation[coordinate.y]?.[coordinate.x] === seaMonsterBodyChar)) {
                    seaMonsters++;
                    for (const coordinate of seaMonsterOffsetCoordinates) {
                        seaMonsterPartsInImage.set(coordinate, true);
                    }
                }
            }
        }

        if (!seaMonsterPartsInImage.isEmpty) {
            const permutationButWithMonsters = permutation.map((line, y) => chars(line).map((char, x) => seaMonsterPartsInImage.has({x, y}) ? 'O' : char).join(''));
            console.log(serializeTile(permutationButWithMonsters));
            console.log(permutation.map((line, y) => chars(line).filter((char, x) => char === seaMonsterBodyChar && !seaMonsterPartsInImage.has({x, y})).length).reduce(...reducers.add()));
            const bodyCharCount = new Counter(permutation.join('')).get('#');
            console.log(bodyCharCount - (seaMonsters * seaMonsterPatternCoordinates.length));
            console.log(new Counter(permutationButWithMonsters.join('')).get('#'));
            break;
        }
    }
};

const run = async () => {
    await part1();
    await part2();
};

run().catch(console.error);
