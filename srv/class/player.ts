import { Subject, Subscription, from } from 'rxjs';
import { bufferTime, bufferCount, filter } from 'rxjs/operators';
import { find, entries } from 'lodash';
import { Socket } from 'socket.io';
import { Type, Exclude, Expose } from 'class-transformer';

import { Cell, CellUpdate } from './cell';
import { Stat, StatUpdate } from './stat';
import { grid, players } from '../state';
import { Log } from '../utils/log';

import { CellRef } from '../utils/ref';

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

    statsSubject = new Subject<StatUpdate>();
    
    locationSubject = new Subject<PlayerLocationUpdate>();

    cellsNearby: CellSubscription[] = [];
    cellsUpdate = new Subject<CellUpdate>();

    client: Socket;

    constructor() {
        
    }
    
    static create(id: number) {
        const player = new Player();

        player.id = id;

        for (const statName of ['b', 'g', 'r', 'c', 'm', 'y', 'k']) {
            const stat = new Stat(player, statName);
            stat.max = 100;
            stat.current = 0;

            player.stats.push(stat);
        }

        return player;
    }

    logOn(client: Socket) {
        this.statsSubject = new Subject<StatUpdate>();
        this.locationSubject = new Subject<PlayerLocationUpdate>();
        this.cellsUpdate = new Subject<CellUpdate>();

        this.client = client;

        this.locationSubject.subscribe(update => {
            client.emit('updatePlayerLocation', update);
        });

        this.statsSubject.subscribe(update => {
            client.emit('updateStat', update);
        });

        this.cellsUpdate.pipe(
            bufferTime(50),
            filter(updates => !!updates.length)
        )
        .subscribe(updates => {
            client.emit('cellsUpdate', updates);
        });

        for (const stat of this.stats) {
            this.statsSubject.next(stat.getUpdate());
        }
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

        this.cellsNearby = [];
    }

    assignCell(cell: Cell) {
        log.debug(`Assigning player to cell ${cell.toString()}`);

        if (this.cell.get()) {
            this.cell.get().unassignPlayer();
        }

        this.cell.setRef(cell);

        if (!this.cell.get().isOccupiable() && !this.cell.get().isAbsorbable()) {
            throw new Error(`Failed to assign player to cell. It's already occupied. ${cell.toString()} playerId=${this.id}`);
        }

        this.absorbCell();

        this.cell.get().assignPlayer(this);

        this.updateCellsNearby();

        this.locationSubject.next({ x: cell.x, y: cell.y });
    }

    absorbCell() {
        const cell = this.cell.get();

        if (cell.content) {
            const stats = cell.toStats();

            for (const stat of stats) {
                this.getStat(stat.name).affectByDiff(stat.value, true);
            }

            cell.clearContent();
        }
    }

    getStat(name: string): Stat {
        return find(this.stats, { name });
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