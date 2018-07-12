import { Subject, Subscription, interval } from 'rxjs';
import { range, toPairs, entries, sum, values, chain } from 'lodash';
import { Type, Exclude, Expose, Transform } from 'class-transformer';

import { Player } from './player';
import { InventoryItem } from './inventory';
import { grid } from '../state';
import { Log } from '../utils/log';

import { Process, ProcessContent, ProcessUpdate } from './process';

import { measureDistance } from '../utils/method';
const log = new Log('cell');

export class Cell {
    x: number;
    y: number;

    process: Process;

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
        this.touchContentTimer();

        this.update();
    }

    initializeContent(content?: ProcessContent) {
        this.process = new Process(this);

        if (content) {
            this.process.content = content;
        }

        this.touchContentTimer();
    }

    touchContentTimer() {
        if (this.process && !this.processTimer && this.process.active) {
            log.debug(`Setting content timer for cell ${this.toString()}`);
            this.processTimer = interval(1000).subscribe(_ => {
                this.process.processContent();
                this.touchContentTimer();
            });
        } else if (this.processTimer && (!this.process || !this.process.active)) {
            this.processTimer.unsubscribe();
            this.processTimer = undefined;
            log.debug(`Clearing content timer for cell ${this.toString()}`);
        }
    }

    contentTotalAmount() {
        if (this.process) {
            return this.process.usage();
        }

        return 0;
    }

    // Automatically will "fill"
    affectContent(name: string, diff: number): number {
        if (this.player) {
            const affected = this.player.process.affect(name, diff);
            return affected;
        }
        
        if (!this.process) {
            this.initializeContent();
        }

        const affected = this.process.affect(name, diff);

        if (this.process.usage() <= 0) {
            this.clearContent();
        } else {
            this.process.active = true;
            this.touchContentTimer();
        }

        this.update();

        return affected;
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

    neighbors(distance: number = 4): Cell[] {
        const neighbors: Cell[] = [];

        for (const x of range(this.x - distance, this.x + distance + 1)) {
            for (const y of range(this.y - distance, this.y + distance + 1)) {
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
            playerHealth: this.player ? this.player.getStat('health').current / this.player.getStat('health').max : undefined,
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
    playerHealth?: number;
    item?: InventoryItem;
}