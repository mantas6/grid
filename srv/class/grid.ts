import { Subject } from 'rxjs';
import { Cell, CellContent } from './cell';
import { Type, Exclude, Expose, Transform } from 'class-transformer';

import { range, entries, sample, shuffle, random } from 'lodash';

import { Log } from '../utils/log';
import { ChunkGenerator } from '../utils/generate';
import { measureDistance } from '../utils/method';
import { InventoryItem } from './inventory';

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

        const generator = new ChunkGenerator(chunkX, chunkY);
    
        for (const x of range(sizeX, sizeX + this.chunkSize)) {
            for (const y of range(sizeY, sizeY + this.chunkSize)) {
                const cell = new Cell(x, y);

                generator.fill(cell);
    
                this.setCell(x, y, cell);
                cell.update();
            }
        }
    
    }

    isChunkGenerated(chunkX: number, chunkY: number) {
        const x = chunkX * this.chunkSize;
        const y = chunkY * this.chunkSize;
        const cell = this.getCell(x, y);

        if (cell) {
            return true;
        }

        return false;
    }

    probeChunk(x: number, y: number) {
        const startChunkX = Math.floor(x / this.chunkSize);
        const startChunkY = Math.floor(y / this.chunkSize);

        for (const chunkX of range(startChunkX - 1, startChunkX + 2)) {
            for (const chunkY of range(startChunkY - 1, startChunkY + 2)) {
                if (!this.isChunkGenerated(chunkX, chunkY)) {
                    this.generateChunk(chunkX, chunkY);
                    log.complete(`Generated chunk of X=${chunkX} Y=${chunkY}`);
                }
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

interface Map {
    [x: number]: {
        [y: number]: Cell;
    },
}