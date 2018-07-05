import { Type, Exclude, Expose } from 'class-transformer';
import { values, sum, entries, clamp, round, ceil } from 'lodash';
import { Player } from './player';
import { Cell } from './cell';
import { PlayerRef } from '../utils/ref';
import { Log } from '../utils/log';

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

    processablesOfCell(cell: Cell) {
        const processables: { [name: string]: number } = { c: 0, m: 0, y: 0, k: 0, r: 0, g: 0, b: 0 };

        if (this.content) {
            const content = { ...cell.content };

            const combos = [
                { first: 'm', second: 'y', output: 'r' },
                { first: 'c', second: 'y', output: 'g' },
                { first: 'c', second: 'm', output: 'b' },
            ];

            for (const combo of combos) {
                if (content[combo.first] && content[combo.second]) {
                    const amount = Math.min(content[combo.first], content[combo.second]);

                    if (!processables[combo.output])
                        processables[combo.output] = 0;
    
                    processables[combo.output] += amount * cell.size;
    
                    content[combo.first] -= amount;
                    content[combo.second] -= amount;
                }
            }

            for (const [ name, amount ] of entries(content)) {
                if (!processables[name])
                    processables[name] = 0;
                
                processables[name] += amount * cell.size;
            }
        }

        return processables;
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
        const fodStat = this.player.get().getStat('fod');
        const staStat = this.player.get().getStat('sta');

        // HP regen
        if (!hpStat.isFull() && usableContent.r && fodStat.affectByDiff(-usableContent.r)) {
            hpStat.affectByDiff(usableContent.r, true);
            usableContent.r = 0;
        }

        // Fod
        if (!fodStat.isFull() && usableContent.g) {
            fodStat.affectByDiff(usableContent.g, true);
            usableContent.g = 0;
        }

        if (usableContent.y) {
            fodStat.affectMax(usableContent.y);
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
        const fodStat = player.getStat('fod');
        const hpStat = player.getStat('hp');

        if (!staStat.isFull()) {
            if (fodStat.affectByDiff(-1)) {
                staStat.affectByDiff(1, true);
            }
        }

        if (fodStat.isEmpty() && staStat.isEmpty()) {
            hpStat.affectByDiff(-1, true);
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
    c?: number;
    m?: number;
    y?: number;
    k?: number;
    r?: number;
    g?: number;
    b?: number;
}