import { Subject } from 'rxjs';
import { range } from 'lodash';

import { Player } from './player';
import { grid } from '../state';

export class Cell {
    x: number;
    y: number;

    type: string = undefined;

    player: Player;

    subject = new Subject<CellUpdate>();

    constructor(x: number, y: number, type: string = undefined) {
        this.x = x;
        this.y = y;
        this.type = type;
    }

    isOccupiable(): boolean {
        if (this.player) {
            return false;
        }

        return true;
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

    getUpdate(): CellUpdate {
        return { x: this.x, y: this.y, type: this.type, occupiable: this.isOccupiable() };
    }

    toString() {
        return `X=${this.x} Y=${this.y}`;
    }

    private update() {
        this.subject.next(this.getUpdate());
    }
}

export interface CellUpdate {
    x: number;
    y: number;
    type: string;
    occupiable: boolean;
}