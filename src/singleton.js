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

    get socket() {
        return this._data.socket;
    }
}

const instance = new Singleton();
Object.freeze(instance);

export default instance;