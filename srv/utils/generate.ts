import { range, entries, sample, shuffle, random } from 'lodash';

import { Cell, CellContent } from "../class/cell";
import { InventoryItem } from "../class/inventory";

export class ChunkGenerator {
    constructor() {

    }

    fill(cell: Cell) {
        const chance = random(0, 100);

        if (chance > 80) {
            cell.content = {
                black: random(75, 100),
            };
            cell.size = 1;
        }
    }
}

function generateItem(): InventoryItem {
    return { name: 'c', level: 1 };
}

function generateCellSlab(): CellContent {
    return {
        k: random(75, 100),
    };
}

function generatePureCell(): CellContent {
    const content = {
        c: 0,
        m: 0,
        y: 0,
        k: 0,
    };

    const color = sample(['c', 'm', 'y']);

    content[color] = random(25, 50);

    return content;
}

function generateCellContent(): CellContent {
    return {
        c: random(25, 50),
        m: random(25, 50),
        y: random(25, 50),
        k: random(25, 50),
    };
}