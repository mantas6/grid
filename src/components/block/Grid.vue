<template>
    <div class="d-flex justify-content-center" v-hammer:swipe="moveBySwipe" v-hotkey="keymap">
        <div v-for="(lineX, relX) in grid" :key="relX">
            <div v-for="(cell, relY) in lineX" :key="relY" class="mb-1 mr-1">
                <cell :cell="cell"
                    @selectCell="changePosition(cell.x, cell.y)"
                    :enabled="!isPlayerAt(cell.x, cell.y) && ((isCellReachable(cell.x, cell.y) && (cell.isAbsorbable || cell.isOccupiable)) || isThrowableTo(cell.x, cell.y))"
                    :mark="isCellReachable(cell.x, cell.y) || isThrowableTo(cell.x, cell.y)"
                    :own="isPlayerAt(cell.x, cell.y)"
                    :direction-name="directionName(cell.x, cell.y)"
                    :rel-x="relX"
                    :rel-y="relY">
                </cell>
            </div>
        </div>
    </div>
</template>

<script>
import Cell from '@/components/block/Cell';
import { mapState, mapActions, mapGetters, mapMutations } from 'vuex';
import { timer } from 'rxjs';
import { entries, orderBy } from 'lodash';

import Singleton from '@/singleton'

export default {
    components: { Cell },

    props: {
        map: { required: true },
    },

    computed: {
        ...mapGetters(['playerX', 'playerY']),
        ...mapState(['playerId', 'playerLocation', 'throwItemIndex']),

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

        keymap() {
            return {
                w: this.moveUp,
                s: this.moveDown,
                a: this.moveLeft,
                d: this.moveRight,
            };
        },
    },

    methods: {
        ...mapActions(['moveDirection']),
        ...mapMutations(['setThrowItem']),

        isPlayerAt(x, y) {
            return this.playerX == x && this.playerY == y;
        },

        directionName(x, y) {
            const coords = {
                up: { x: this.playerX, y: this.playerY - 1 },
                down: { x: this.playerX, y: this.playerY + 1 },
                left: { x: this.playerX - 1, y: this.playerY },
                right: { x: this.playerX + 1, y: this.playerY },
            };

            for (const [ name, { x: targetX, y: targetY } ] of entries(coords)) {
                if (targetX == x && targetY == y) {
                    return name;
                }
            }
        },

        isCellReachable(x, y) {
            if (this.measureDistance(this.playerLocation, { x, y }) == 1) {
                return true;
            }

            return false;
        },

        isThrowableTo(x, y) {
            const distance = this.measureDistance(this.playerLocation, { x, y });

            return this.throwItemIndex !== undefined && (distance == 1 || distance == 2 || distance == 3);
        },

        changePosition(x, y) {
            this.$emit('move');
            console.log('changePosition', { x, y, throwItemIndex: this.throwItemIndex });
            if (this.throwItemIndex !== undefined) {
                console.log('Throwing')
                Singleton.socket.emit('throwPosition', { x, y, throwItemIndex: this.throwItemIndex });
                this.setThrowItem(undefined);
            } else {
                Singleton.socket.emit('changePosition', { x, y });
            }
        },

        moveBySwipe({ direction }) {
            this.$emit('move');
            const coords = { 16: 'up', 8: 'down', 4: 'left', 2: 'right' };

            if (coords[direction]) {
                this.moveDirection(coords[direction]);
            }
        },

        moveUp() {
            this.moveDirection('up');
            this.$emit('move');
        },

        moveDown() {
            this.moveDirection('down');
            this.$emit('move');
        },

        moveLeft() {
            this.moveDirection('left');
            this.$emit('move');
        },

        moveRight() {
            this.moveDirection('right');
            this.$emit('move');
        },

        measureDistance(a, b) {
            return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
        },
    },
}
</script>