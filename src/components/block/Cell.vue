<template>
    <div>
        <b-button :variant="buttonVariant" :disabled="disabled" @click="selectCell">{{ buttonText }}</b-button>
    </div>
</template>

<script>
export default {
    props: { cell: Object, own: Boolean, disabled: Boolean },

    computed: {
        buttonText() {
            const variants = {
                void: ' ',
                player: this.own ? 'Me' : String(this.cell.strength),
                healthPotion: 'H',
                magicPotion: 'M',
                grave: 'G',
            };

            return variants[this.cell.type] || '?';
        },

        buttonVariant() {
            const variants = {
                player: this.own ? 'success' : 'danger',
                healthPotion: 'warning',
                magicPotion: 'warning',
                grave: 'bg-dark',
            };

            return variants[this.cell.type] || 'outline-secondary';
        },
    },

    methods: {
        selectCell() {
            this.$emit('selectCell');
        }
    },
}
</script>

<style scoped>
    .btn {
        width: 50px;
        height: 50px;
    }
</style>
