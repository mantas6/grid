<template>
    <div class="d-flex justify-content-around">
        <div v-for="(lineX, x) in map" :key="x">
            <div v-for="(cell, y) in lineX" :key="y" class="mb-1 mr-1">
                <cell :cell="cell"
                    @selectCell="cell.playerId ? attack(x, y) : changePosition(x, y)"
                    :disabled="!actionAvailable || isPlayerAt(x, y) || (!cell.playerId && !cell.occupiable)"
                    :own="isPlayerAt(x, y)">
                </cell>
            </div>
        </div>
    </div>
</template>

<script>
import Cell from '@/components/block/Cell';
import { mapState } from 'vuex';
import { timer } from 'rxjs';
import { entries, orderBy } from 'lodash';

import Singleton from '@/singleton'

export default {
    components: { Cell },

    data() {
        return { actionAvailable: true };
    },

    props: {
        map: { required: true },
    },

    computed: {
        ...mapState(['playerId']),

        grid() {
            const ordered = orderBy(this.map, 'x', 'asc');

            const grid = [];

            for (const cellX of ordered) {
                const cellsOfX = ordered.filter(cell => cell.x == cellX.x);
                const cellsOfXOrdered = orderBy(cellsOfX, 'y', 'asc');

                if (!grid[cellX.x]) {
                    grid[cellX.x] = [];
                }

                grid[cellX.x].push(...cellsOfXOrdered);
            }
        },

        playerX() {
            return this.playerCell && this.playerCell.x;
        },

        playerY() {
            return this.playerCell && this.playerCell.y;
        },

        playerCell() {
            for (const [x, lineX] of entries(this.map)) {
                for (const [y, cell] of entries(lineX)) {
                    if (cell.playerId === this.playerId) {
                        return cell;
                    }
                }
            }
        },
    },

    methods: {
        isPlayerAt(x, y) {
            return this.playerCell && this.playerX == x && this.playerY == y;
        },

        changePosition(x, y) {
            console.log('changePosition', { x, y });
            Singleton.socket.emit('changePosition', { x, y });

            this.pauseActions();
        },

        attack(x, y) {
            console.log('attack', { x, y });
            Singleton.socket.emit('attack', { x, y });

            this.pauseActions();
        },

        pauseActions() {
            this.actionAvailable = false;

            timer(1000).subscribe(_ => this.actionAvailable = true);
        }
    },
}
</script>