import Storage from "lockr";

class Singleton {
    constructor() {
        if (!Singleton.instance){
            this._data = {};
            Singleton.instance = this;
        }
        
        return Singleton.instance;
    }

    setSocket(socket) {
        this._data.socket = socket;
    }

    setStore(store) {
        this._data.store = store;
    }

    login() {
        const { socket, store } = this._data;
        if (socket) {
            const id = Storage.get('id');
            const token = Storage.get('token');

            socket.emit('login', { id, token }, ack => {
                console.log('Received login', ack)
                if (ack.token) {
                    Storage.set('id', ack.id);
                    Storage.set('token', ack.token);
                    store.commit('updatePlayerId', ack.id);
                }
            });
        }
    }

    logout() {
        Storage.rm('id');
        Storage.rm('token');
    }

    get socket() {
        return this._data.socket;
    }
}

const instance = new Singleton();
Object.freeze(instance);

export default instance;