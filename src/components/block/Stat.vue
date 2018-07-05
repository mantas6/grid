<template>
    <b-col cols="4">
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
                fod: 'success',
                hp: 'danger',
                hyd: 'primary',
                sta: 'info',
            };

            return variants[this.stat.name];
        }
    },
}
</script>

