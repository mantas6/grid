// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuex from 'vuex'
import BootstrapVue from "bootstrap-vue"
import App from './App'
import { connect } from "socket.io-client";
import { fromEvent } from "rxjs";
import { VueHammer } from 'vue2-hammer'

import { router } from './router'
import { store } from './store'
import Singleton from './singleton'

const numberformat = require('swarm-numberformat');

//import 'bootstrap/scss/bootstrap.scss'
//import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.use(BootstrapVue);

Vue.use(VueHammer);
Vue.filter('formatShort', numberformat.formatShort)

/* eslint-disable no-new */
new Vue({
    el: '#app',
    router, store,
    template: '<App/>',
    components: { App },
})

let url = window.location.host;
console.log(url)
url = url.split(':8080')[0];

console.log(`${url}:3051`)

const socket = connect(`${url}:3051`);

Singleton.setSocket(socket);
Singleton.setStore(store);

const { commit } = store;

fromEvent(socket, 'connect').subscribe(() => {
    commit('setConnectionStatus', true);
    console.log('Connection')
    Singleton.login();
});

fromEvent(socket, 'disconnect').subscribe(() => {
    commit('setConnectionStatus', false);
    console.log('Disconnected')
});

fromEvent(socket, 'cellsUpdate').subscribe(cells => {
    console.log('cellUpdate', cells);

    for (const cell of cells) {
        commit('updateCell', cell);
    }
});

fromEvent(socket, 'updatePlayerLocation').subscribe(cell => {
    console.log('updatePlayerLocation', { x: cell.x, y: cell.y });
    commit('updatePlayerLocation', cell);
    commit('garbageCollectCells');
});

fromEvent(socket, 'updateStats').subscribe(stats => {
    for (const stat of stats) {
        console.log('statUpdate', stat);
        commit('updateStat', stat)
    }
});

fromEvent(socket, 'updateProcess').subscribe(process => {
    console.log('updateProcess', process);
    commit('updateProcess', process)
});

fromEvent(socket, 'duplicateSession').subscribe(_ => {
    console.log('duplicate session');
    commit('setDuplicateSession', true)
});

fromEvent(socket, 'onlineCount').subscribe(({ count }) => {
    console.log('Online count', count);
    commit('updateOnlineCount', count)
});
