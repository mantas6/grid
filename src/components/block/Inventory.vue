<template>
    <div>
        <div class="d-flex justify-content-between mb-1">
            <small class="text-secondary">{{ items.length }} / {{ size }}</small>
            <b-button v-show="items.length" size="sm" :variant="dropMode ? 'danger' : 'success'" @click="toggleMode">{{ dropMode ? 'Drop' : 'Use' }}</b-button>
        </div>
        <div class="holder">
            <div class="d-flex">
                <div v-show="!items.length">
                    <small>You have no items</small>
                </div>
                <div v-for="({ name, level }, index) in items" :key="index" class="mr-1">
                    <b-button :variant="dropMode ? 'outline-danger' : 'outline-secondary'" @click="dropMode ? dropItem(index) : useItem(index)">
                        <span>{{ name }}</span>
                        <span>{{ level | formatShort }}</span>
                    </b-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Singleton from '@/singleton'

export default {
    props: [ 'items', 'size' ],

    data() {
        return {
            dropMode: false,
        };
    },

    methods: {
        useItem(index) {
            Singleton.socket.emit('useItem', { index });
        },

        dropItem(index) {
            Singleton.socket.emit('dropItem', { index });
        },

        toggleMode() {
            this.dropMode = !this.dropMode;
        },
    },
}
</script>

<style lang="scss" scoped>
    .holder {
        max-width: 100%;
        overflow-x: scroll;
    }
</style>
