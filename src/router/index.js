import Vue from 'vue'
import Router from 'vue-router'
import Game from '@/components/route/Game'
import Changelog from '@/components/route/Changelog'

Vue.use(Router)

export const router = new Router({
    routes: [
        {
            path: '/',
            name: 'game',
            component: Game
        },
        {
            path: '/changelog',
            name: 'changelog',
            component: Changelog
        },
    ]
})
