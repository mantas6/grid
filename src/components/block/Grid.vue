<template>
    <div class="d-flex justify-content-around" v-hammer:swipe="moveDirection">
        <div v-for="(lineX, relX) in grid" :key="relX">
            <div v-for="(cell, relY) in lineX" :key="relY" class="mb-1 mr-1">
                <cell :cell="cell"
                    @selectCell="cell.playerId ? attack(cell.x, cell.y) : changePosition(cell.x, cell.y)"
                    :disabled="isPlayerAt(cell.x, cell.y) || (!isCellReachable(cell.x, cell.y) && !cell.isAbsorbable)"
                    :own="isPlayerAt(cell.x, cell.y)">
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

    props: {
        map: { required: true },
    },

    computed: {
        ...mapState(['playerId', 'playerLocation']),

        grid() {
            const ordered = orderBy(this.map, ['x', 'y']);

            const grid = [];

            let viewX = -1;
            let gridX = undefined;

            for (const cell of ordered) {
                if (cell.x !== gridX) {
                    viewX++;
                    gridX = cell.x;
                }

                if (!grid[viewX]) {
                    grid[viewX] = [];
                }

                grid[viewX].push(cell);
            }

            // console.log(grid)

            return grid;
        },

        playerX() {
            return this.playerLocation && this.playerLocation.x;
        },

        playerY() {
            return this.playerLocation && this.playerLocation.y;
        },
    },

    methods: {
        isPlayerAt(x, y) {
            return this.playerX == x && this.playerY == y;
        },

        isCellReachable(x, y) {
            if (this.measureDistance(this.playerLocation, { x, y }) == 1) {
                return true;
            }

            return false;
        },

        changePosition(x, y) {
            console.log('changePosition', { x, y });
            Singleton.socket.emit('changePosition', { x, y });
        },

        moveDirection({ direction }) {
            const coords = {
                16: { x: this.playerX, y: this.playerY - 1 },
                8: { x: this.playerX, y: this.playerY + 1 },
                4: { x: this.playerX - 1, y: this.playerY },
                2: { x: this.playerX + 1, y: this.playerY },
            };

            const { x, y } = coords[direction];

            this.changePosition(x, y);
        },

        measureDistance(a, b) {
            return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
        },
    },
}
</script>