<template>
    <b-container id="app" class="pt-1 p-sm-3">
        <h3 class="text-center" v-if="!isConnected">Establishing connection...</h3>
        <div class="text-center" v-else-if="isDuplicateSession">
            <h3>Duplicate sessions detected</h3>
            <span class="text-danger">If you have another tab open please check. If not, you can reset your account. Warning: there's no turning back</span>
            <b-button variant="danger" @click="logout">Reset account</b-button>
        </div>
        <router-view v-else></router-view>
    </b-container>
</template>

<script>
    import { mapState, mapMutations } from 'vuex';

    import Singleton from '@/singleton'

    export default {
        name: 'app',

        computed: {
            ...mapState(['isConnected', 'isDuplicateSession']),
        },

        methods: {
            ...mapMutations(['setDuplicateSession']),

            logout() {
                Singleton.logout();
                Singleton.login();
                this.setDuplicateSession(false);
            }
        },
    }
</script>
