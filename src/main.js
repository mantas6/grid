// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuex from 'vuex'
import BootstrapVue from "bootstrap-vue"
import App from './App'
import { connect } from "socket.io-client";
import { fromEvent } from "rxjs";

import { router } from './router'
import { store } from './store'
import Singleton from './singleton'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import bButton from 'bootstrap-vue/es/components/button/button';
import bProgress from 'bootstrap-vue/es/components/progress/progress';

Vue.use(BootstrapVue)
Vue.component(bButton)
Vue.component(bProgress)

/* eslint-disable no-new */
new Vue({
    el: '#app',
    router, store,
    template: '<App/>',
    components: { App }
})

let url = window.location.host;
console.log(url)
url = url.split(':8080')[0];

console.log(`${url}:3051`)

const socket = connect(`${url}:3051`);

Singleton.setSocket(socket);
Singleton.setStore(store);

fromEvent(socket, 'connect').subscribe(() => {
    store.commit('setConnectionStatus', true);
    console.log('Connection')
    Singleton.login();
});

fromEvent(socket, 'disconnect').subscribe(() => {
    store.commit('setConnectionStatus', false);
    console.log('Disconnected')
});

fromEvent(socket, 'cellUpdate').subscribe(cell => {
    console.log('cellUpdate', { x: cell.x, y: cell.y });
    store.commit('cellUpdate', cell);
});

fromEvent(socket, 'statUpdate').subscribe(({ stat }) => {
    console.log('statUpdate', stat);
    store.commit('updateStat', { stat })
});

fromEvent(socket, 'duplicateSession').subscribe(_ => {
    console.log('duplicate session');
    store.commit('setDuplicateSession', true)
});

fromEvent(socket, 'onlineCount').subscribe(({ count }) => {
    console.log('Online count', count);
    store.commit('updateOnlineCount', count)
});
