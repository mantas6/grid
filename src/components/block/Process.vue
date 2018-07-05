<template>
    <div>
        <div class="d-flex flex-column flex-sm-row justify-content-between">
            <div class="small text-secondary">{{ used | formatShort }} / {{ size | formatShort }} ({{ size - used | formatShort }} free)</div>
            <div class="d-flex">
                <div v-for="(amount, name) in content" :key="name" class="mr-1" v-show="amount">
                    <b-badge :variant="name | variantByColor">+</b-badge>
                    <small>{{ amount | formatShort }}</small>
                </div>
            </div>
        </div>
        <b-progress :max="size">
            <b-progress-bar v-for="(amount, name) in content" :key="name" :value="amount" :variant="name | variantByColor"></b-progress-bar>
        </b-progress>
    </div>
</template>

<script>
import { values, sum } from 'lodash';

export default {
    props: {
        content: { required: true },
        size: { required: true, type: Number },
    },

    computed: {
        used() {
            const amounts = values(this.content);

            return sum(amounts);
        },
    },
}
</script>

