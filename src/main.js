// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuex from 'vuex'
import BootstrapVue from "bootstrap-vue"
import App from './App'
import { connect } from "socket.io-client";
import { fromEvent, timer, interval } from "rxjs";
import { VueHammer } from 'vue2-hammer'
import VueHotkey from 'v-hotkey'
import { head, last } from 'lodash';

import { router } from './router'
import { store } from './store'
import { colorByName, nameToDescription, collect } from './method'
import Singleton from './singleton'

const numberformat = require('swarm-numberformat');

//import 'bootstrap/scss/bootstrap.scss'
//import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.use(BootstrapVue);

Vue.use(VueHammer);
Vue.use(VueHotkey);
Vue.filter('formatShort', numberformat.formatShort);
Vue.filter('colorByName', colorByName);
Vue.filter('nameToDescription', nameToDescription);
Vue.filter('head', head);
Vue.filter('last', last);

Vue.config.errorHandler = function(err, vm, info) {
    //console.error(err)
    collect({ name: 'error', attachments: { message: err.stack.toString() } });
}

timer(250, 10000).subscribe(_ => {
    collect();
})

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

fromEvent(socket, 'updateInventory').subscribe(inventory => {
    console.log('updateInventory', inventory);
    commit('updateInventory', inventory)
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

fromEvent(socket, 'teleportCost').subscribe(({ cost }) => {
    console.log('teleportCost', cost);
    commit('updateNearestTeleportCost', cost)
});

fromEvent(socket, 'processableNames').subscribe(names => {
    commit('updateProcessableNames', names)
});