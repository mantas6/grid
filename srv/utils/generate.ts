import { range, entries, sample, shuffle, random, sum, values } from 'lodash';

import { Cell } from "../class/cell";
import { ProcessContent, Process } from "../class/process";
import { InventoryItem } from "../class/inventory";

export class ChunkGenerator {
    level: number;

    constructor(chunkX: number, chunkY: number) {
        this.level = Math.max(Math.abs(chunkY), 1);
    }

    fill(cell: Cell) {
        const scenarios = this.getScenario('generic');

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
                    cell.process.size = sum(values(content)) * random(1, 10);
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

    private getScenario(name: string): CellScenario[] {
        const scenarios = {
            generic: [
                {
                    content: { dirt: Math.pow(random(5, 10), this.level) },
                    chance: 1/8,
                },
                {
                    content: { dirt: Math.pow(random(2, 3), this.level) },
                    chance: 1/2,
                },
                {
                    content: { acid: Math.pow(random(2, 4), this.level) },
                    chance: 1/25,
                },
                {
                    content: { energy: Math.pow(random(2, 4), this.level) },
                    chance: 1/10,
                },
                {
                    content: { energyMax: Math.pow(random(2, 3), this.level) },
                    chance: 1/40,
                },
                {
                    content: { healthMax: Math.pow(random(2, 3), this.level) },
                    chance: 1/40,
                },
                {
                    content: { health: Math.pow(random(2, 4), this.level) },
                    chance: 1/40,
                },
                {
                    item: { crystalize: Math.pow(random(3, 4) , this.level) },
                    chance: 1/15,
                },
                {
                    item: { sentry: Math.pow(random(3, 4) , this.level) },
                    chance: 1/30,
                },
                {
                    item: { capacity: Math.pow(random(3, 4) , this.level) },
                    chance: 1/15,
                },
                {
                    item: { grow: Math.pow(random(3, 4) , this.level) },
                    chance: 1/15,
                },
                {
                    item: { damage: Math.pow(random(3, 4) , this.level) },
                    chance: 1/20,
                },
                {
                    item: { weaken: Math.pow(random(3, 4) , this.level) },
                    chance: 1/20,
                },
                {
                    item: { spread: Math.pow(random(3, 4) , this.level) },
                    chance: 1/20,
                },
                {
                    item: { energy: Math.pow(random(3, 4) , this.level) },
                    chance: 1/40,
                },
                {
                    item: { acid: Math.pow(random(3, 4) , this.level) },
                    chance: 1/20,
                },
                {
                    item: { energyMax: Math.pow(random(2, 3) , this.level) },
                    chance: 1/40,
                },
                {
                    item: { healthMax: Math.pow(random(2, 3) , this.level) },
                    chance: 1/40,
                },
                {
                    item: { energy: Math.pow(random(2, 3) , this.level) },
                    chance: 1/20,
                },
                {
                    item: { absorbStrength: Math.pow(random(2, 3) , this.level) },
                    chance: 1/40,
                },
                {
                    item: { absorbEff: Math.pow(random(2, 3) , this.level) },
                    chance: 1/40,
                },
                {
                    item: { processSpeed: Math.pow(random(2, 3) , this.level) },
                    chance: 1/40,
                },
            ],
        };

        return scenarios[name];
    }
}

interface CellScenario {
    content?: { [ name: string ]: number };
    item?: { [ name: string ]: number };
    chance: number;
}