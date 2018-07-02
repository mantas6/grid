import { Subject } from 'rxjs';
import { Cell, Colors } from './cell';
import { Type, Exclude, Expose, Transform } from 'class-transformer';

import { range, entries, sample, shuffle, random } from 'lodash';

export class Grid {
    @Type(() => Cell)
    map: Cell[][] = [];

    constructor(sizeX: number, sizeY: number) {
        for (const x of range(0, sizeX)) {
            if (!this.map[x]) {
                this.map.push([]);
            }
    
            for (const y of range(0, sizeY)) {
                this.map[x].push(undefined);
            }
        }
    }

    static generate(): Grid {
        const sizeX = 1024;
        const sizeY = 1024;
    
        const grid = new Grid(sizeX, sizeY);
    
        for (const x of range(0, sizeX)) {
            for (const y of range(0, sizeY)) {
                const colors = generateCellColors();
    
                const cell = new Cell(x, y, colors);
    
                grid.setCell(x, y, cell);
            }
        }
    
        return grid;
    }

    getCell(x: number, y: number): Cell {
        if (this.map[x]) {
            return this.map[x][y];
        }
    }

    setCell(x: number, y: number, cell: Cell) {
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

function generateCellColors(): Colors {
    if (random(0, 100) > 75) {
        return {
            c: random(0, 25),
            m: random(0, 25),
            y: random(0, 25),
        };
    } else {
        return {
            c: 0,
            m: 0,
            y: 0,
        };
    }
}

function generateCellType(): string {
    const types = {
        empty: 100,
        healthPotion: 25,
        magicPotion: 25,
    };

    const chances = [];

    for (const [type, count] of entries(types)) {
        chances.push(...new Array(count).fill(type));
    }

    return sample(chances);
}