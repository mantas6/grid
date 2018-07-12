import { clamp } from 'lodash';
import { Type, Exclude, Expose, Transform } from 'class-transformer';

import { players } from '../state';

import { Player } from './player';
import { PlayerRef } from '../utils/ref';

export class Stat {
    name: string;
    current: number;
    max: number;

    @Type(() => PlayerRef)
    player: PlayerRef;

    constructor(player: Player, name: string) {
        this.name = name;
        this.player = new PlayerRef().setRef(player);
    }

    affectByPercent(percent: number, fill: boolean = false) {
        const diff = this.max * percent;

        this.affectByDiff(diff, fill);
    }
    
    affectByDiff(diff: number, fill: boolean = false) {
        if (this.current + diff < 0 && !fill)
            return false;
        
        if (this.max && this.current + diff > this.max && !fill)
            return false;
        
        this.current = clamp(this.current + diff, 0, this.max || this.current + diff);

        this.update();
    
        return true;
    }

    isFull(): boolean {
        return this.current >= this.max;
    }

    isEmpty(): boolean {
        return this.current < 1;
    }

    affectMax(diff: number) {
        if (!this.max || this.max + diff < 0)
            return false
        
        this.max += diff;
        
        this.update();
        
        return true;
    }

    reset() {
        this.current = this.max;
        this.update();
    }

    update() {
        this.player.get()
            .statsSubject
            .next(this.getUpdate());
    }

    getUpdate() {
        return {
            name: this.name,
            current: this.current,
            max: this.max,
        };
    }
}

export interface StatUpdate {
    name: string;
    current: number;
    max: number;
}