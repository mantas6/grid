<template>
    <b-col>
        <h5 class="text-center">{{ stat.name }}</h5>
        <div class="small text-center text-secondary">{{ stat.current | formatShort }} / {{ stat.max | formatShort }}</div>
        <b-progress :value="stat.current" :max="stat.max" :variant="variant">
        </b-progress>
    </b-col>
</template>

<script>
export default {
    props: [ 'stat' ],

    computed: {
        variant() {
            const variants = {
                cyan: 'cyan',
                magenta: 'magenta',
                yellow: 'yellow',
            };

            return variants[this.stat.name];
        }
    },
}
</script>

