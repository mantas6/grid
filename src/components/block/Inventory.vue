<template>
    <div>
        <div class="d-flex justify-content-between mb-1">
            <small class="text-secondary">{{ items.length }} / {{ size }}</small>
            <b-button v-show="items.length" size="sm" :variant="modeVariant" @click="toggleMode">{{ mode }}</b-button>
        </div>
        <div class="holder">
            <div class="d-flex">
                <div v-show="!items.length">
                    <small>You have no items</small>
                </div>
                <div v-for="({ name, level }, index) in items" :key="index" class="mr-1">
                    <b-button :variant="modeVariant" @click="itemSelect(index)" :disabled="index == throwItemIndex">
                        <b-badge :style="name | colorByName">+</b-badge>
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
import { colorByName, nameToColor } from '@/method'
import { mapMutations, mapState } from 'vuex'

export default {
    props: [ 'items', 'size' ],

    data() {
        return {
            modeIndex: 0,
            modes: ['use', 'throw', 'drop'],
        };
    },

    computed: {
        ...mapState(['throwItemIndex']),

        modeVariant() {
            const variants = {
                use: 'success',
                throw: 'warning',
                drop: 'danger',
            };

            return variants[this.mode];
        },

        mode() {
            return this.modes[this.modeIndex];
        },
    },

    methods: {
        ...mapMutations(['setThrowItem']),

        itemSelect(index) {
            switch (this.mode) {
                case 'use':
                    this.useItem(index);
                    break;
                case 'drop':
                    this.dropItem(index);
                    break;
                case 'throw':
                    this.throwItem(index);
                    break;
            }
        },

        useItem(index) {
            Singleton.socket.emit('useItem', { index });
        },

        dropItem(index) {
            Singleton.socket.emit('dropItem', { index });
        },

        throwItem(index) {
            this.setThrowItem(index);
        },

        toggleMode() {
            this.modeIndex++;

            if (this.modeIndex >= this.modes.length) {
                this.modeIndex = 0;
            }

            if (this.mode != 'throw') {
                this.setThrowItem(undefined);
            }
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
