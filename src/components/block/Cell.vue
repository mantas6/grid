<template>
    <div>
        <b-button :variant="buttonVariant" :disabled="disabled" @click="selectCell" :style="style">
            <small v-if="buttonText">{{ buttonText }}</small>
            <b-badge v-else-if="cell.content" variant="light">
                <small>{{ contentSize | formatShort }}</small>
            </b-badge>
        </b-button>
    </div>
</template>

<script>
import { keys, sum, head, values } from 'lodash';
import { colorByContent, colorByName } from '@/method'

import { mapState } from 'vuex';

export default {
    props: { cell: Object, own: Boolean, disabled: Boolean },

    computed: {
        ...mapState(['playerId']),

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

            return 'outline-secondary';
        },

        contentSize() {
            const amounts = values(this.cell.content);
            
            return sum(amounts);
        },

        style() {
            if (this.cell.content) {
                const name = head(keys(this.cell.content));
                console.log(name)
                return colorByName(name)
            }
        }
    },

    methods: {
        colorByContent, colorByName,

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

        @include media-breakpoint-down(xs) {
            width: 30px;
            height: 30px;
        }
    }

    .btn.disabled, .btn:disabled {
        opacity: 1;
    }
</style>
