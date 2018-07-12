import { Type, Exclude, Expose } from 'class-transformer';
import { values, sum, entries, clamp, round, ceil, sumBy, find, shuffle, keys } from 'lodash';
import { Player } from './player';
import { Cell } from './cell';
import { PlayerRef, CellRef } from '../utils/ref';
import { Log } from '../utils/log';
import { grid } from '../state';

const log = new Log('process');

export const processableNames = [
    'energy',
    'energyMax',
    'healthMax',
    'health',
    'dirt',
    'spread',
    'crystalize',
    'weaken',
    'damage',
    'grow',
    'capacity',
    'acid',
    'sentry',
];

export class Process {
    size: number = 100;
    content: ProcessContent = {};

    @Type(() => PlayerRef)
    player: PlayerRef;

    @Type(() => CellRef)
    cell: CellRef;

    active: boolean = false;

    constructor(parent: Player | Cell) {
        if (parent instanceof Player) {
            this.player = new PlayerRef().setRef(parent);
        } else if(parent instanceof Cell) {
            this.cell = new CellRef().setRef(parent);
        }
    }

    static isActiveContent(name: string) {
        return processableNames.indexOf(name) != -1;
    }

    processContent() {
        const amountTotal = this.usage();
        // Acid is what make the processing of the content possible and it's entirely dependant on this
        // const amountOfAcid = this.content.acid.amount || 0;
        // const amountToProcessTotal = amountTotal - amountOfAcid;
        const processSpeed = this.amountOf('processSpeed') + 1;

        let countAffected = 0;

        for (const [ name, { amount } ] of entries(this.content)) {
            if (!Process.isActiveContent(name))
                continue;

            const amountOfAcid = this.amountOf('acid');

            if (amount >= 1) {
                const amountToProcess = Math.min(processSpeed, amount);

                // console.log({processSpeed, amountOfAcid})
                
                if (amountToProcess) {
                    let affected = false;

                    if (this.player) {
                        affected = this.processPlayerEffect(name, amountToProcess);
                    } else if(this.cell) {
                        affected = this.processCellEffect(name, amountToProcess);
                    }

                    if (!affected) {
                        affected = this.processCellGeneric(name, amountToProcess);
                    }

                    if (affected) {
                        this.affect(name, -1 * amountToProcess);
                        countAffected++;
                    }
                }
            }

        }

        if (countAffected > 0) {
            this.active = true;
        } else {
            this.active = false;
        }
    }

    private processPlayerEffect(name: string, amountToProcess: number): boolean {
        const player = this.player.get();
        const healthStat = player.getStat('health');
        const energyStat = player.getStat('energy');

        switch(name) {
            case 'energy':
                if (!energyStat.isFull()) {
                    energyStat.affectByDiff(amountToProcess, true);
                }
                return true;
            case 'energyMax':
                energyStat.affectMax(amountToProcess);
                return true;
            case 'healthMax':
                healthStat.affectMax(amountToProcess);
                return true;
            case 'health':
                if (!healthStat.isFull() && healthStat.affectByDiff(amountToProcess)) {
                    return true;
                }
                return false;
            case 'damage':
                healthStat.affectByDiff(-amountToProcess);
                return true;
            case 'weaken':
                if (energyStat.affectByDiff(-amountToProcess)) {
                    return true;
                }
                return false;
            case 'capacity':
                this.size += amountToProcess;
                this.update();
                return true;
        }
    }

    private processCellEffect(name: string, amountToProcess: number): boolean {
        const cell = this.cell.get();
        switch(name) {
            case 'spread':
                const closeCells = cell.neighbors(1);

                const contentsToSpread = keys(this.content);

                for (const closeCell of shuffle(closeCells)) {
                    for (const name of contentsToSpread) {
                        const affected = cell.affectContent(name, -1 * amountToProcess);
                        if (affected) {
                            closeCell.affectContent(name, Math.min(amountToProcess, -1 * affected));
                        }
                    }
                    return true;
                }
                return false;
            case 'crystalize':
                const amountOfAffector = this.amountOf('crystalize');
                if (amountOfAffector >= this.usage() - amountOfAffector) {
                    this.affect('crystalize', -amountOfAffector);
                    cell.clearContent();
                    cell.addItem(this.content);
                    return true;
                }
                return false;
            case 'sentry':
                for (const closeCell of shuffle(cell.neighbors())) {
                    if (closeCell.player) {
                        const contentsToSpread = entries(this.content);
                        for (const [ name ] of contentsToSpread) {
                            if (name == 'sentry') continue;
                            const affected = cell.affectContent(name, -1 * amountToProcess);
                            if (affected) {
                                const affectedTarget = closeCell.affectContent(name, -1 * affected);

                                log.debug(`Sentry: Found player in cell ${closeCell.toString()} affected ${affectedTarget} by process ${-1 * affected}`);
                            }
                        }
                        return true;
                    }
                }
                return false;
        }
    }

    private processCellGeneric(name: string, amountToProcess: number): boolean {
        switch(name) {
            case 'capacity':
                this.size += amountToProcess;
                this.update();
                return true;
            case 'acid':
                for (const name of shuffle(keys(this.content))) {
                    if (!Process.isActiveContent(name) || name == 'acid') continue;

                    if (this.affect(name, -amountToProcess)) {
                        return true;
                    }
                }
                return false;
            case 'grow':
                for (const name of shuffle(keys(this.content))) {
                    if (name == 'grow') continue;

                    this.affect(name, amountToProcess);

                    return true;
                }
        }
    }
 
    createContentItem(name: string) {
        if (!this.content[name]) {
            this.content[name] = { amount: 0 };
        }
    }

    clearProcessables() {
        for (const name of keys(this.content)) {
            if (Process.isActiveContent(name)) {
                delete this.content[name];
                this.update();
            }
        }
    }

    affect(name: string, diff: number): number {
        this.createContentItem(name);

        const currentAmount = this.content[name].amount;

        const affected = clamp(currentAmount + diff, 0, this.size - (this.usage() - this.amountOf(name)));
        
        this.content[name].amount = affected;

        if (this.content[name].amount < 1) {
            delete this.content[name];
        }

        this.update();

        return -1 * (currentAmount - affected);
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
        const affectDiff = this.amountOf('absorbStrength') + 1;

        if (this.usage() + affectDiff > this.size) {
            log.debug(`canNotBeAdded`);
            return false;
        }

        for (const [ name, amount ] of entries(cell.process.content)) {
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