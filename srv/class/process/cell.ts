import { Type, Exclude, Expose } from 'class-transformer';
import { values, sum, entries, clamp, round, ceil, sumBy, find } from 'lodash';
import { Player } from '../player';
import { Cell, CellContent } from '../cell';
import { PlayerRef, CellRef } from '../../utils/ref';
import { Log } from '../../utils/log';
import { grid } from '../../state';
import { Process } from './base';

const log = new Log('process');

export class ProcessCell extends Process {

    @Type(() => CellRef)
    cell: CellRef;

    constructor(parent: Cell) {
        super();
        this.cell = new CellRef().setRef(parent);
    }

    processContent() {
        
    }
    
    update() {
        this.cell.get().update();
    }
}