import { Subject, Subscription, interval } from 'rxjs';
import { range, toPairs, entries, sum, values, chain } from 'lodash';
import { Type, Exclude, Expose, Transform } from 'class-transformer';

import { Player } from './player';
import { InventoryItem } from './inventory';
import { grid } from '../state';

import { ProcessCell } from './process/cell';

import { measureDistance } from '../utils/method';
import { ProcessUpdate, ProcessContent } from './process/base';

export class Cell {
    x: number;
    y: number;

    process: ProcessCell;

    @Exclude()
    processTimer: Subscription;

    item: InventoryItem;

    @Exclude()
    player: Player;

    @Exclude()
    subject = new Subject<CellUpdate>();

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    isOccupiable(): boolean {
        return !this.player && !this.process && !this.item;
    }

    isAbsorbable(): boolean {
        return !!this.player || !!this.process || !!this.item;
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
        this.process = undefined;

        if (this.processTimer) {
            this.processTimer.unsubscribe();
        }
        this.update();
    }

    initializeContent(content?: ProcessContent) {
        this.process = new ProcessCell(this);

        if (content) {
            this.process.content = content;
        }

        this.processTimer = interval(1000).subscribe(_ => {
            this.process.processContent();
        });
    }

    contentTotalAmount() {
        if (this.process) {
            return this.process.usage();
        }

        return 0;
    }

    // Automatically will "fill"
    affectContent(name: string, diff: number): boolean {
        if (this.process) {
            this.process.affect(name, diff);

            if (this.process.usage() <= 0) {
                this.clearContent();
            }

            this.update();
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
            process: this.process && this.process.getUpdate() || undefined,
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
    process?: ProcessUpdate;
    isOccupiable?: boolean;
    isAbsorbable?: boolean;
    playerId?: number;
    item?: InventoryItem;
}