<template>
    <div class="d-flex justify-content-center">
        <div class="game">
            <div v-if="map">
                <grid class="grid" :map="map"></grid>
                <process :content="processContent" :size="processSize"></process>
                <b-row>
                    <stat v-for="stat in orderedStats" :stat="stat" :key="stat.name"></stat>
                </b-row>
            </div>
            <h5 v-else>Teleporting to alt. reality...</h5>
            <div class="text-right">Online: {{ onlineCount }}</div>
        </div>
    </div>
</template>

<script>
import Grid from '@/components/block/Grid';
import Stat from '@/components/block/Stat';
import Process from '@/components/block/Process';
import { mapState } from 'vuex';

import { orderBy } from 'lodash';

import Singleton from '@/singleton'

export default {
    components: { Grid, Stat, Process },

    computed: {
        ...mapState(['map', 'stats', 'onlineCount', 'processContent', 'processSize']),

        orderedStats() {
            return orderBy(this.stats, 'name');
        }
    },
};
</script>

<style scoped>
    .game {
        max-width: 500px;
    }
</style>
