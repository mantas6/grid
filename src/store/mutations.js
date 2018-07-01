import { entries, find, range } from 'lodash';

export const mutations = {
    updateCell(state, cellUpdate) {
        for (const [i, cell] of state.map.entries()) {
            if (cell.x == cellUpdate.x && cell.y == cellUpdate.y) {
                state.map.splice(i, 1);
                break;
            }
        }

        state.map.push(cellUpdate);
    },

    garbageCollectCells(state) {
        const { x: playerX, y: playerY } = state.playerLocation;

        const cleanMap = [];

        for (const relX of range(-3, 3)) {
            for (const relY of range(-3, 3)) {
                const x = playerX + relX;
                const y = playerY + relY;

                if (!cleanMap[relX]) {
                    cleanMap[relY] = [];
                }

                const cell = find(state.map, { x, y }) || { x, y };

                cleanMap[x].push(cell);
            }
        }

        state.map = cleanMap;
    },

    updatePlayerLocation(state, update) {
        state.playerLocation = update;
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