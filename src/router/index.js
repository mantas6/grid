import Vue from 'vue'
import Router from 'vue-router'
import Game from '@/components/route/Game'

Vue.use(Router)

export const router = new Router({
    routes: [
        {
            path: '/',
            name: 'Game',
            component: Game
        }
    ]
})
