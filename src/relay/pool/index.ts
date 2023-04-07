import EventEmitter from 'eventemitter3';
import {NDKRelay, NDKRelayStatus} from '../index.js';
import NDK from '../../index.js';

export type NDKPoolStats = {
    total: number,
    connected: number,
    disconnected: number,
    connecting: number,
};
export class NDKPool extends EventEmitter {
    public relays = new Map<string, NDKRelay>();
    private debug: debug.Debugger;

    public constructor(relayUrls: string[] = [], ndk: NDK) {
        super();
        this.debug = ndk.debug.extend('pool');
        relayUrls.forEach(relayUrl => {
            const relay = new NDKRelay(relayUrl);
            relay.on('notice', (relay, notice) => this.emit('notice', relay, notice));
            relay.on('connect', () => this.emit('connect', relay));
            relay.on('disconnect', () => this.emit('disconnect', relay));
            this.relays.set(relayUrl, relay);
        });
    }

    /**
     * Attempts to establish a connection to each relay in the pool.
     *
     * @async
     * @param {number} [timeoutMs] - Optional timeout in milliseconds for each connection attempt.
     * @returns {Promise<void>} A promise that resolves when all connection attempts have completed.
     * @throws {Error} If any of the connection attempts result in an error or timeout.
     */
    public async connect(timeoutMs?: number): Promise<void> {
        const promises: Promise<void>[] = [];

        this.debug(`Connecting to ${this.relays.size} relays${timeoutMs ? `, timeout ${timeoutMs}...` : ''}`);

        for (const relay of this.relays.values()) {
            if (timeoutMs) {
                const timeoutPromise = new Promise<void>((_, reject) => {
                    setTimeout(() => reject(`Timed out after ${timeoutMs}ms`), timeoutMs);
                });

                promises.push(
                    Promise.race([
                        relay.connect(),
                        timeoutPromise,
                    ]).catch((e) => {
                        this.debug(`Failed to connect to relay ${relay.url}: ${e}`);
                    })
                );
            } else {
                promises.push(relay.connect());
            }
        }

        await Promise.all(promises);
    }

    public size(): number {
        return this.relays.size;
    }

    /**
     * Returns the status of each relay in the pool.
     * @returns {NDKPoolStats} An object containing the number of relays in each status.
     */
    public stats(): NDKPoolStats {
        const stats: NDKPoolStats = {
            total: 0,
            connected: 0,
            disconnected: 0,
            connecting: 0,
        };

        for (const relay of this.relays.values()) {
            stats.total++;
            if (relay.status === NDKRelayStatus.CONNECTED) {
                stats.connected++;
            } else if (relay.status === NDKRelayStatus.DISCONNECTED) {
                stats.disconnected++;
            } else if (relay.status === NDKRelayStatus.CONNECTING) {
                stats.connecting++;
            }
        }

        return stats;
    }
}
