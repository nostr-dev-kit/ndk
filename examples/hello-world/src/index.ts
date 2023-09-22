import "websocket-polyfill";
import NDK from "@nostr-dev-kit/ndk";

const ndk = new NDK({
    explicitRelayUrls: [
        "wss://pablof7z.nostr1.com",
        "wss://offchain.pub",
        "wss://relay.f7z.io",
        "wss://relay.damus.io",
        "wss://relay.snort.social",
        "wss://offchain.pub/",
        "wss://nostr.mom",
        "wss://nostr-pub.wellorder.net",
        "wss://purplepag.es",
        "wss://brb.io/",
    ],
    // outboxRelayUrls: [
    //     "wss://purplepag.es",
    // ],
    // blacklistRelayUrls: [
    //     "wss://relay.snort.social",
    //     "wss://no.str.cr"
    // ],
    enableOutboxModel: false,
});

await ndk.connect(6000);

const eventsPerRelay = new Map<string, number>();
const eventIds = new Set();

const sub = await ndk.fetchEvent("note179s867lx0d4sgze4x969anszcjmg90p6dukjadpct8cwmssq9vksjmqdve");
console.log(sub?.rawEvent());

setInterval(() => {
    console.log(`distinct events: ${eventIds.size}`);
    console.log(`Events per relay`);
    for (const [relay, count] of eventsPerRelay.entries()) {
        console.log(`  ${relay}: ${count}`);
    }
}, 10000);

setInterval(async () => {
    console.log(`Starting it over`);
    const user = ndk.getUser({
        hexpubkey: "dc4cd086cd7ce5b1832adf4fdd1211289880d2c7e295bcb0e684c01acee77c06",
    });
    const sub = await ndk.subscribe({ kinds: [0] }, { closeOnEose: true });
    sub.on("eose", () => console.log(`eose`));
}, 60000);
// console.log(user.profile);

// const a = await ndk.subscribe(
//     {kinds:[0, 1], authors:["8f3cb4b03090cb9a0bf8a8519d4a653c4f436179eeb3c824026c47ad85bff669"]},
//     { closeOnEose: true }
// );

// a.on("event", (event) => console.log(`received event on a`, event.id, event.content));
// a.on("eose", () => console.log(`received eose on a`));

// setTimeout(async () => {
//     const b = await ndk.subscribe(
//         {kinds:[1], authors:["8f3cb4b03090cb9a0bf8a8519d4a653c4f436179eeb3c824026c47ad85bff669"]},
//         { closeOnEose: false }
//     );

//     b.on("event", (event) => console.log(`received event on b`, event.id, event.content));
// }, 500);

// setTimeout(async () => {

// const first = await ndk.subscribe({
//     kinds: [0], authors: ["fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52"],
// }, { groupable: true, groupableDelay: 5000 });
// const second = await ndk.subscribe({
//     kinds: [0], authors: ["3ef7277dc0870c8c07df0ee66829928301eb95785715a14f032aca534862bae0"],
// }, { groupable: true, groupableDelay: 5000 });
// setTimeout(() => {
//     ndk.subscribe({
//         kinds: [0], authors: ["2d5b6404df532de082d9e77f7f4257a6f43fb79bb9de8dd3ac7df5e6d4b500b0"],
//     }, { groupable: true, groupableDelay: 100 });
// }, 100);

// first.on("event", (e) => console.log(`first`, e.id));
// second.on("event", (e) => console.log(`second`, e.id));

// }, 1);

// const pablo = ndk.getUser({npub: "npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft"});
// ndk.subscribe({
//     kinds: [1], authors: [ pablo.hexpubkey ], limit: 1
// }, { closeOnEose: true }).on("event", (e) => {
//     console.log(`got event ${e.id} from ${e.relay?.url}`);
// });

// setTimeout(() => {
//     ndk.subscribe({
//         kinds: [1], authors: [ pablo.hexpubkey ], limit: 20
//     }, { closeOnEose: false }).on("event", (e) => {
//         console.log(`got event ${e.id} from ${e.relay?.url}`);
//     });
// }, 5000);

// const follows = await pablo.follows({ groupable: false }, false);

// console.log(`fetched ${follows.size} follows`);

// const user = ndk.getUser({npub: "npub1nf9vm6uhs4j7yaysmjn9eqlf7et5t6hvrkdqgpd995vcc9yfjyas0pxa3x"});

//     const notes1 = ndk.subscribe({
//         kinds:[1], authors:[
//             "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52",
//         ]
//     }, { closeOnEose: false, groupable: true, groupableDelay: 100 });

//     const notes2 = ndk.subscribe({
//         kinds:[1], authors:[
//             "3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d",
//         ]
//     }, { closeOnEose: false, groupable: true, groupableDelay: 100 });

//     const notes3 = ndk.subscribe({
//         kinds:[1], authors:[
//             "356875ffd729b06eeb4c1d7a70a1f750045d067774d21c0faffe4af2bf96a2e8",
//         ]
//     }, { closeOnEose: false, groupable: true, groupableDelay: 2000 });

//     setTimeout(() => notes1.stop(), 1000);

//     notes1.on("event", (e) => {
//         console.log("Note 1", e.id, "from relay", e.relay?.url);
//     });

//     setTimeout(() => {
//         notes1.stop();
//     }, 1000);

//     setTimeout(() => {
//         notes2.stop();
//     }, 2000);

//     setTimeout(() => {
//         notes3.stop();
//     }, 3000);

// setTimeout(() => {
//     console.log(`going to ask for user`);
//     const notes = ndk.subscribe({
//         kinds:[1], authors:[
//             "356875ffd729b06eeb4c1d7a70a1f750045d067774d21c0faffe4af2bf96a2e8",
//         ], limit: 10
//     }, { closeOnEose: false });

//     notes.on("event", (e) => {
//         console.log("Note 2", e.id, "from relay", e.relay?.url);
//     });
// }, 5000);

// await ndk.fetchEvent({
//     kinds:[0], authors:[
//         "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52",
//         mike.hexpubkey
//     ]
// });
