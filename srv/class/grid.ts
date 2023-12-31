import { Subject } from 'rxjs';
import { Cell } from './cell';
import { Type, Exclude, Expose, Transform } from 'class-transformer';

import { range, entries, sample, shuffle, random, values } from 'lodash';

import { Log } from '../utils/log';
import { ChunkGenerator } from '../utils/generate';
import { measureDistance } from '../utils/method';
import { InventoryItem } from './inventory';
import { globalStatus } from '../state';

const log = new Log('grid');

export class Grid {
    @Type(() => Cell)
    map: Map = {};

    chunkSize: number;
    isProcedural: boolean = false;

    chunkCount: number = 0;

    constructor(chunkSize: number, isProcedural: boolean = false) {
        this.chunkSize = chunkSize;
        this.isProcedural = isProcedural;
        
        process.nextTick(() => {
            this.generateChunk(0, 0);
            globalStatus.ready = true;
        });
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

        this.chunkCount++;
    }

    clearChunks() {
        this.map = {};
        this.chunkCount = 0;
        log.complete(`Chunks cleared`);
        this.generateChunk(0, 0);
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
        if (this.isProcedural) {
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
            for (const cell of shuffle(values(lineX).filter(line => line.y > 0 && line.y < this.chunkSize))) {
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