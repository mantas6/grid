<template>
    <div v-show="message">
        <b-alert dismissible @dismissed="clearMessage" variant="warning">{{ message }}</b-alert>
    </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';

export default {
    data() {
        return {
            dismissSecs: 10,
            dismissCountDown: 0,
        };
    },

    computed: {
        ...mapState(['message'])
    },

    methods: {
        ...mapMutations(['clearMessage'])
    },

    watch: {
        message(from, to) {
            if (to) {
                // this.dismissCountDown = this.dismissSecs;
            }
        },
    },
}
</script>

