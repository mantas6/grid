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