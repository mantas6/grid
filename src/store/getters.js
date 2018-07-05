export const getters = {
    playerX(state) {
        return state.playerLocation && state.playerLocation.x;
    },

    playerY(state) {
        return state.playerLocation && state.playerLocation.y;
    },
};