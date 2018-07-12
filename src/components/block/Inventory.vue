<template>
    <div>
        <div class="d-flex justify-content-between mb-1">
            <small class="text-secondary">{{ items.length }} / {{ size }}</small>
            <div v-show="items.length">
                <small class="text-secondary">Click to {{ modes.filter(m => m != mode).join(' or ') }}</small>
                <b-button size="sm" :variant="modeVariant" @click="toggleMode">{{ mode }}</b-button>
            </div>
        </div>
        <div class="holder">
            <div class="d-flex">
                <div v-show="!items.length">
                    <small>You have no items</small>
                </div>
                <div v-for="(item, index) in items" :key="index" class="mr-1">
                    <b-button :variant="modeVariant" @click="itemSelect(index)" :disabled="index == throwItemIndex" @mouseover="hoverName = largestContentName(item)" @mouseout="hoverName = undefined">
                        <b-badge v-for="({ amount }, name) in item" :key="name" :style="name | colorByName">
                            <span class="text-dark">{{ amount | formatShort }}</span>
                        </b-badge>
                        <span>{{ largestContentName(item) | startCase }}</span>
                    </b-button>
                </div>
            </div>
        </div>
        <div class="info text-primary small text-center">{{ hoverName | nameToDescription }}</div>
    </div>
</template>

<script>
import Singleton from '@/singleton'
import { colorByName, nameToColor, nameToDescription } from '@/method'
import { mapMutations, mapState } from 'vuex'
import { entries, startCase } from 'lodash'

export default {
    props: [ 'items', 'size' ],

    filters: { startCase },

    data() {
        return {
            modeIndex: 0,
            modes: ['use', 'throw', 'drop'],
            hoverName: undefined,
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
        nameToDescription,
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

        largestContentName(item) {
            let largestAmount = 0;
                let largestName;

                for (const [ name, { amount } ] of entries(item)) {
                    if (amount > largestAmount) {
                        largestAmount = amount;
                        largestName = name;
                    }
                }

                return largestName;
        },
    },

    watch: {
        items(to) {
            if (!to.length) {
                this.modeIndex = 0;
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

    .info {
        min-height: 20px;
    }
</style>
