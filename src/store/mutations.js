import Vue from "vue";
import { entries } from 'lodash';

export const mutations = {
    cellUpdate(state, cell) {
        if (!state.map[cell.x]) {
            Vue.set(state.map, cell.x, {});
        }
        Vue.set(state.map[cell.x], cell.y, cell);
    },

    updatePlayerId(state, id) {
        state.playerId = id;
    },

    setConnectionStatus(state, isConnected) {
        state.isConnected = isConnected;
    },

    setDuplicateSession(state, isDuplicateSession) {
        state.isDuplicateSession = isDuplicateSession;
    },

    updateStat(state, update) {
        for (const [index, stat] of entries(state.stats)) {
            if (stat.name == update.stat.name) {
                state.stats.splice(index, 1);
                break;
            }
        }

        state.stats.push(update.stat);
    },

    updateOnlineCount(state, count) {
        state.onlineCount = count;
    },
};