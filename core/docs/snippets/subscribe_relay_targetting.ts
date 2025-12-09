import NDK from "@nostr-dev-kit/ndk";

const ndk = new NDK();

// Subscription that ONLY accepts events from relay-a.com
const exclusiveSub = ndk.subscribe(
    { kinds: [7] },
    {
        relayUrls: ["wss://relay-a.com"],
        exclusiveRelay: true, // 🔑 Key option
        onEvent: (event) => {
            console.log("Event from relay-a.com:", event.content);
            // This will ONLY fire for events from relay-a.com
            // Events from relay-b.com or relay-c.com are rejected
        },
    },
);
