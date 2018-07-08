<template>
    <div>
        <div class="d-flex flex-column flex-sm-row justify-content-between">
            <div class="small text-secondary">{{ used | formatShort }} / {{ size | formatShort }} ({{ size - used | formatShort }} free)</div>
            <div class="d-flex">
                <div v-for="({ amount, active }, name) in content" :key="name" class="mr-1" v-show="amount" v-b-popover.hover.top="name" variant="primary">
                    <b-badge :style="name | colorByName">+</b-badge>
                    <small :class="{ 'text-secondary': !active }">{{ amount | formatShort }}</small>
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

export default {
    props: {
        content: { required: true },
        size: { required: true, type: Number },
    },

    computed: {
        used() {
            const contents = values(this.content);

            return sumBy(contents, 'amount') || 0;
        },
    },
}
</script>

