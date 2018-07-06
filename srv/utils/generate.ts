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
                dirt: random(75, 100),
            };
            cell.size = 1;
        }
    }
}