<template>
    <b-col cols="6">
        <span class="text-center">{{ stat.name }}</span>
        <div class="small text-center text-secondary">{{ stat.current | formatShort }} / {{ stat.max | formatShort }}</div>
        <b-progress :value="stat.current" :max="stat.max" :variant="variant"></b-progress>
    </b-col>
</template>

<script>
export default {
    props: [ 'stat' ],

     computed: {
        variant() {
            const variants = {
                health: 'danger',
                energy: 'info',
            };

            return variants[this.stat.name];
        }
    },
}
</script>

