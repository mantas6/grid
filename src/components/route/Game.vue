<template>
    <div class="d-flex justify-content-center">
        <div class="game">
            <div v-if="map">
                <h5 class="text-center">{{ gridName }}</h5>
                <grid class="grid" :map="map"></grid>
                <div>
                    <b-button @click="changeGrid">Transcend</b-button>
                    <b-button @click="reset">Suicide</b-button>
                </div>
                <div class="row">
                    <stat v-for="stat in orderedStats" :stat="stat" :key="stat.name"></stat>
                </div>
            </div>
            <h5 v-else>Teleporting to alt. reality...</h5>
        </div>
    </div>
</template>

<script>
import Grid from '@/components/block/Grid';
import Stat from '@/components/block/Stat';
import { mapState } from 'vuex';

import { orderBy } from 'lodash';

import Singleton from '@/singleton'

export default {
    components: { Grid, Stat },

    computed: {
        ...mapState(['map', 'stats', 'gridName']),

        orderedStats() {
            return orderBy(this.stats, 'name');
        }
    },

    methods: {
        changeGrid() {
            Singleton.socket.emit('changeGrid');
        },

        reset() {
            Singleton.socket.emit('reset');
        }
    },
};
</script>

<style scoped>
    .game {
        max-width: 500px;
    }
</style>
