<template>
    <div>
        <b-button :variant="buttonVariant" :disabled="disabled" @click="selectCell" :style="style">
            <small v-if="buttonText">{{ buttonText }}</small>
            <small class="text-light" v-else-if="cell.content">{{ contentSize | formatShort }}</small>
        </b-button>
    </div>
</template>

<script>
import { values, sum } from 'lodash';

export default {
    props: { cell: Object, own: Boolean, disabled: Boolean },

    computed: {
        buttonText() {
            if (this.cell.void) {
                return '-';
            }

            if (this.cell.isInvisible) {
                return '?';
            }

            if (this.own) {
                return '+';
            }
        },

        buttonVariant() {
            if (this.cell.void || this.cell.isInvisible) {
                return 'secondary';
            }

            if (this.own) {
                return 'outline-success';
            }

            return 'outline-secondary';
        },

        style() {
            if (!this.cell.content || this.own) {
                return {};
            }
            const { c, m, y, k } = this.cell.content;
            const { r, g, b } = this.cmykToRgb(c / this.cell.size, m / this.cell.size, y / this.cell.size, k / this.cell.size);

            return {
                backgroundColor: `rgb(${r}, ${g}, ${b})`,
            };
        },

        contentSize() {
            const amounts = values(this.cell.content);
            
            return sum(amounts) * this.cell.size;
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
    @import '~bootstrap/scss/bootstrap-reboot.scss';
    .btn {
        width: 50px;
        height: 50px;

        @include media-breakpoint-down(xs) {
            width: 30px;
            height: 30px;
        }
    }
</style>
