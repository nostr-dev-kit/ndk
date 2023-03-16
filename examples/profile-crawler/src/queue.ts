import NDK from './ndk';
import { EventEmitter } from 'events';
import NDKUser from './ndk/user';
// import knex from 'knex';

// const uri = 'postgres://pablofernandez@localhost:5432/psbt_io_development';
// const db = knex({
//     client: 'pg',
//     connection: uri,
//     debug: true,
// });

// const res = await db.queryBuilder().select('*').from('events').where({id: 'sdsdsd'})

export class Queue extends EventEmitter {
    readonly items: NDKUser[];
    private processing: boolean;
    private processedIds: Set<string>;
    private ndk: NDK;
    private writeNdk: NDK;
    private func;
    public delayBetweenRequests = 0;

    constructor(ndk: NDK, writeNdk: NDK, func: Function) {
        super();
        this.items = [];
        this.processing = false;
        this.processedIds = new Set<string>();
        this.ndk = ndk;
        this.writeNdk = writeNdk;
        this.func = func;
    }

    add(user: NDKUser): void {
        // only if it hasn't been processed yet
        if (this.processedIds.has(user.npub)) {
            return;
        }

        // only if it's not in the database already
        // const res = await db.queryBuilder()
        //     .select('*')
        //     .from('events')
        //     .where({event_kind: 0, event_pubkey: user.hexpubkey()})
        //     .then(console.log);

        this.items.push(user);
        this.emit('itemAdded');
    }

    async processItem(user: NDKUser): Promise<void> {
        try {
            await this.func(this.ndk, this.writeNdk, user, this);
        } catch (e) {
            console.trace(e);
        }
    }

    async processNext(): Promise<void> {
        if (this.processing || this.items.length === 0) return;

        this.processing = true;
        const user = this.items.shift();

        if (user && !this.processedIds.has(user.npub)) {
            this.processedIds.add(user.npub); // Add the user id to the processed set
            await this.processItem(user);
        }
        this.processing = false;

        if (this.items.length > 0) {
            setTimeout(() => this.processNext(), this.delayBetweenRequests);
        }
    }
}