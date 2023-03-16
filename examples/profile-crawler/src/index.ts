import 'websocket-polyfill';
import NDK from './ndk';
import NDKUser from './ndk/user';
import {Queue} from './queue';

// Define read NDK -- this seggregation will not be needed
const ndk = new NDK({
    explicitRelayUrls: ['wss://nos.lol', 'wss://relay.nostr.band'],
});

// Define write NDK
const writeNdk = new NDK({
    explicitRelayUrls: ['wss://profiles.f7z.io'],
});

// Connect both
await ndk.connect();
await writeNdk.connect();

const queue = new Queue(ndk, writeNdk, syncAllContactsFor);

setupDynamicDelay(ndk, queue);

queue.on('itemAdded', async () => {
    await queue.processNext();
});

const pablo = await ndk.getUser({
    npub: 'npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft',
});

if (pablo) {
    syncAllContactsFor(ndk, writeNdk, pablo, queue);
}

function setupDynamicDelay(ndk: NDK, queue: Queue) {
    ndk.relayPool.on('notice', (relay, notice) => {
        if (notice.includes('too fast') && queue.delayBetweenRequests < 5000) {
            queue.delayBetweenRequests += 500;
            console.log(`⚠️ Increasing delay to ${queue.delayBetweenRequests}`);
        } else {
            console.log(`Notice from ${relay.url}: ${notice}`);
        }
    });

    setInterval(() => {
        console.log(`Queue size: ${queue.items.length}`);
        if (queue.delayBetweenRequests > 10) {
            queue.delayBetweenRequests -= 10;
            console.log(`⚠️ Decreasing delay to ${queue.delayBetweenRequests}`);
        }
    }, 12000);
}

async function syncAllContactsFor(
    ndk: NDK,
    writeNdk: NDK,
    user: NDKUser,
    queue: Queue
): Promise<void> {
    const setMetadataEvents = await user.fetchProfile();

    if (!setMetadataEvents || setMetadataEvents?.size < 0) {
        return;
    }

    setMetadataEvents.forEach(e => writeNdk.publish(e));

    const follows = await user.follows();

    const relayList = await user.relayList();

    console.log(
        `User ${user.profile?.displayName} has ${follows.size} follows and ${relayList.size} relays`
    );

    if (relayList) {
        relayList.forEach(e => writeNdk.publish(e));
    }

    for (const follow of follows) {
        queue.add(follow);
    }
}
