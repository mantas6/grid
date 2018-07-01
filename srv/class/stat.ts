import { clamp } from 'lodash';
import { Type, Exclude, Expose, Transform } from 'class-transformer';

import { Player } from './player';

export class Stat {
    name: string;
    current: number;
    max: number;

    //@Type(() => Player)
    @Exclude()
    player: Player;

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

        this.player.statsSubject.next(this.getUpdate());
    
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