import NDK from "@nostr-dev-kit/ndk";

const ndk = new NDK();

const subscription = ndk.subscribe(
    { kinds: [1] }, // Filters
    { closeOnEose: true }, // Options (no explicit relays specified)
);

// Attach handlers later
subscription.on("event", (event) => {
    console.log("Received event:", event.id);
});
subscription.on("eose", () => {
    console.log("Initial events loaded");
});

// Remember to stop the subscription when it's no longer needed
// setTimeout(() => subscription.stop(), 5000);
