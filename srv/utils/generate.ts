import { range, entries, sample, shuffle, random } from 'lodash';

import { Cell } from "../class/cell";
import { ProcessContent, Process } from "../class/process";
import { InventoryItem } from "../class/inventory";

export class ChunkGenerator {
    level: number;

    constructor(chunkX: number, chunkY: number) {
        this.level = Math.max(Math.abs(chunkX) + Math.abs(chunkY), 1);
    }

    fill(cell: Cell) {
        const scenarios: CellScenario[] = [
            {
                content: { dirt: random(11, 300) * (this.level * 2) },
                chance: 1/8,
            },
            {
                content: { dirt: random(1, 3) * this.level },
                chance: 1/2,
            },
            {
                content: { acid: random(1, 6) * this.level },
                chance: 1/25,
            },
            {
                content: { energy: random(1, 20) * this.level },
                chance: 1/15,
            },
            {
                content: { energyMax: random(1, 3) * this.level },
                chance: 1/40,
            },
            {
                content: { health: random(1, 20) * this.level },
                chance: 1/40,
            },
            {
                item: { crystalize: random(10, 20)  * this.level },
                chance: 1/10,
            },
            {
                item: { damage: random(10, 20)  * this.level },
                chance: 1/10,
            },
            {
                item: { weaken: random(10, 20)  * this.level },
                chance: 1/10,
            },
            {
                item: { spread: random(10, 20)  * this.level },
                chance: 1/10,
            },
            {
                item: { energy: random(10, 20)  * this.level },
                chance: 1/40,
            },
            {
                item: { acid: random(10, 20)  * this.level },
                chance: 1/10,
            },
            {
                item: { acid: random(10, 20)  * this.level },
                chance: 1/80,
            },
            {
                item: { energyMax: random(1, 2)  * this.level },
                chance: 1/40,
            },
            {
                item: { absorbStrength: random(1, 2)  * this.level },
                chance: 1/40,
            },
            {
                item: { absorbEff: random(1, 2)  * this.level },
                chance: 1/40,
            },
            {
                item: { processSpeed: random(1, 2)  * this.level },
                chance: 1/40,
            },
        ];

        const shuffledScenarios = shuffle(scenarios);

        const randomNumber = Math.random();

        for (const scenario of shuffledScenarios) {
            if (scenario.chance > randomNumber) {
                const { content, item } = scenario;

                if (content) {
                    const processContent: ProcessContent = {};

                    for (const [ name, amount ] of entries(content)) {
                        processContent[name] = { amount };
                    }
                    
                    cell.initializeContent(processContent);
                }
                
                if (item) {
                    const processContent: ProcessContent = {};

                    for (const [ name, amount ] of entries(item)) {
                        processContent[name] = { amount };
                    }

                    cell.item = processContent;
                }
                break;
            }
        }
    }
}

interface CellScenario {
    content?: { [ name: string ]: number };
    item?: { [ name: string ]: number };
    chance: number;
}