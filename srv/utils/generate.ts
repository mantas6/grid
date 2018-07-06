import { range, entries, sample, shuffle, random } from 'lodash';

import { Cell, CellContent } from "../class/cell";
import { InventoryItem } from "../class/inventory";

export class ChunkGenerator {
    constructor() {

    }

    fill(cell: Cell) {
        const chance = random(0, 100);

        if (chance > 95) {
            cell.content = {
                dirt: random(750, 1000),
            };
            cell.density = random(1200, 2000);
        } else if (chance > 91) {
            cell.content = {
                acid: random(75, 100),
            };
            cell.density = random(200, 400);
        } else if (chance > 90) {
            cell.content = {
                energy: random(75, 100),
            };
            cell.density = random(200, 400);
        } else if (chance > 80) {
            cell.content = {
                dirt: random(75, 100),
            };
            cell.density = random(200, 400);
        }
    }
}