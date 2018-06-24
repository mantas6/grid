<template>
    <div id="app" class="p-3">
        <h3 class="text-center" v-if="!isConnected">Establishing connection...</h3>
        <h3 class="text-center" v-else-if="isDuplicateSession">Duplicate sessions detected</h3>
        <router-view v-else></router-view>
    </div>
</template>

<script>
    import { mapState } from 'vuex';

    export default {
        name: 'app',

        computed: {
            ...mapState(['isConnected', 'isDuplicateSession']),
        },
    }
</script>
