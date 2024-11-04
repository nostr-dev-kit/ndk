import "websocket-polyfill";
import NDK, { NDKEvent, NDKKind, NDKPrivateKeySigner, NostrEvent } from "@nostr-dev-kit/ndk";

// const signer = new NDKPrivateKeySigner("...");

const ndk = new NDK({
    outboxRelayUrls: ["wss://purplepag.es"],
    enableOutboxModel: true,
});

const pablo = ndk.getUser({
    npub: "npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft",
});
// const user = pablo;
// const fiatjaf = ndk.getUser({npub: "npub180cvv07tjdrrgpa0j7j7tmnyl2yr6yr7l8j4s3evf6u64th6gkwsyjh6w6"});

ndk.pool?.on("relay:connecting", (relay) => {
    console.log("🪄 MAIN POOL Connecting to relay", relay.url);
});

ndk.pool?.on("relay:connect", (relay) => {
    console.log("✅ MAIN POOL Connected to relay", relay.url);
});

// ndk.outboxPool?.on("relay:connect", (relay) => {
//     console.log("Connected to outbox relay", relay.url);
// });
ndk.activeUser = pablo;
const user = pablo;
// const user = await signer.user();
// ndk.signer = signer;
// ndk.activeUser = user;
await ndk.connect(2000);

// Setup kind 0, 3 and 10002
// await (new NDKEvent(ndk, { kind: 0, content: JSON.stringify({ name: "Outbox", picture: "https://sovereignengineering.io/assets/images/school-of-athens.jpg" }) } as NostrEvent)).publish();
// await (new NDKEvent(ndk, { kind: NDKKind.RelayList, tags: [ ["r", "wss://pablof7z.nostr1.com"] ] } as NostrEvent)).publish();
// await user.follow(fiatjaf);

// user.fetchProfile().then((profile) => {
//     console.log("Profile", profile);
// }).catch((e) => {
//     console.error("Error", e);
// });

let follows: Set<any> = new Set();

setTimeout(async () => {
    follows = await user.follows(undefined, true);

    console.log("Follows", follows.size);

    setTimeout(async () => {
        const feed = await ndk.fetchEvents(
            {
                kinds: [1],
                authors: Array.from(follows)
                    .slice(0, 20000)
                    .map((u) => u.pubkey),
            },
            { subId: "feed" }
        );
        console.log("Feed", feed.size);
    }, 4000);
}, 2000);
