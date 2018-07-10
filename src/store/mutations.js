import { entries, find, range } from 'lodash';

export const mutations = {
    updateCell(state, cellUpdate) {
        for (const [i, cell] of state.map.entries()) {
            if (cell.x == cellUpdate.x && cell.y == cellUpdate.y) {
                state.map.splice(i, 1);
                console.log('Updating existing cell', [cell.x, cell.y])
                break;
            }
        }

        state.map.push(cellUpdate);
    },

    garbageCollectCells(state) {
        const { x: playerX, y: playerY } = state.playerLocation;

        const cleanMap = [];

        for (const relX of range(-4, 5)) {
            for (const relY of range(-4, 5)) {
                const x = playerX + relX;
                const y = playerY + relY;

                const cell = find(state.map, { x, y }) || { x, y, void: true };

                cleanMap.push(cell);
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
            if (stat.name == update.name) {
                state.stats.splice(index, 1);
                break;
            }
        }

        state.stats.push(update);
    },

    updateOnlineCount(state, count) {
        state.onlineCount = count;
    },

    updateProcess(state, update) {
        state.processContent = update.content
        state.processSize = update.size;
    },

    updateInventory(state, update) {
        state.inventory = update.items
        state.inventorySize = update.size;
    },

    setThrowItem(state, index) {
        state.throwItemIndex = index;
    },
    
    updateProcessableNames(state, names) {
        state.processableNames = names;
    },
};