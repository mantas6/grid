import { Subject, Subscription } from 'rxjs';

import { Cell } from './cell';
import { Stat, StatUpdate } from './stat';
import { grid, players } from '../state';
import { Log } from '../log';
import { Socket } from 'socket.io';

const log = new Log('player');

export class Player {
    id: number;
    token: string;

    cell: Cell;

    stats: Stat[];

    statsSubject = new Subject<StatUpdate>();
    
    locationSubject = new Subject<PlayerLocationUpdate>();
    locationSubscription: Subscription;

    cellsNearby: CellSubscription[] = [];

    client: Socket;

    constructor() {

    }

    logOn(client: Socket) {
        this.client = client;

        this.locationSubscription = this.locationSubject.subscribe(update => {
            client.emit('updatePlayerLocation', update);
        });
    }

    logOff() {
        this.client = undefined;
        for (const cell of this.cellsNearby) {
            cell.subscription.unsubscribe();
        }

        this.locationSubscription.unsubscribe();

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

    private updateCellsNearby() {
        const cells = this.cell.neighbors();

        for (const cell of cells) {
            if (!this.hasCellNearby(cell)) {
                const subscription = cell.subject.subscribe(update => {
                    this.client.emit('cellUpdate', update);
                });

                this.client.emit('cellUpdate', cell.getUpdate());
    
                this.cellsNearby.push({ x: cell.x, y: cell.y, subscription })
            }
        }
    }

    private hasCellNearby(searchCell: Cell): boolean {
        for (const cell of this.cellsNearby) {
            if (cell.x == searchCell.x && cell.y == searchCell.y) {
                return true;
            }
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