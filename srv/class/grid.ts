import { Subject } from 'rxjs';
import { Cell, Content } from './cell';
import { Type, Exclude, Expose, Transform } from 'class-transformer';

import { range, entries, sample, shuffle, random } from 'lodash';

import { Log } from '../utils/log';

const log = new Log('grid');

export class Grid {
    @Type(() => Cell)
    map: Map = {};

    chunkSize: number;

    constructor(chunkSize: number) {
        this.chunkSize = chunkSize;
        this.generateChunk(0, 0);
    }

    generateChunk(chunkX: number, chunkY: number) {
        const sizeX = chunkX * this.chunkSize;
        const sizeY = chunkY * this.chunkSize;
    
        for (const x of range(sizeX, sizeX + this.chunkSize)) {
            for (const y of range(sizeY, sizeY + this.chunkSize)) {
                const cell = new Cell(x, y);

                const randomCase = random(0, 100);

                if(randomCase > 99) {
                    cell.content = generatePureCell();
                } else if (randomCase > 90) {
                    cell.content = generateCellContent();
                } else if(randomCase > 30) {
                    cell.content = generateCellSlab();
                }

                cell.size = random(1, 2);
    
                this.setCell(x, y, cell);
            }
        }
    
    }

    isChunkGenerated(chunkX: number, chunkY: number) {
        if (this.getCell(chunkX * this.chunkSize - 1, chunkY * this.chunkSize - 1)) {
            return true;
        }

        return false;
    }

    probeChunk(x: number, y: number) {
        const chunkX = Math.floor(x / this.chunkSize);
        const chunkY = Math.floor(y / this.chunkSize);

        const nearbyChunks = [
            { x: chunkX, y: chunkY },
            { x: chunkX, y: chunkY + 1 },
            { x: chunkX, y: chunkY - 1 },
            { x: chunkX + 1, y: chunkY },
            { x: chunkX - 1, y: chunkY },
        ];

        for (const { x, y } of nearbyChunks) {
            if (!this.isChunkGenerated(x, y)) {
                this.generateChunk(chunkX, chunkY);
                log.complete(`Generated chunk of X=${x} Y=${y}`);
            }
        }
    }

    getCell(x: number, y: number): Cell {
        if (this.map[x]) {
            return this.map[x][y];
        }
    }

    setCell(x: number, y: number, cell: Cell) {
        if (!this.map[x])
            this.map[x] = {};

        this.map[x][y] = cell;

        return this;
    }

    findCellOccupiable(): Cell {
        for (const lineX of shuffle(this.map)) {
            for (const cell of shuffle(lineX)) {
                if (cell.isOccupiable()) {
                    return cell;
                }
            }
        }
    }
}

function generateCellSlab(): Content {
    return {
        k: random(75, 100),
    };
}

function generatePureCell(): Content {
    const content = {
        c: 0,
        m: 0,
        y: 0,
        k: 0,
    };

    const color = sample(['c', 'm', 'y']);

    content[color] = random(25, 50);

    return content;
}

function generateCellContent(): Content {
    return {
        c: random(25, 50),
        m: random(25, 50),
        y: random(25, 50),
        k: random(25, 50),
    };
}

interface Map {
    [x: number]: {
        [y: number]: Cell;
    },
}