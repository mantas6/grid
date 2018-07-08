import { Type, Exclude, Expose } from 'class-transformer';
import { values, sum, entries, clamp, round, ceil, sumBy, find } from 'lodash';
import { Player } from '../player';
import { Cell } from '../cell';
import { PlayerRef, CellRef } from '../../utils/ref';
import { Log } from '../../utils/log';
import { grid } from '../../state';

const log = new Log('process');

export const processableNames = [
    'energy',
    'energyMax',
    'health',
    'dirt',
    'acid',
];

export class Process {
    size: number = 10000;
    content: ProcessContent = {};

    static isActiveContent(name: string) {
        const processableNames = [
            'energy',
            'energyMax',
            'health',
            'dirt',
            'acid',
        ];

        return processableNames.indexOf(name) != -1;
    }

    createContentItem(name: string) {
        if (!this.content[name]) {
            this.content[name] = {
                amount: 0,
                active: Process.isActiveContent(name),
            };
        }
    }

    affect(name: string, diff: number) {
        this.createContentItem(name);

        const currentAmount = this.content[name].amount;
        
        this.content[name].amount = clamp(currentAmount + diff, 0, this.size);

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
    [ name: string ]: { amount: number, active?: boolean };
}