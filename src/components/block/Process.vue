<template>
    <div>
        <div class="small text-center text-secondary">{{ used | formatShort }} / {{ size | formatShort }} ({{ size - used | formatShort }} free)</div>
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

