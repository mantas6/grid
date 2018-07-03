import { Subject } from 'rxjs';
import { range } from 'lodash';
import { Type, Exclude, Expose, Transform } from 'class-transformer';

import { Player } from './player';
import { grid } from '../state';

export class Cell {
    x: number;
    y: number;

    content: Content;

    @Exclude()
    player: Player;

    @Exclude()
    subject = new Subject<CellEvent>();

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    isOccupiable(): boolean {
        return !this.player && !this.content;
    }

    isAbsorbable(): boolean {
        return !this.player && !!this.content;
    }

    assignPlayer(player: Player) {
        this.player = player;
        this.update();
    }

    unassignPlayer() {
        this.player = undefined;
        this.update();
    }

    neighbors(): Cell[] {
        const neighbors: Cell[] = [];

        for (const x of range(this.x - 4, this.x + 5)) {
            for (const y of range(this.y - 4, this.y + 5)) {
                const cell = grid.getCell(x, y);

                if (cell) {
                    neighbors.push(cell);
                }
            }
        }
        
        return neighbors;
    }

    isVisible(): boolean {
        const neighborCoords = [ { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }, { x: 0, y: 0 } ];

        for (const { x, y } of neighborCoords) {
            const cell = grid.getCell(this.x + x, this.y + y);

            if (cell && cell.isOccupiable()) {
                return true;
            }

            return false;
        }
    }

    isSame(cell: Cell): boolean {
        if (cell.x == this.x && cell.y == this.y) {
            return true;
        }

        return false;
    }

    /*
    neighbors(): Cell[] {
        const neighbors: Cell[] = [];

        const neighborCoords = [ { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }, { x: 0, y: 0 } ];

        for (const { x, y } of neighborCoords) {
            const cell = grid.getCell(this.x + x, this.y + y);

            if (cell) {
                neighbors.push(cell);
            }
        }
        
        return neighbors;
    }

    neighborsVisible(): Cell[] {
        const neighbors: Cell[] = [];

        for (const x of range(this.x - 4, this.x + 5)) {
            for (const y of range(this.y - 4, this.y + 5)) {
                const cell = grid.getCell(x, y);

                if (cell) {
                    for (const neighbor of cell.neighbors()) {
                        if (neighbor.isOccupiable()) {
                            neighbors.push(cell);
                            break;
                        }
                    }
                }
            }
        }
        
        return neighbors;
    }
    */
    getUpdate(): CellUpdate {
        return {
            x: this.x,
            y: this.y,
            content: this.content,
            isOccupiable: this.isOccupiable(),
            isAbsorbable: this.isAbsorbable(),
        };
    }

    getUpdateInvisible(): CellUpdate {
        return {
            x: this.x,
            y: this.y,
            isInvisible: true,
        };
    }

    toString() {
        return `X=${this.x} Y=${this.y}`;
    }

    private update() {
        this.subject.next({ update: this.getUpdate(), ref: this });
    }
}

export interface CellEvent {
    update: CellUpdate;
    ref: Cell;
}

export interface CellUpdate {
    x: number;
    y: number;
    content?: Content;
    isOccupiable?: boolean;
    isAbsorbable?: boolean;
    isInvisible?: boolean;
}

export interface Content {
    c: Number;
    m: Number;
    y: Number;
    k: number;
}