import { range, entries, sample, shuffle, random, sum, values } from 'lodash';

import { Cell } from "../class/cell";
import { ProcessContent, Process } from "../class/process";
import { InventoryItem } from "../class/inventory";

export class ChunkGenerator {
    level: number;

    scenarioName: string;

    constructor(chunkX: number, chunkY: number) {
        this.level = Math.abs(chunkY) + 1;

        this.scenarioName = this.rollScenario();
    }

    fill(cell: Cell) {
        const shuffledScenarios = shuffle(this.scenario(this.scenarioName));

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
                    cell.process.size = sum(values(content)) * random(10, 30);
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

    private rollScenario() {
        const shuffledScenarios = shuffle(entries(this.scenarios()));

        const randomNumber = Math.random();

        for (const [ name, scenario ] of shuffledScenarios) {
            if (scenario.chance > randomNumber && (!scenario.minLevel || scenario.minLevel <= this.level)) {
                return name;
            }
        }
    }

    private scenario(name: string): CellScenario[] {
        const scenarios = this.scenarios();

        return scenarios[name].scenarios;
    }

    private scenarios(): ChunkScenarioMap {
        return  {
            generic: {
                chance: 1,
                scenarios: [
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
                        chance: 1/5,
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
            },
            slab: {
                chance: 1/5,
                minLevel: 2,
                scenarios: [
                    {
                        content: { dirt: Math.pow(random(5, 20), this.level) },
                        chance: 1,
                    },
                ],
            },
            trapped: {
                chance: 1/10,
                minLevel: 3,
                scenarios: [
                    {
                        content: { damage: Math.pow(random(6, 20), this.level) },
                        chance: 9/10,
                    },
                    {
                        content: { absorbEff: Math.pow(random(3, 6), this.level) },
                        chance: 1/40,
                    },
                    {
                        content: { absorbStrength: Math.pow(random(3, 6), this.level) },
                        chance: 1/40,
                    },
                ],
            },
        };
    }
}

interface ChunkScenarioMap {
    [ name: string ]: ChunkScenario;
}

interface ChunkScenario {
    scenarios: CellScenario[];
    chance: number;
    minLevel?: number;
}

interface CellScenario {
    content?: { [ name: string ]: number };
    item?: { [ name: string ]: number };
    chance: number;
}