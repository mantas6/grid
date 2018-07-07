import { range, entries, sample, shuffle, random } from 'lodash';

import { Cell, CellContent } from "../class/cell";
import { InventoryItem } from "../class/inventory";

export class ChunkGenerator {
    constructor() {

    }

    fill(cell: Cell) {
        const scenarios: CellScenario[] = [
            {
                content: { dirt: random(750, 1000) },
                density: random(1200, 2000),
                chance: 1/10,
            },
            {
                content: { dirt: random(100, 300) },
                density: random(100, 500),
                chance: 1/2,
            },
            {
                content: { acid: random(100, 300) },
                density: random(10, 50),
                chance: 1/25,
            },
            {
                content: { energy: random(100, 300) },
                density: random(10, 50),
                chance: 1/25,
            },
            {
                item: { name: 'energy', level: 20 },
                chance: 1/20,
            },
        ];

        const shuffledScenarios = shuffle(scenarios);

        const randomNumber = Math.random();

        for (const scenario of shuffledScenarios) {
            if (scenario.chance > randomNumber) {
                const { content, density, item } = scenario;

                if (content)
                    cell.content = content;
                
                if (density)
                    cell.density = density;
                
                if (item)
                    cell.item = item;
                break;
            }
        }
    }
}

interface CellScenario {
    content?: CellContent;
    density?: number;
    item?: InventoryItem;
    chance: number;
}