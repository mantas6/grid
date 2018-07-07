import { Type, Exclude, Expose } from 'class-transformer';
import { values, sum, entries, clamp, round, ceil, sumBy } from 'lodash';
import { Player } from './player';
import { Cell, CellContent } from './cell';
import { PlayerRef } from '../utils/ref';
import { Log } from '../utils/log';
import { grid } from '../state';

const log = new Log('process');

export class Process {
    size: number = 10000;
    content: ProcessContent = {};

    @Type(() => PlayerRef)
    player: PlayerRef;

    constructor(player: Player) {
        this.player = new PlayerRef().setRef(player);
    }

    canBeModified(name: string, diff: number) {
        if (this.usage() + diff <= this.size) {
            if (this.content[name] && this.content[name].amount + diff >= 0) {
                return true;
            } else if(diff >= 0) {
                return true;
            }
        }

        return false;
    }

    affect(name: string, diff: number) {
        if (!this.content[name])
            this.content[name] = { amount: 0 };
        
        if (!this.canBeModified(name, diff)) {
            return false;
        }
        
        this.content[name].amount += diff;

        this.update();
    }

    usage() {
        const amounts = values(this.content);

        return sumBy(amounts, 'value') || 0;
    }

    amountOf(name: string) {
        if (!this.content[name])
            return 0;
        
        return this.content[name].amount;
    }

    processContentOfCell(cell: Cell): boolean {
        const content = cell.content;

        if (this.usage() + content.size > this.size) {
            log.debug(`canNotBeAdded`);
            return false;
        }

        const contentTotalAmount = sum(values(cell.content));

        for (const [ name, amount ] of entries(cell.content)) {
            const affectDiff = this.player.get().getStat('absorbStrength').current; // TOdo

            if (cell.affectContent(name, -affectDiff)) {
                this.affect(name, +affectDiff);
            }
        }

        return true;
    }

    processContent() {
        const player = this.player.get();
        const amountTotal = this.usage();
        // Acid is what make the processing of the content possible and it's entirely dependant on this
        // const amountOfAcid = this.content.acid.amount || 0;
        // const amountToProcessTotal = amountTotal - amountOfAcid;
        const processSpeed = player.getStat('processSpeed').current;

        const healthStat = player.getStat('health');
        const energyStat = player.getStat('energy');
        const absorbStrengthStat = player.getStat('absorbStrength');
        const processSpeedStat = player.getStat('processSpeed');

        for (const [ name, { amount } ] of entries(this.content)) {
            if (name == 'acid')
                continue;

            const amountOfAcid = this.amountOf('acid');

            if (amount >= 1 && amountOfAcid >= 1) {
                const amountToProcess = Math.min(processSpeed, amountOfAcid); //Math.log(amountOfAcid);

                // console.log({processSpeed, amountOfAcid})
                
                if (amountToProcess) {
                    this.affect(name, -1 * amountToProcess)

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
                        case 'absorbStrength':
                            absorbStrengthStat.affectByDiff(amountToProcess);
                            break;
                        case 'processSpeed':
                            processSpeedStat.affectByDiff(amountToProcess);
                            break;
                        case 'health':
                            healthStat.affectByDiff(amountToProcess);
                            break;
                    }
                }
            }
        }
    }

    transmuteStats() {
        const player = this.player.get();

        // Stamina regen
        const energyStat = player.getStat('energy');
        const healthStat = player.getStat('health');

        // Death handler
        if (healthStat.isEmpty()) {
            this.player.get().initialize();
            this.player.get().assignCell(grid.findCellOccupiable());
            this.player.get().updateAll();
        }
    }

    update() {
        this.player.get().processUpdate.next(this.getUpdate());
    }

    getUpdate(): ProcessUpdate {
        return { content: this.content, size: this.size };
    }
}

export interface ProcessUpdate {
    content: ProcessContent;
    size: number;
}

interface ProcessContent {
    [ name: string ]: { amount: number };
}