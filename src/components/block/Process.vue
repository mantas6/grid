<template>
    <div>
        <div class="d-flex flex-column flex-sm-row justify-content-between">
            <div class="small text-secondary">{{ used | formatShort }} / {{ size | formatShort }} ({{ size - used | formatShort }} free)</div>
            <div class="d-flex">
                <div v-for="({ amount }, name) in content" :key="name" class="mr-1" v-if="isProcessable(name)" v-show="amount" v-b-popover.hover.top="name" variant="primary">
                    <b-badge :style="name | colorByName">+</b-badge>
                    <small>{{ amount | formatShort }}</small>
                </div>
                <div v-for="({ amount }, name) in content" :key="name" class="mr-1 text-secondary" v-if="!isProcessable(name)" v-show="amount" v-b-popover.hover.top="name" variant="primary">
                    <b-badge :style="name | colorByName">+</b-badge>
                    <small>{{ amount | formatShort }}</small>
                </div>
            </div>
        </div>
        <b-progress :max="size">
            <b-progress-bar v-for="({ amount }, name) in content" :key="name" :value="amount" :style="name | colorByName"></b-progress-bar>
        </b-progress>
    </div>
</template>

<script>
import { values, sumBy, keys } from 'lodash';
import { mapState } from 'vuex'

export default {
    props: {
        content: { required: true },
        size: { required: true, type: Number },
    },

    computed: {
        ...mapState(['processableNames']),

        used() {
            const contents = values(this.content);

            return sumBy(contents, 'amount') || 0;
        },
    },

    methods: {
        isProcessable(name) {
            return this.processableNames.indexOf(name) != -1;
        },
    },
}
</script>

