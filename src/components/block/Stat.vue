<template>
    <b-col>
        <h5 class="text-center">{{ stat.name }}</h5>
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
                magic: 'primary',
            };

            return variants[this.stat.name];
        }
    },
}
</script>

