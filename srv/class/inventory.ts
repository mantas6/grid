import { Type, Exclude, Expose } from 'class-transformer';
import { head } from 'lodash';
import { Player } from './player';
import { PlayerRef } from '../utils/ref';
import { Log } from '../utils/log';

const log = new Log('inventory');

export class Inventory {
    @Type(() => PlayerRef)
    player: PlayerRef;

    items: InventoryItem[] = [];
    size: number = 10;

    constructor(player: Player) {
        this.player = new PlayerRef().setRef(player);
    }

    hasFreeSlot(): boolean {
        return this.items.length < this.size;
    }

    addItem(item: InventoryItem) {
        this.items.push(item);
        this.update();
    }

    removeItem(index: number): InventoryItem {
        const item = this.items.splice(index, 1);
        this.update();

        return head(item);
    }

    useItem(index: number) {
        const item = this.items[index];

        if (item) {
            switch (item.name) {
                case 'c':
                    this.player.get().process.affect('c', item.level);
                    break;
            }
        }
    }

    update() {
        this.player.get().inventoryUpdate.next(this.getUpdate());
    }

    getUpdate(): InventoryUpdate {
        return { items: this.items, size: this.size };
    }
}

export interface InventoryUpdate {
    items: InventoryItem[];
    size: number;
}

export interface InventoryItem {
    name: string;
    level: number;
}