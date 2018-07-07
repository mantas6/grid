import { range, entries, sample, shuffle, random } from 'lodash';

import { Cell, CellContent } from "../class/cell";
import { InventoryItem } from "../class/inventory";

export class ChunkGenerator {
    level: number;

    constructor(chunkX: number, chunkY: number) {
        this.level = Math.max(Math.abs(chunkX) + Math.abs(chunkY), 1);
    }

    fill(cell: Cell) {
        const scenarios: CellScenario[] = [
            {
                content: { dirt: random(11, 30) * (this.level * 2) },
                chance: 1/8,
            },
            {
                content: { dirt: random(1, 3) * this.level },
                chance: 1/2,
            },
            {
                content: { acid: random(1, 3) * this.level },
                chance: 1/25,
            },
            {
                content: { energy: random(1, 3) * this.level },
                chance: 1/25,
            },
            {
                content: { energyMax: random(1, 3) * this.level },
                chance: 1/40,
            },
            {
                content: { health: random(1, 3) * this.level },
                chance: 1/40,
            },
            {
                item: { name: 'energy', level: 5  * this.level },
                chance: 1/40,
            },
            {
                item: { name: 'acid', level: 20  * this.level },
                chance: 1/30,
            },
            {
                item: { name: 'acid', level: 50  * this.level },
                chance: 1/80,
            },
            {
                item: { name: 'energyMax', level: 1  * this.level },
                chance: 1/40,
            },
            {
                item: { name: 'absorbStrength', level: 1  * this.level },
                chance: 1/40,
            },
            {
                item: { name: 'processSpeed', level: 1  * this.level },
                chance: 1/40,
            },
        ];

        const shuffledScenarios = shuffle(scenarios);

        const randomNumber = Math.random();

        for (const scenario of shuffledScenarios) {
            if (scenario.chance > randomNumber) {
                const { content, item } = scenario;

                if (content)
                    cell.content = content;
                
                if (item)
                    cell.item = item;
                break;
            }
        }
    }
}

interface CellScenario {
    content?: CellContent;
    item?: InventoryItem;
    chance: number;
}