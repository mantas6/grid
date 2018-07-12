<template>
    <div class="d-flex justify-content-center">
        <div class="game">
            <message></message>
            <div v-if="map.length">
                <grid class="grid" :map="map" @move="movedCount++"></grid>
                <b-alert variant="primary" :show="movedCount < 3">
                    <span class="d-md-none">Swipe on the grid to move</span>
                    <span class="d-none d-md-block">Click on arrows or use WASD to move</span>
                </b-alert>
                <process :content="processContent" :size="processSize"></process>
                <b-row>
                    <stat-bar v-for="stat in orderedStats" v-if="stat.max" :stat="stat" :key="stat.name"></stat-bar>
                </b-row>
                <inventory :items="inventory" :size="inventorySize"></inventory>
                <div title="Collect teleport points to teleport" v-b-tooltip.hover>
                    <b-button v-if="nearestTeleportCost"
                        class="w-100 mt-1"
                        @click="teleport"
                        :disabled="!processContent.teleport || processContent.teleport.amount < nearestTeleportCost"
                        variant="danger">
                        Teleport to the nearest player <b-badge>{{ nearestTeleportCost | formatShort }}</b-badge>
                    </b-button>
                </div>
            </div>
            <h5 v-else>Teleporting to alt. reality...</h5>
            <div class="text-right">Online: {{ onlineCount }}</div>
            <b-form-checkbox v-model="nightMode">Night mode</b-form-checkbox>
        </div>
    </div>
</template>

<script>
import Grid from '@/components/block/Grid';
import StatBar from '@/components/block/StatBar';
import Process from '@/components/block/Process';
import Message from '@/components/block/Message';
import Inventory from '@/components/block/Inventory';
import { mapState } from 'vuex';

import { orderBy } from 'lodash';

import Singleton from '@/singleton'

export default {
    components: { Grid, StatBar, Process, Message, Inventory },

    data() {
        return {
            nightMode: true,
            movedCount: false,
        };
    },

    computed: {
        ...mapState(['map', 'stats', 'onlineCount', 'processContent', 'processSize', 'inventory', 'inventorySize', 'nearestTeleportCost']),

        orderedStats() {
            return orderBy(this.stats, 'name');
        }
    },

    methods: {
        teleport() {
            Singleton.socket.emit('teleport', {});
        }
    },

    watch: {
        nightMode(isEnabled) {
            if (isEnabled) {
                document.body.classList.add('night-mode');
            } else {
                document.body.classList.remove('night-mode');
            }
        },
    },
};
</script>

<style lang="scss" scoped>
    @import 'src/scss/mixin';

    .game {
        max-width: 500px;

        @include media-breakpoint-down(xs) {
            max-width: auto;
            width: 100%;
        }
    }
</style>
