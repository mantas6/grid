<template>
    <div class="d-flex justify-content-center">
        <div class="game">
            <message></message>
            <div v-if="map.length">
                <grid class="grid" :map="map" @move="movedCount++"></grid>
                <tutorial :moved-count="movedCount"></tutorial>
                <process :content="processContent" :size="processSize"></process>
                <b-row class="mt-2 mb-2">
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
                <b-button variant="danger" @click="suicide">
                    <span v-show="!suicideConfirm">Suicide</span>
                    <span v-show="suicideConfirm">Suicide (click again to commit)</span>
                </b-button>
            </div>
            <h5 v-else>Awaiting map data...</h5>
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
import Tutorial from '@/components/block/Tutorial';
import { mapState } from 'vuex';
import { collect } from '@/method'

import { orderBy } from 'lodash';

import Singleton from '@/singleton'

export default {
    components: { Grid, StatBar, Process, Message, Inventory, Tutorial },

    data() {
        return {
            nightMode: true,
            movedCount: 0,
            suicideConfirm: false,
        };
    },

    computed: {
        ...mapState(['map', 'stats', 'onlineCount', 'processContent', 'processSize', 'inventory', 'inventorySize', 'nearestTeleportCost']),

        orderedStats() {
            return orderBy(this.stats, 'name');
        },
    },

    methods: {
        teleport() {
            collect({ name: 'teleport' });
            Singleton.socket.emit('teleport', {});
        },

        suicide() {
            if (this.suicideConfirm) {
                Singleton.socket.emit('suicide', {});
                this.suicideConfirm = false;
            } else {
                this.suicideConfirm = true;
            }
        },
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
