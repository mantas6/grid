import { Type, Exclude, Expose } from 'class-transformer';
import { values, sum, entries, clamp, round, ceil } from 'lodash';
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
        if (this.usage() + diff <= this.size && this.content[name] + diff >= 0) {
            return true;
        }

        return false;
    }

    affect(name: string, diff: number) {
        if (!this.content[name])
            this.content[name] = 0;
        
        if (!this.canBeModified(name, diff)) {
            return false;
        }
        
        this.content[name] += diff;

        this.update();
    }

    usage() {
        const amounts = values(this.content);

        return sum(amounts);
    }

    processContentOfCell(cell: Cell): boolean {
        const content = cell.content;

        if (this.usage() + content.size > this.size) {
            log.debug(`canNotBeAdded`);
            return false;
        }

        for (const [ name, amount ] of entries(cell.content)) {
            const affectDiff = this.player.get().getStat('absorbStrength').current;

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
        const amountOfAcid = this.content.acid || 0;
        const amountToProcessTotal = amountTotal - amountOfAcid;
        const processSpeed = player.getStat('processSpeed').current;
        const acidEff = player.getStat('acidEff').current;

        const healthStat = this.player.get().getStat('health');
        const energyStat = this.player.get().getStat('energy');

        for (const [ name, amount ] of entries(this.content)) {
            if (amount && amountOfAcid > 1) {
                const amountToProcess = processSpeed * acidEff * Math.min(amountOfAcid, 1);
                
                this.affect(name, -amountToProcess);

                switch(name) {
                    case 'energy':
                        if (!energyStat.isFull() && amountToProcess) {
                            energyStat.affectByDiff(amountToProcess, true);
                        }
                        break;
                }
            }
        }
    }

    transmuteStats() {
        const player = this.player.get();

        // Stamina regen
        const enStat = player.getStat('health');
        const hpStat = player.getStat('energy');

        if (enStat.isEmpty()) {
            hpStat.affectByDiff(-1, true);
        }

        // Death handler
        if (hpStat.isEmpty()) {
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

interface ProcessContent extends CellContent {

}