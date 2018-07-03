<template>
    <b-col cols="4">
        <span class="text-center">{{ stat.name }}</span>
        <div class="small text-center text-secondary">{{ stat.current | formatShort }} / {{ stat.max | formatShort }}</div>
        <b-progress :value="stat.current" :max="stat.max" :variant="stat.name">
        </b-progress>
    </b-col>
</template>

<script>
export default {
    props: [ 'stat' ],
}
</script>

