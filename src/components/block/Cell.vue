<template>
    <div>
        <b-button :variant="buttonVariant" :disabled="!enabled" @click="selectCell" :style="style">
            <div class="marker">
                <span v-for="name in additionalContentNames" :key="name" :style="name | colorByName">+</span>
            </div>
            <small v-if="buttonText">{{ buttonText }}</small>
            <b-badge v-else-if="cell.process" variant="light">
                <small>{{ contentSize | formatShort }}</small>
            </b-badge>
        </b-button>
    </div>
</template>

<script>
import { keys, sumBy, head, values, entries } from 'lodash';
import { colorByName, nameToColor } from '@/method'

import { mapState } from 'vuex';

export default {
    props: [ 'cell', 'own', 'enabled', 'mark' ],

    computed: {
        ...mapState(['playerId', 'throwItemIndex']),

        buttonText() {
            if (this.cell.void) {
                return '-';
            }

            if (this.own) {
                return '+';
            }

            if (this.cell.playerId && this.cell.playerId != this.playerId) {
                return '/\\';
            }

            if (this.cell.item) {
                return '$';
            }
        },

        buttonVariant() {
            if (this.cell.void) {
                return 'secondary';
            }

            if (this.own) {
                return 'success';
            }

            if (this.cell.playerId && this.cell.playerId != this.playerId) {
                return 'danger';
            }

            if (this.enabled && this.throwItemIndex !== undefined) {
                return 'outline-warning';
            }

            if (this.enabled) {
                return 'outline-primary';
            }

            return 'outline-secondary';
        },

        contentSize() {
            if (this.cell.process) {
                const items = values(this.cell.process.content);
                
                return sumBy(items, 'amount');
            }

            return 0;
        },

        style() {
            if (this.cell.process) {
                const largestName = this.largestContentName;

                if (largestName) {
                    return colorByName(largestName)

                }
            } else if (this.cell.item) {
                return { color: nameToColor(this.cell.item.name).css() }
            }
        },

        largestContentName() {
            if (this.cell.process) {
                let largestAmount = 0;
                let largestName;

                for (const [ name, { amount } ] of entries(this.cell.process.content)) {
                    if (amount > largestAmount) {
                        largestAmount = amount;
                        largestName = name;
                    }
                }

                return largestName;
            }
        },

        additionalContentNames() {
            if (this.cell.process) {
                const names = keys(this.cell.process.content);

                return names.filter(name => name != this.largestContentName);
            }

            return [];
        },
    },

    methods: {
        selectCell() {
            this.$emit('selectCell');
        },

        cmykToRgb(c, m, y, k) {
            c = (255 * c || 0) / 100;
            m = (255 * m || 0) / 100;
            y = (255 * y || 0) / 100;
            k = (255 * k || 0) / 100;
            
            const r = Math.round(((255 - c)* (255 - k)) / 255);
            const g = Math.round((255 - m) * (255 - k) / 255);
            const b = Math.round((255 - y) * (255 - k) / 255);

            return { r, g, b };
        },
    },
}
</script>

<style lang="scss" scoped>
    @import 'src/scss/mixin';

    .btn {
        width: 50px;
        height: 50px;

        position: relative;

        @include media-breakpoint-down(xs) {
            width: 30px;
            height: 30px;
        }
    }

    .btn.disabled, .btn:disabled {
        opacity: 1;
    }

    .marker {
        position: absolute;
        top: 0;
        left: 0;
    }
</style>
