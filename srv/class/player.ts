import { Subject, Subscription } from 'rxjs';
import { find } from 'lodash';
import { Socket } from 'socket.io';
import { Type, Exclude, Expose } from 'class-transformer';

import { Cell } from './cell';
import { Stat, StatUpdate } from './stat';
import { grid, players } from '../state';
import { Log } from '../utils/log';

const log = new Log('player');

@Exclude()
export class Player {
    @Expose()
    id: number;

    @Expose()
    token: string;

    cell: Cell;

    @Type(() => Stat)
    @Expose()
    stats: Stat[] = [];

    statsSubject = new Subject<StatUpdate>();
    statsSubscription: Subscription;
    
    locationSubject = new Subject<PlayerLocationUpdate>();
    locationSubscription: Subscription;

    cellsNearby: CellSubscription[] = [];

    client: Socket;

    constructor(id: number) {
        this.id = id;

        const stat = new Stat('magic');
        stat.max = 100;
        stat.current = 100;
        stat.refPlayer(this);

        this.stats.push(stat);
    }

    logOn(client: Socket) {
        this.client = client;

        this.locationSubscription = this.locationSubject.subscribe(update => {
            client.emit('updatePlayerLocation', update);
        });

        this.statsSubscription = this.statsSubject.subscribe(update => {
            client.emit('updateStat', update);
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

        this.locationSubscription.unsubscribe();
        this.statsSubscription.unsubscribe();

        this.cellsNearby = [];
    }

    assignCell(cell: Cell) {
        log.debug(`Assigning player to cell ${cell.toString()}`);

        if (this.cell) {
            this.cell.unassignPlayer();
        }

        this.cell = cell;

        if (!this.cell.isOccupiable()) {
            throw new Error(`Failed to assign player to cell. It's already occupied. ${cell.toString()} playerId=${this.id}`);
        }

        this.cell.assignPlayer(this);

        this.updateCellsNearby();

        this.locationSubject.next({ x: cell.x, y: cell.y });
    }

    getStat(name: string): Stat {
        return find(this.stats, { name });
    }

    private updateCellsNearby() {
        const cellsNear = this.cell.neighbors();

        // Subscribing to unsubscribed cells
        for (const cell of cellsNear) {
            if (!this.hasCellNearby(cell)) {
                const subscription = cell.subject.subscribe(update => {
                    this.client.emit('cellUpdate', update);
                });

                this.client.emit('cellUpdate', cell.getUpdate());
    
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