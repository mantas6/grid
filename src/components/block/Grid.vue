<template>
    <div class="d-flex justify-content-around">
        <div v-for="(lineX, relX) in grid" :key="relX">
            <div v-for="(cell, relY) in lineX" :key="relY" class="mb-1 mr-1">
                <cell :cell="cell"
                    @selectCell="cell.playerId ? attack(cell.x, cell.y) : changePosition(cell.x, cell.y)"
                    :disabled="!actionAvailable || isPlayerAt(cell.x, cell.y) || (!cell.playerId && !cell.occupiable)"
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

    data() {
        return { actionAvailable: true };
    },

    props: {
        map: { required: true },
    },

    computed: {
        ...mapState(['playerId', 'playerLocation']),

        grid() {
            const ordered = orderBy(this.map, ['x', 'y']);

            const grid = [];

            for (const cell of ordered) {
                if (!cell)
                    continue;
                    
                if (!grid[cell.x]) {
                    grid[cell.x] = [];
                }

                grid[cell.x].push(cell);
            }

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
            return this.playerLocation && this.playerX == x && this.playerY == y;
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