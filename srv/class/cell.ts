import { Subject } from 'rxjs';
import { range, toPairs, entries, sum, values, chain } from 'lodash';
import { Type, Exclude, Expose, Transform } from 'class-transformer';

import { Player } from './player';
import { InventoryItem } from './inventory';
import { grid } from '../state';

import { measureDistance } from '../utils/method';

export class Cell {
    x: number;
    y: number;

    content: CellContent;
    density: number;

    item: InventoryItem;

    @Exclude()
    player: Player;

    @Exclude()
    subject = new Subject<CellUpdate>();

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    getInteractionCost() {
        if (this.item) {
            return 0;
        }

        if (this.content) {
            return sum(values(this.content)) / 100; // Todo
        }

        return 1;
    }

    isOccupiable(): boolean {
        return !this.player && !this.content && !this.item;
    }

    isAbsorbable(): boolean {
        return !!this.player || !!this.content || !!this.item;
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
        this.density = undefined;
        this.update();
    }

    // Automatically will "fill"
    affectContent(name: string, diff: number): boolean {
        if (this.content) {
            if (this.content[name]) {
                this.content[name] += Math.min(diff, this.content[name]);

                if (sum(values(this.content)) <= 0) {
                    this.clearContent();
                }

                this.update();
            }
        }
        return true;
    }

    pickupItem(): InventoryItem {
        const item = this.item;

        if (this.item) {
            this.item = undefined;
            this.update();

            return item;
        }
    }

    addItem(item: InventoryItem): boolean {
        if (!this.item) {
            this.item = item;
            this.update();

            return true;
        }
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
            density: this.density,
            item: this.item,
            isOccupiable: this.isOccupiable() || undefined,
            isAbsorbable: this.isAbsorbable() || undefined,
            playerId: this.player ? this.player.id : undefined,
        };
    }

    toString() {
        return `X=${this.x} Y=${this.y}`;
    }

    update() {
        this.subject.next(this.getUpdate());
    }
}

export interface CellUpdate {
    x: number;
    y: number;
    content?: CellContent;
    isOccupiable?: boolean;
    isAbsorbable?: boolean;
    playerId?: number;
    item?: InventoryItem;
    density?: number;
}

export interface CellContent {
    [name: string]: number;
    
}