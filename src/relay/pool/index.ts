import EventEmitter from 'eventemitter3';
import {Relay} from '../';

export class Pool extends EventEmitter {
    public relays = new Map<string, Relay>();
    public constructor(relayUrls: string[] = []) {
        super();
        relayUrls.forEach(relayUrl => {
            const relay = new Relay(relayUrl);
            relay.on('notice', (relay, notice) => {
                this.emit('notice', relay, notice);
            });
            this.relays.set(relayUrl, relay);
        });
    }

    public async connect(): Promise<void> {
        const promises: Promise<void>[] = [];
        this.relays.forEach(relay => {
            promises.push(relay.connect());
        });
        await Promise.all(promises);
    }

    public size(): number {
        return this.relays.size;
    }
}
