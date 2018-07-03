import { Subject } from 'rxjs';
import { Cell, Content } from './cell';
import { Type, Exclude, Expose, Transform } from 'class-transformer';

import { range, entries, sample, shuffle, random } from 'lodash';

export class Grid {
    @Type(() => Cell)
    map: Map = {};

    constructor(sizeX: number, sizeY: number) {
        for (const x of range(0, sizeX)) {
            if (!this.map[x]) {
                this.map[x] = {};
            }
    
            for (const y of range(0, sizeY)) {
                this.map[x][y] = undefined;
            }
        }
    }

    static generate(): Grid {
        const sizeX = 128;
        const sizeY = 128;
    
        const grid = new Grid(sizeX, sizeY);
    
        for (const x of range(0, sizeX)) {
            for (const y of range(0, sizeY)) {
                const cell = new Cell(x, y);

                const randomCase = random(0, 100);

                if (randomCase > 90) {
                    cell.content = generateCellContent();
                } else if(randomCase > 10) {
                    cell.content = generateCellSlab();
                }

                cell.size = random(1, 2);
    
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

function generateCellSlab(): Content {
    return {
        k: random(75, 100),
    };
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