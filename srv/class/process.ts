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
            this.content[name] = { amount: 0, time: 0 };
        
        if (!this.canBeModified(name, diff)) {
            return false;
        }

        const scale = clamp(diff / Math.max(this.amountOf(name), 1), 0, 1);
        
        this.content[name].amount += scale * diff;
        this.content[name].time += scale * 10;

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
        const acidEff = player.getStat('acidEff').current;
        const amountOfAcid = this.amountOf('acid');

        const healthStat = this.player.get().getStat('health');
        const energyStat = this.player.get().getStat('energy');

        for (const [ name, { amount } ] of entries(this.content)) {
            if (amount) {
                const amountToProcess = processSpeed * acidEff * Math.max(Math.log(amountOfAcid), 1);

                switch(name) {
                    case 'energy':
                        if (!energyStat.isFull() && amountToProcess) {
                            energyStat.affectByDiff(amountToProcess, true);
                        }
                        break;
                }
            }

            this.decrementTime(name);
        }
    }

    decrementTime(name: string) {
        if (this.content[name]) {
            this.content[name].time--;
    
            if (this.content[name].time < 1) {
                delete this.content[name];
            }

            this.update();
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
    [ name: string ]: { amount: number, time: number };
}