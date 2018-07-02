<template>
    <div>
        <b-button :variant="buttonVariant" :disabled="disabled" @click="selectCell" :style="style">{{ buttonText }}</b-button>
    </div>
</template>

<script>
export default {
    props: { cell: Object, own: Boolean, disabled: Boolean },

    computed: {
        buttonText() {
            if (this.own) {
                return '+';
            }
        },

        buttonVariant() {
            if (this.cell.void) {
                return 'secondary';
            }

            if (this.own) {
                return 'outline-success';
            }

            return 'outline-secondary';
        },

        style() {
            if (!this.cell.colors || this.own) {
                return {};
            }
            const { c, m, y } = this.cell.colors;
            const { r, g, b } = this.cmyk_to_rgb2(c, m, y, 0);

            return {
                backgroundColor: `rgb(${r}, ${g}, ${b})`,
            };
        },
    },

    methods: {
        selectCell() {
            this.$emit('selectCell');
        },

        cmyk_to_rgb2(c, m, y, k) {
            c = (255 * c) / 100;
            m = (255 * m) / 100;
            y = (255 * y) / 100;
            k = (255 * k) / 100;
            
            const r = Math.round(((255 - c)* (255 - k)) / 255);
            const g = Math.round((255 - m) * (255 - k) / 255);
            const b = Math.round((255 - y) * (255 - k) / 255);

            return { r, g, b };
        },
    },
}
</script>

<style scoped>
    .btn {
        width: 50px;
        height: 50px;
    }
</style>
