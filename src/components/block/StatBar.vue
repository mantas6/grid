<template>
    <b-col cols="6">
        <span class="text-center">{{ stat.name | startCase }}</span>
        <div class="small text-center text-secondary">{{ stat.current | formatShort }} / {{ stat.max | formatShort }}</div>
        <b-progress :value="stat.current" :max="stat.max" :variant="variant"></b-progress>
    </b-col>
</template>

<script>
import { startCase } from 'lodash'

export default {
    props: [ 'stat' ],

    filters: { startCase },

     computed: {
        variant() {
            const variants = {
                health: 'danger',
                energy: 'success',
            };

            return variants[this.stat.name];
        }
    },
}
</script>

