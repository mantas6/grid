import { Subject, Subscription, from, Observable, interval } from 'rxjs';
import { bufferTime, bufferCount, filter, map } from 'rxjs/operators';
import { find, entries, values, sum, last, keys } from 'lodash';
import { Socket } from 'socket.io';
import { Type, Exclude, Expose } from 'class-transformer';

import { Cell, CellUpdate } from './cell';
import { Stat, StatUpdate } from './stat';
import { grid, players } from '../state';
import { Log } from '../utils/log';

import { CellRef } from '../utils/ref';
import { ProcessPlayer } from './process/player';
import { ProcessUpdate } from './process/base';
import { Inventory, InventoryUpdate } from './inventory';

const log = new Log('player');

@Exclude()
export class Player {
    @Expose()
    id: number;

    @Expose()
    token: string;

    @Expose()
    @Type(() => CellRef)
    cell: CellRef = new CellRef();

    @Type(() => Stat)
    @Expose()
    stats: Stat[] = [];

    @Type(() => ProcessPlayer)
    @Expose()
    process: ProcessPlayer;

    @Type(() => Inventory)
    @Expose()
    inventory: Inventory;

    statsSubject: Subject<StatUpdate>;
    
    locationSubject: Subject<PlayerLocationUpdate>;

    cellsNearby: CellSubscription[] = [];
    cellsUpdate: Subject<CellUpdate>;
    processUpdate: Subject<ProcessUpdate>;
    inventoryUpdate: Subject<InventoryUpdate>;

    processTimer: Subscription;

    client: Socket;

    constructor() {
        
    }
    
    static create(id: number) {
        const player = new Player();
        player.id = id;

        player.initialize();

        return player;
    }

    initialize() {
        this.process = new ProcessPlayer(this);
        this.inventory = new Inventory(this);

        this.stats = [];

        for (const statName of ['health', 'energy']) {
            const stat = new Stat(this, statName);
            stat.max = 100;
            stat.current = 100;

            this.stats.push(stat);
        }
    }

    logOn(client: Socket) {
        this.statsSubject = new Subject<StatUpdate>();
        this.locationSubject = new Subject<PlayerLocationUpdate>();
        this.cellsUpdate = new Subject<CellUpdate>();
        this.processUpdate = new Subject<ProcessUpdate>();
        this.inventoryUpdate = new Subject<InventoryUpdate>();

        this.client = client;

        this.locationSubject.subscribe(update => {
            client.emit('updatePlayerLocation', update);
        });

        this.statsSubject.pipe(
            bufferTime(100),
            filter(updates => !!updates.length)
        )
        .subscribe(updates => {
            client.emit('updateStats', updates);
        });

        this.cellsUpdate.pipe(
            bufferTime(100),
            filter(updates => !!updates.length)
        )
        .subscribe(updates => {
            client.emit('cellsUpdate', updates);
        });

        this.processUpdate.pipe(
            bufferTime(100),
            filter(updates => !!updates.length),
            map(updates => last(updates))
        )
        .subscribe(update => {
            client.emit('updateProcess', update);
        });

        this.inventoryUpdate.pipe(
            bufferTime(100),
            filter(updates => !!updates.length),
            map(updates => last(updates))
        )
        .subscribe(update => {
            client.emit('updateInventory', update);
        });

        this.processTimer = interval(1000).subscribe(_ => {
            this.process.processContent();

            // Death handler
            if (this.getStat('health').isEmpty()) {
                this.initialize();
                this.assignCell(grid.findCellOccupiable());
                this.updateAll();
            }
        });

        this.updateAll();
    }

    logOff() {
        this.client = undefined;
        for (const cell of this.cellsNearby) {
            cell.subscription.unsubscribe();
        }

        this.locationSubject.unsubscribe();
        this.statsSubject.unsubscribe();
        this.cellsUpdate.unsubscribe();
        this.cellsUpdate.unsubscribe();
        this.processUpdate.unsubscribe();
        this.processTimer.unsubscribe();

        this.cellsNearby = [];

        this.cell.get().unassignPlayer();
    }

    getActionCost(cell: Cell) {
        if (cell.item) {
            return 0;
        }

        if (cell.process) {
            return Math.min((this.process.amountOf('absorbStrength') + 1) / (this.process.amountOf('absorbEff') + 1), cell.contentTotalAmount());
        }

        return 1;
    }

    assignCell(cell: Cell): boolean {
        log.debug(`Assigning player to cell ${cell.toString()}`);

        if (!cell.isOccupiable()) {
            return false;
        }

        if (this.cell.get()) {
            this.cell.get().unassignPlayer();
        }

        this.cell.setRef(cell);

        this.cell.get().assignPlayer(this);

        this.updateCellsNearby();

        this.locationSubject.next({ x: cell.x, y: cell.y });

        return true;
    }

    absorbCellWithContent(cell: Cell): boolean {
        if (!cell.isAbsorbable() || !cell.process) {
            log.debug(`Not absorbable`);
            return false;
        }

        if (this.process.processContentOfCell(cell)) {
            return true;
        }

        return true;
    }

    absorbCellWithPlayer(cell: Cell): boolean {
        for (const processName of keys(this.process.content)) {
            const affectBy = 1;
            this.process.affect(processName, -affectBy);
            cell.player.process.affect(processName, +affectBy);
        }

        return true;
    }

    absorbCellWithItem(cell: Cell): boolean {
        if (this.inventory.hasFreeSlot()) {
            const item = cell.pickupItem();

            this.inventory.addItem(item);

            return true;
        }
    }

    getStat(name: string): Stat {
        return find(this.stats, { name });
    }

    updateAll() {
        this.process.update();
        this.inventory.update();

        for (const stat of this.stats) {
            stat.update();
        }
    }

    private updateCellsNearby() {
        const cellsNear = this.cell.get().neighbors();

        // Subscribing to unsubscribed cells
        for (const cell of cellsNear) {
            if (!this.hasCellNearby(cell)) {
                const subscription = cell.subject.subscribe(update => {
                    this.cellsUpdate.next(update);
                });

                this.cellsUpdate.next(cell.getUpdate());

                this.cellsNearby.push({ x: cell.x, y: cell.y, subscription })
            }
        }

        // Unsubscribing to subscribed cells
        this.cellsNearby = this.cellsNearby.filter(cell => {
            const stillNear = find(cellsNear, { x: cell.x, y: cell.y });

            if (stillNear)
                return true;
            
            cell.subscription.unsubscribe();

            return false;
        });

        log.debug(`Cells nearby count ${this.cellsNearby.length}`);
    }

    private hasCellNearby(searchCell: Cell): boolean {
        if (find(this.cellsNearby, { x: searchCell.x, y: searchCell.y })) {
            return true;
        }

        return false;
    }

    static generatePlayerId() {
        let highestId = 0;
    
        for (const id of players.keys()) {
            if (id > highestId) {
                highestId = id;
            }
        }
    
        return ++highestId;
    }
}

interface CellSubscription {
    x: number;
    y: number;
    subscription: Subscription;
}

interface PlayerLocationUpdate {
    x: number;
    y: number;
}