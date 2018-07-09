import { Type, Exclude, Expose } from 'class-transformer';
import { values, sum, entries, clamp, round, ceil, sumBy, find, shuffle, keys } from 'lodash';
import { Player } from './player';
import { Cell } from './cell';
import { PlayerRef, CellRef } from '../utils/ref';
import { Log } from '../utils/log';
import { grid } from '../state';

const log = new Log('process');

export class Process {
    size: number = 10000;
    content: ProcessContent = {};

    @Type(() => PlayerRef)
    player: PlayerRef;

    @Type(() => CellRef)
    cell: CellRef;

    constructor(parent: Player | Cell) {
        if (parent instanceof Player) {
            this.player = new PlayerRef().setRef(parent);
        } else if(parent instanceof Cell) {
            this.cell = new CellRef().setRef(parent);
        }
    }

    static isActiveContent(name: string) {
        const processableNames = [
            'energy',
            'energyMax',
            'health',
            'dirt',
            'spread',
            'crystalize',
            'weaken',
            'damage',
            'grow',
        ];

        return processableNames.indexOf(name) != -1;
    }

    processContent() {
        const amountTotal = this.usage();
        // Acid is what make the processing of the content possible and it's entirely dependant on this
        // const amountOfAcid = this.content.acid.amount || 0;
        // const amountToProcessTotal = amountTotal - amountOfAcid;
        const processSpeed = this.amountOf('processSpeed') + 1;

        for (const [ name, { amount } ] of entries(this.content)) {
            if (!Process.isActiveContent(name))
                continue;

            const amountOfAcid = this.amountOf('acid');

            if (amount >= 1 && amountOfAcid >= 1) {
                const amountToProcess = Math.min(processSpeed, amountOfAcid); //Math.log(amountOfAcid);

                // console.log({processSpeed, amountOfAcid})
                
                if (amountToProcess) {
                    let affected = false;

                    if (this.player) {
                        affected = this.processPlayerEffect(name, amountToProcess);
                    } else if(this.cell) {
                        affected = this.processCellEffect(name, amountToProcess);
                    }

                    if (affected) {
                        this.affect(name, -1 * amountToProcess);
                        this.affect('acid', -1 * amountToProcess);
                    }
                }
            }
        }
    }

    private processPlayerEffect(name: string, amountToProcess: number): boolean {
        const player = this.player.get();
        const healthStat = player.getStat('health');
        const energyStat = player.getStat('energy');

        switch(name) {
            case 'energy':
                if (!energyStat.isFull() && amountToProcess) {
                    energyStat.affectByDiff(amountToProcess, true);
                }
                return true;
            case 'energyMax':
                energyStat.affectMax(amountToProcess);
                return true;
            case 'health':
                healthStat.affectByDiff(amountToProcess);
                return true;
            case 'damage':
                healthStat.affectByDiff(-amountToProcess);
                return true;
            case 'weaken':
                energyStat.affectByDiff(-amountToProcess);
                return true;
        }
    }

    private processCellEffect(name: string, amountToProcess: number): boolean {
        const cell = this.cell.get();
        switch(name) {
            case 'spread':
                const closeCells = cell.neighbors(1);

                const contentsToSpread = entries(this.content);

                for (const closeCell of shuffle(closeCells)) {
                    for (const [ name, content ] of contentsToSpread) {
                        const affected = cell.affectContent(name, -1 * amountToProcess);
                        if (affected) {
                            closeCell.affectContent(name, Math.min(amountToProcess, +affected));
                        }
                    }
                    break;
                }
                return true;
            case 'crystalize':
                const amountOfAffector = this.amountOf('crystalize');
                if (amountOfAffector >= this.usage() - amountOfAffector) {
                    this.affect('crystalize', -amountOfAffector);
                    cell.clearContent();
                    cell.addItem(this.content);
                }
                return true;
            case 'grow':
                for (const name of keys(this.content)) {
                    if (name == 'acid' || name == 'grow') continue;

                    this.affect(name, amountToProcess);
                }
                return true;
        }
    }
 
    createContentItem(name: string) {
        if (!this.content[name]) {
            this.content[name] = { amount: 0 };
        }
    }

    affect(name: string, diff: number): number {
        this.createContentItem(name);

        const currentAmount = this.content[name].amount;

        const affected = clamp(currentAmount + diff, 0, this.size);
        
        this.content[name].amount = affected;

        if (this.content[name].amount < 1) {
            delete this.content[name];
        }

        this.update();

        return affected;
    }

    usage() {
        const amounts = values(this.content);

        return sumBy(amounts, 'amount') || 0;
    }

    amountOf(name: string) {
        if (!this.content[name])
            return 0;
        
        return this.content[name].amount;
    }

    processContentOfCell(cell: Cell): boolean {
        if (this.usage() + cell.process.usage() > this.size) {
            log.debug(`canNotBeAdded`);
            return false;
        }

        for (const [ name, amount ] of entries(cell.process.content)) {
            const affectDiff = this.amountOf('absorbStrength') + 1;

            if (cell.affectContent(name, -affectDiff)) {
                this.affect(name, +affectDiff);
            }
        }

        return true;
    }

    update() {
        if (this.cell) {
            this.cell.get().update();
        } else if(this.player) {
            this.player.get().processUpdate.next(this.getUpdate());
        }
    }

    getUpdate(): ProcessUpdate {
        return { content: this.content, size: this.size };
    }
}

export interface ProcessUpdate {
    content: ProcessContent;
    size: number;
}

export interface ProcessContent {
    [ name: string ]: { amount: number };
}