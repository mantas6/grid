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
            const affectDiff = Math.max(amount / 2, 50);

            if (cell.affectContent(name, -affectDiff)) {
                this.affect(name, +affectDiff);
            }
        }

        return true;
    }

    processContent() {
        // Acid is what make the processing of the content possible and it's entirely dependant on this
        const amountTotal = this.usage();
        const amountOfAcid = this.content.c;
        const amountToProcessTotal = amountTotal - amountOfAcid;

        const usableContent = { r: 0, g: 0, b: 0, c: 0, y: 0, m: 0, k: 0 };

        for (const [ name, amount ] of entries(this.content)) {
            if (name == 'c')
                continue;

            if (amount && amountOfAcid > 1) {
                const acidToUse = ceil(amountOfAcid / 10);
                const amountToProcess = ceil(amount * acidToUse / amountToProcessTotal);

                // log.debug(`amountToProcess of ${name} is ${amountToProcess}`);
                
                this.affect('c', -(acidToUse / 10));
                this.affect(name, -amountToProcess);
                usableContent[name] += amountToProcess;
            }
        }

        const hpStat = this.player.get().getStat('hp');
        const staStat = this.player.get().getStat('sta');

        // HP regen
        if (!hpStat.isFull() && usableContent.r && staStat.affectByDiff(-usableContent.r)) {
            hpStat.affectByDiff(usableContent.r, true);
            usableContent.r = 0;
        }

        // Fod
        if (!staStat.isFull() && usableContent.g) {
            staStat.affectByDiff(usableContent.g, true);
            usableContent.g = 0;
        }

        if (usableContent.y) {
            // fodStat.affectMax(usableContent.y);
        }

        if (usableContent.b) {
            staStat.affectMax(usableContent.b);
        }

        if (usableContent.m) {
            this.affect('k', -10 * usableContent.m);
            // hpStat.affectMax(usableContent.m);
        }
    }

    transmuteStats() {
        const player = this.player.get();

        // Stamina regen
        const staStat = player.getStat('sta');
        const hpStat = player.getStat('hp');

        if (staStat.isEmpty()) {
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