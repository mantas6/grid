import { Type, Exclude, Expose } from 'class-transformer';

import { players, grid } from '../state';
import { Player } from '../class/player';
import { Cell } from '../class/cell';

export class Ref<T> {
    @Exclude()
    private isRef: boolean = false;
    @Exclude()
    private ref: T;
    private refPlain;

    constructor() {
        
    }

    setRef(ref: T) {
        if (ref) {
            this.ref = ref;
            this.refPlain = this.unlink(ref);
            this.isRef = true;
        }

        return this;
    }

    get() {
        if (!this.isRef) {
            this.ref = this.link(this.refPlain);
            this.isRef = true;
        }

        return this.ref;
    }

    link(refPlain): T | any {
        
    }

    unlink(ref) {
        
    }
}

export class PlayerRef extends Ref<Player> {
    link(playerId: number) {
        return players.get(playerId);
    }

    unlink(player: Player) {
        return player.id;
    }
}

export class CellRef extends Ref<Cell> {
    link(plainCell: { x: number, y: number }) {
        if (plainCell) {
            return grid.getCell(plainCell.x, plainCell.y);
        }
    }

    unlink(cell: Cell) {
        if (cell) {
            return { x: cell.x, y: cell.y };
        }
    }
}