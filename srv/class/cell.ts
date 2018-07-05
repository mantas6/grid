import { Subject } from 'rxjs';
import { range, toPairs, entries } from 'lodash';
import { Type, Exclude, Expose, Transform } from 'class-transformer';

import { Player } from './player';
import { grid } from '../state';

import { measureDistance } from '../utils/method';

export class Cell {
    x: number;
    y: number;

    content: Content;
    size: number;

    @Exclude()
    player: Player;

    @Exclude()
    subject = new Subject<CellUpdate>();

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

    clearContent() {
        this.content = undefined;
        this.size = undefined;
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
        return {
            x: this.x,
            y: this.y,
            content: this.content,
            size: this.size,
            isOccupiable: this.isOccupiable(),
            isAbsorbable: this.isAbsorbable(),
        };
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
    content?: Content;
    size?: number;
    isOccupiable?: boolean;
    isAbsorbable?: boolean;
}

export interface Content {
    [name: string]: number;
}