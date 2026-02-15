export type SyncEvent =
    | { type: 'APPOINTMENT_ADDED'; payload: any }
    | { type: 'APPOINTMENT_UPDATED'; payload: any }
    | { type: 'QUEUE_UPDATED'; payload: any } // For Providers updating the queue
    | { type: 'QUEUE_JOINED'; payload: any } // For Patients joining
    | { type: 'SYNC_REQUEST'; payload: null }; // Request full state sync

const CHANNEL = 'portal-sync';

class SyncManager {
    private listeners: ((event: SyncEvent) => void)[] = [];

    constructor() {
        window.addEventListener('storage', this.handleStorage);
    }

    private handleStorage = (e: StorageEvent) => {
        if (e.key === CHANNEL && e.newValue) {
            try {
                const event: SyncEvent = JSON.parse(e.newValue);
                this.notify(event);
            } catch (err) {
                console.error('Sync parse error', err);
            }
        }
    };

    subscribe(callback: (event: SyncEvent) => void) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    broadcast(event: SyncEvent) {
        // 1. Notify local listeners (same tab/window)
        this.notify(event);

        // 2. Notify other tabs via storage
        // We must use a unique value (timestamp) to trigger the event even if data is same
        const data = JSON.stringify({ ...event, _ts: Date.now() });
        localStorage.setItem(CHANNEL, data);
    }

    private notify(event: SyncEvent) {
        this.listeners.forEach(l => l(event));
    }
}

export const syncManager = new SyncManager();
