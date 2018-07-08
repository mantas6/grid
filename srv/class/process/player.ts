import { Type, Exclude, Expose } from 'class-transformer';
import { values, sum, entries, clamp, round, ceil, sumBy, find } from 'lodash';
import { Player } from '../player';
import { PlayerRef, CellRef } from '../../utils/ref';
import { Log } from '../../utils/log';
import { grid } from '../../state';
import { Process } from './base';

const log = new Log('process');

export class ProcessPlayer extends Process {
    @Type(() => PlayerRef)
    player: PlayerRef;

    constructor(parent: Player) {
        super();
        this.player = new PlayerRef().setRef(parent);
    }

    processContent() {
        const player = this.player.get();
        const amountTotal = this.usage();
        // Acid is what make the processing of the content possible and it's entirely dependant on this
        // const amountOfAcid = this.content.acid.amount || 0;
        // const amountToProcessTotal = amountTotal - amountOfAcid;
        const processSpeed = this.amountOf('processSpeed') + 1;

        const healthStat = player.getStat('health');
        const energyStat = player.getStat('energy');

        for (const [ name, { amount, active } ] of entries(this.content)) {
            if (!active || name == 'acid')
                continue;

            const amountOfAcid = this.amountOf('acid');

            if (amount >= 1 && amountOfAcid >= 1) {
                const amountToProcess = Math.min(processSpeed, amountOfAcid); //Math.log(amountOfAcid);

                // console.log({processSpeed, amountOfAcid})
                
                if (amountToProcess) {
                    this.affect(name, -1 * amountToProcess);

                    this.affect('acid', -1 * amountToProcess);

                    switch(name) {
                        case 'energy':
                            if (!energyStat.isFull() && amountToProcess) {
                                energyStat.affectByDiff(amountToProcess, true);
                            }
                            break;
                        case 'energyMax':
                            energyStat.affectMax(amountToProcess);
                            break;
                        case 'health':
                            healthStat.affectByDiff(amountToProcess);
                            break;
                    }
                }
            }
        }
    }
    
    update() {
        this.player.get().processUpdate.next(this.getUpdate());
    }
}