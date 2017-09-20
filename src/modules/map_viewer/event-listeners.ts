
const Events = {
    SELECT: 'select',
    CREATE: 'create',
    LAYERS_TOGGLE: 'layers-toggle',
    DOWNLOAD_TOGGLE: 'download-toggle'
};

export {Events};

interface Listeners {
    [index: string]: any;
}

export class EventListeners {

    public listeners: Listeners;
    private idTracker: number;

    constructor(events) {
        this.listeners = {};

        Object.keys(events).forEach(event => {
            const arrName = events[event];
            this.listeners[arrName] = [];
        });

        this.idTracker = 0; // Used to assign IDs to listeners
    }

    public fire(type, payload?) {
        if(!this.listeners[type]) {
            return;
        }

        let toRemove = [];

        this.listeners[type].forEach(listener => {
            listener.callback(payload);
            if(listener.oneTime) {
                toRemove.push(listener);
            }
        });

        toRemove.forEach(listener => {
            let index = this.listeners[type].indexOf(listener);
            this.listeners[type].splice(index, 1);
        });
    }

    public registerListener(type, callback, oneTime) {

        // Make sure listener type exists
        if(!this.listeners[type]) {
            return;
        }

        // Check for duplicate
        this.listeners[type].forEach(listener => {
            if(listener.callback === callback) {
                return; // Listener already exists
            }
        });

        const id = this.idTracker++;
        let wrappedCallback = {id, callback, oneTime: !!oneTime};

        this.listeners[type].push(wrappedCallback);

        return id;
    }

    public removeListener(type, id) {
        if(!this.listeners[type]) {
            return;
        }

        let listenerToRemove;
        this.listeners[type].forEach(listener => {
            if(listener.id === id) {
                listenerToRemove = listener;
            }
        });

        if(listenerToRemove) {
            const index = this.listeners[type].indexOf(listenerToRemove);
            this.listeners[type].splice(index, 1);
        }
    }
}
