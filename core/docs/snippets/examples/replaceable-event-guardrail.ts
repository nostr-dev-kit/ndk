/**
 * Example demonstrating the replaceable event timestamp guardrail
 *
 * This guardrail helps prevent a common mistake when updating replaceable events:
 * using publish() instead of publishReplaceable() on events with old timestamps.
 */

import { NDK, NDKEvent, NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";

async function example() {
    const ndk = new NDK({
        explicitRelayUrls: ["wss://relay.damus.io"],
        aiGuardrails: true, // Enable AI guardrails
    });

    const signer = NDKPrivateKeySigner.generate();
    ndk.signer = signer;

    // ❌ WRONG: This will trigger a warning
    const metadataEvent = new NDKEvent(ndk);
    metadataEvent.kind = 0;
    metadataEvent.content = JSON.stringify({ name: "Alice" });
    metadataEvent.created_at = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
    await metadataEvent.sign();

    try {
        await metadataEvent.publish();
        // This will throw an AI_GUARDRAILS warning because the event is replaceable
        // and has an old timestamp (> 10 seconds)
    } catch (e) {
        console.log("Caught expected guardrail warning:", (e as Error).message.split("\n")[0]);
    }

    // ✅ CORRECT: Use publishReplaceable() instead
    const updatedMetadata = new NDKEvent(ndk);
    updatedMetadata.kind = 0;
    updatedMetadata.content = JSON.stringify({ name: "Alice Updated" });
    // publishReplaceable() will automatically update created_at to now
    await updatedMetadata.publishReplaceable();
    console.log("Successfully published with fresh timestamp");

    // ✅ ALSO CORRECT: If you need to use publish(), make sure created_at is fresh
    const anotherUpdate = new NDKEvent(ndk);
    anotherUpdate.kind = 0;
    anotherUpdate.content = JSON.stringify({ name: "Alice Again" });
    anotherUpdate.created_at = Math.floor(Date.now() / 1000); // Fresh timestamp
    await anotherUpdate.sign();
    await anotherUpdate.publish(); // Won't trigger warning
}

example().catch(console.error);
