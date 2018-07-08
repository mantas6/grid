import { Type, Exclude, Expose } from 'class-transformer';
import { values, sum, entries, clamp, round, ceil, sumBy, find } from 'lodash';
import { Cell } from '../cell';
// import { CellRef } from './../../utils/ref';
import { Log } from '../../utils/log';
import { Process } from './base';
import { grid } from '../../state';

const log = new Log('process');

export class ProcessCell extends Process {

    @Type(() => CellRef)
    cell: CellRef;

    constructor(parent: Cell) {
        super();
        //process.exit(0);
        this.cell = new CellRef().setRef(parent);
    }

    processContent() {
        const processSpeed = this.amountOf('processSpeed') + 1;

        for (const [ name, { amount, active } ] of entries(this.content)) {
            if (!active || name == 'acid')
                continue;

            const amountOfAcid = this.amountOf('acid');
            const cell = this.cell.get();

            if (amount >= 1 && amountOfAcid >= 1) {
                const amountToProcess = Math.min(processSpeed, amountOfAcid); //Math.log(amountOfAcid);

                this.affect(name, -1 * amountToProcess);
                this.affect('acid', -1 * amountToProcess);

                switch(name) {
                    case 'spread':
                        const closeCells = cell.neighbors(1);

                        const contentsToSpread = entries(this.content);

                        for (const closeCell of closeCells) {
                            for (const [ name, content ] of contentsToSpread) {
                                cell.affectContent(name, -amountToProcess);
                                closeCell.affectContent(name, +amountToProcess);
                            }
                        }
                        break;
                }
            }
        }
    }
    
    update() {
        this.cell.get().update();
    }
}

export class Ref<T> {
    @Exclude()
    private isRef: boolean = false;
    @Exclude()
    private ref: T;
    private refPlain;

    constructor() {
        
    }

    setRef(ref: T) {
        if (ref) {
            this.ref = ref;
            this.refPlain = this.unlink(ref);
            this.isRef = true;
        }

        return this;
    }

    get() {
        if (!this.isRef) {
            this.ref = this.link(this.refPlain);
            this.isRef = true;
        }

        return this.ref;
    }

    link(refPlain): T | any {
        
    }

    unlink(ref) {
        
    }
}

export class CellRef extends Ref<Cell> {
    link(plainCell: { x: number, y: number }) {
        if (plainCell) {
            return grid.getCell(plainCell.x, plainCell.y);
        }
    }

    unlink(cell: Cell) {
        if (cell) {
            return { x: cell.x, y: cell.y };
        }
    }
}