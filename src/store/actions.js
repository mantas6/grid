import Singleton from '@/singleton'

export const actions = {
    moveDirection({ state }, direction) {
        const playerX = state.playerLocation.x;
        const playerY = state.playerLocation.y;

        const coords = {
            up: { x: playerX, y: playerY - 1 },
            down: { x: playerX, y: playerY + 1 },
            left: { x: playerX - 1, y: playerY },
            right: { x: playerX + 1, y: playerY },
        };

        if (coords[direction]) {
            const { x, y } = coords[direction];

            console.log('changePosition', { x, y });
            Singleton.socket.emit('changePosition', { x, y });
        }
    },
};