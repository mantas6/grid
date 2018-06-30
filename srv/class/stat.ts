import { clamp } from 'lodash';

import { Player } from './player';

export class Stat {
    name: string;
    current: number;
    max: number;

    player: Player;

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

        this.player.statsSubject.next({ name: this.name, current: this.current, max: this.max });
    
        return true;
    }
}

export interface StatUpdate {
    name: string;
    current: number;
    max: number;
}