import Vue from "vue";
import { entries } from 'lodash';

export const mutations = {
    mapChange(state, map) {
        state.map = map;
    },

    setGridName(state, name) {
        state.gridName = name;
    },

    mapCellUpdate(state, update) {
        Vue.set(state.map[update.cell.x], update.cell.y, update.cell);
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
};