import { Type, Exclude, Expose } from 'class-transformer';
import { values, sum, entries } from 'lodash';
import { Player } from './player';
import { Cell } from './cell';
import { PlayerRef } from '../utils/ref';

export class Process {
    size: number = 100;
    content: {[name: string]: number} = {};

    @Type(() => PlayerRef)
    player: PlayerRef;

    constructor(player: Player) {
        this.player = new PlayerRef().setRef(player);
    }

    canBeAdded(amount: number) {
        if (this.usage() + amount <= this.size) {
            return true;
        }

        return false;
    }

    add(name: string, amount: number) {
        this.content[name] += amount;

        this.update();
    }

    usage() {
        const amounts = values(this.content);

        return sum(amounts);
    }

    processablesOfCell(cell: Cell) {
        const processables: { [name: string]: number } = { c: 0, m: 0, y: 0, k: 0, r: 0, g: 0, b: 0 };

        if (this.content) {
            const content = { ...cell.content };

            const combos = [
                { first: 'm', second: 'y', output: 'r' },
                { first: 'c', second: 'y', output: 'g' },
                { first: 'c', second: 'm', output: 'b' },
            ];

            for (const combo of combos) {
                if (content[combo.first] && content[combo.second]) {
                    const amount = Math.max(content[combo.first], content[combo.second]);

                    if (!processables[combo.output])
                        processables[combo.output] = 0;
    
                    processables[combo.output] += amount;
    
                    content[combo.first] -= amount;
                    content[combo.second] -= amount;
                }
            }

            for (const [ name, amount ] of entries(content)) {
                if (!processables[name])
                    processables[name] = 0;
                
                processables[name] += amount;
            }
        }

        return processables;
    }

    update() {
        this.player.get().processUpdate.next(this.getUpdate());
    }

    getUpdate(): ProcessUpdate {
        return { content: this.content, size: this.size };
    }
}

export interface ProcessUpdate {
    content: { [ name: string ]: number };
    size: number;
}