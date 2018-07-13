import { Store } from 'vuex';
import Vue from 'vue'
import Vuex from 'vuex'

import { state } from './state'
import { getters } from './getters'
import { mutations } from './mutations'
import { actions } from './actions'

Vue.use(Vuex);

export const store = new Store({ state, mutations, getters, actions, strict: process.env.NODE_ENV !== 'production' })

if (module.hot) {
    module.hot.accept(['./mutations', './state', './getters'], () => {
        const newMutations = require('./mutations').default
        const newState = require('./state').default
        const newGetters = require('./getters').default
        const newActions = require('./actions').default

        store.hotUpdate({ mutations: newMutations, state: newState, getters: newGetters, actions: newActions });
    })
}