<template>
    <div>
        <small class="text-secondary">{{ items.length }} / {{ size }}</small>
        <div class="d-flex">
            <div v-show="!items.length">
                <small>You have no items</small>
            </div>
            <div v-for="({ name, level }, index) in items" :key="index">
                <b-button variant="outline-secondary" @click="useItem(index)">
                    <span>{{ name }}</span>
                    <span>{{ level | formatShort }}</span>
                </b-button>
            </div>
        </div>
    </div>
</template>

<script>
import Singleton from '@/singleton'

export default {
    props: [ 'items', 'size' ],

    methods: {
        useItem(index) {
            Singleton.socket.emit('useItem', { index });
        }
    },
}
</script>
