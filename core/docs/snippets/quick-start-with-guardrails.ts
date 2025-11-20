import NDK, {NDKEvent, NDKPrivateKeySigner} from "@nostr-dev-kit/ndk";

async function main() {
    const signer = NDKPrivateKeySigner.generate();
    const ndk = new NDK({
        explicitRelayUrls: ["wss://relay.primal.net"],
        signer,

        // ⚠️ STRONGLY RECOMMENDED: Enable during development
        // Catches common mistakes before they cause silent failures
        aiGuardrails: true,
    });

    // Connect to relays
    await ndk.connect();

    // Publish a simple text note
    const event = new NDKEvent(ndk, {
        kind: 1,
        content: "Hello Nostr via NDK!",
    });
    await event.sign();
    event.publish();

    // subscribe to all event interactions
    ndk.subscribe(
        event.filter(),
        {closeOnEose: false},
        {
            onEvent: (replyEvent: NDKEvent) =>
                console.log(replyEvent.author.npub, "interacted with our hello world with a kind", replyEvent.kind),
        },
    );

    // Subscribe to incoming text notes
    const subscription = ndk.subscribe(
        {kinds: [1]},
        {closeOnEose: true},
        {
            onEvent: (evt) => console.log("Received event:", evt),
            onEose: () => console.log("End of stream"),
        },
    );
}

main().catch(console.error);
