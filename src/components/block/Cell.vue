<template>
    <div>
        <div :id="`cell-${relX}-${relY}`">
            <b-button :variant="buttonVariant" :disabled="!enabled" @click="selectCell" :style="style" :class="{ empty: !buttonText && !mark }">
                <div class="marker">
                    <span v-for="name in additionalContentNames" :key="name" :style="name | colorByName">+</span>
                </div>
                <small v-if="buttonText">{{ buttonText }}</small>
                <b-badge v-else-if="cell.process" variant="light">
                    <small>{{ contentSize | formatShort }}</small>
                </b-badge>
                <b class="arrow" v-else-if="directionName" v-html="`&#${directionSymbol};`"></b>
            </b-button>
        </div>
        <b-popover triggers="hover" placement="top" :target="`cell-${relX}-${relY}`" :show.sync="showInfo">
            <div v-for="({ amount }, name) in content" :key="name">
                <b-badge :style="name | colorByName">{{ amount | formatShort }}</b-badge>
                <span>{{ name }}</span>
            </div>
        </b-popover>
    </div>
</template>

<script>
import { keys, sumBy, head, values, entries } from 'lodash';
import { colorByName, nameToColor } from '@/method'

import { mapState, mapGetters } from 'vuex';

export default {
    data() {
        return {
            showInfo: false,
        };
    },

    props: [ 'cell', 'own', 'enabled', 'mark', 'directionName', 'relX' , 'relY' ],

    computed: {
        ...mapState(['playerId', 'throwItemIndex']),
        ...mapGetters(['playerX', 'playerY']),

        buttonText() {
            if (this.own) {
                return `Me`;
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
            if (this.content) {
                const items = values(this.content);
                
                return sumBy(items, 'amount');
            }

            return 0;
        },

        style() {
            if (this.content) {
                const largestName = this.largestContentName;

                if (largestName) {
                    if (this.cell.item) {
                        return colorByName(largestName, true)
                    } else {
                        return colorByName(largestName)
                    }
                }
            } 
        },

        largestContentName() {
            if (this.content) {
                let largestAmount = 0;
                let largestName;

                for (const [ name, { amount } ] of entries(this.content)) {
                    if (amount > largestAmount) {
                        largestAmount = amount;
                        largestName = name;
                    }
                }

                return largestName;
            }
        },

        additionalContentNames() {
            if (this.content) {
                const names = keys(this.content);

                return names.filter(name => name != this.largestContentName);
            }

            return [];
        },

        content() {
            if (this.cell.process) {
                return this.cell.process.content;
            } else if(this.cell.item) {
                return this.cell.item;
            }
        },

        directionSymbol() {
            switch (this.directionName) {
                case 'up':
                    return 8593;
                case 'down':
                    return 8595;
                case 'left':
                    return 8592;
                case 'right':
                    return 8594;
            }
        },
    },

    methods: {
        selectCell() {
            this.$emit('selectCell');
        },
    },

    watch: {
        playerX() {
            this.showInfo = false;
        },
        playerY() {
            this.showInfo = false;
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

    .btn.empty {
        border: none;
    }

    @include media-breakpoint-up(sm) {
        .arrow {
            font-size: 150%;
        }
    }

    
</style>
