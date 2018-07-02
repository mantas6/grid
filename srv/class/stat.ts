import { clamp } from 'lodash';
import { Type, Exclude, Expose, Transform } from 'class-transformer';

import { players } from '../state';

import { Player } from './player';

export class Stat {
    name: string;
    current: number;
    max: number;

    @Exclude()
    private _player: Player;
    private _playerRef: number;

    refPlayer(player: Player) {
        this._playerRef = player.id;
    }

    player() {
        if (!this._player) {
            this._player = players.get(this._playerRef);
        }

        return this._player;
    }

    constructor(name: string) {
        this.name = name;
    }

    affectByPercent(percent: number, fill: boolean = false) {
        const diff = this.max * percent;

        this.affectByDiff(diff, fill);
    }
    
    affectByDiff(diff: number, fill: boolean = false) {
        if (this.current + diff < 0 && !fill)
            return false;
        
        if (this.current + diff > this.max && !fill)
            return false;
        
        this.current = clamp(this.current + diff, 0, this.max);

        this.player().statsSubject.next(this.getUpdate());
    
        return true;
    }

    getUpdate() {
        return { name: this.name, current: this.current, max: this.max };
    }
}

export interface StatUpdate {
    name: string;
    current: number;
    max: number;
}