/**
 * AI Guardrails Example
 *
 * This example demonstrates how AI Guardrails help catch common mistakes
 * when using NDK, especially useful for LLM-generated code.
 */

import NDK, {NDKEvent} from "@nostr-dev-kit/ndk";
import {nip19} from "nostr-tools";

// Example 1: Enable all guardrails (recommended for development)
const ndk = new NDK({
    explicitRelayUrls: ["wss://relay.damus.io"],
    aiGuardrails: true, // Enable all checks
});

await ndk.connect();

// Example 2: Filter with bech32 - will throw error
try {
    const npub = "npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft";

    // ❌ This will throw an AI Guardrails error
    ndk.subscribe({
        authors: [npub], // Wrong! Should be hex
    });
} catch (error) {
    console.log("Caught error:", error.message);
    // Error message will explain how to fix it
}

// ✅ Correct way - decode bech32 first
const npub = "npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft";
const { data: pubkey } = nip19.decode(npub);
ndk.subscribe({
    authors: [pubkey as string],
});

// Example 3: Empty filter - will throw error
try {
    // ❌ This will throw
    ndk.subscribe({});
} catch (error) {
    console.log("Caught empty filter error");
}

// Example 4: Filter with only limit - will throw error
try {
    // ❌ This will throw
    ndk.subscribe({ limit: 10 });
} catch (error) {
    console.log("Caught limit-only filter error");
}

// Example 5: Event signing without kind - will throw error
try {
    const event = new NDKEvent(ndk);
    event.content = "Hello world";
    // ❌ Missing kind!
    await event.sign();
} catch (error) {
    console.log("Caught missing kind error");
}

// ✅ Correct way
const event = new NDKEvent(ndk);
event.kind = 1;
event.content = "Hello world";
await event.sign();

// Example 6: Created_at in milliseconds - will throw error
try {
    const event = new NDKEvent(ndk);
    event.kind = 1;
    event.content = "Hello";
    event.created_at = Date.now(); // ❌ Milliseconds!
    await event.sign();
} catch (error) {
    console.log("Caught milliseconds error");
}

// ✅ Correct way
const event2 = new NDKEvent(ndk);
event2.kind = 1;
event2.content = "Hello";
event2.created_at = Math.floor(Date.now() / 1000); // Seconds
await event2.sign();

// Example 7: fetchEvents warning (doesn't throw, just warns)
console.log("\nThis will show a warning:");
const events = await ndk.fetchEvents({ kinds: [1], limit: 5 });
console.log("Got events:", events.size);

// Example 8: Selectively disable checks
const ndk2 = new NDK({
    explicitRelayUrls: ["wss://relay.damus.io"],
    aiGuardrails: {
        skip: new Set([
            GuardrailCheckId.FETCH_EVENTS_USAGE, // Disable fetchEvents warning
            GuardrailCheckId.FILTER_LARGE_LIMIT, // Disable large limit warning
        ]),
    },
});

await ndk2.connect();

// ✅ This won't warn because we skipped the check
const manyEvents = await ndk2.fetchEvents({ kinds: [1], limit: 5 });

// Example 9: Programmatic control
ndk.aiGuardrails.skip(GuardrailCheckId.FETCH_EVENTS_USAGE);
// Now fetchEvents won't warn
const more = await ndk.fetchEvents({ kinds: [1], limit: 5 });

// Re-enable it
ndk.aiGuardrails.enable(GuardrailCheckId.FETCH_EVENTS_USAGE);

// Example 10: Check what's currently skipped
const skipped = ndk.aiGuardrails.getSkipped();
console.log("Currently skipped checks:", skipped);

// Example 11: Disable all guardrails at runtime
ndk.aiGuardrails.setMode(false);
// Now no checks will run

// Example 12: Production setup - disable by default
const productionNdk = new NDK({
    explicitRelayUrls: ["wss://relay.damus.io"],
    aiGuardrails: process.env.NODE_ENV === "development", // Only in dev
});

// Example 13: LLM-friendly error handling
/**
 * When an LLM generates code that triggers a guardrail,
 * it should read the error message and self-correct:
 */
async function llmGeneratedCode() {
    try {
        const event = new NDKEvent(ndk);
        // LLM forgot to set kind
        event.content = "Generated content";
        await event.sign();
    } catch (error) {
        console.log("\nLLM would see this error:");
        console.log(error.message);

        /**
         * The error message includes:
         * 1. What went wrong
         * 2. How to fix it
         * 3. How to disable the check if needed
         *
         * LLM can then:
         * - Fix the code (add event.kind = 1)
         * - Or skip the check if it knows better
         */

        // LLM self-corrects:
        const correctedEvent = new NDKEvent(ndk);
        correctedEvent.kind = 1; // Fixed!
        correctedEvent.content = "Generated content";
        await correctedEvent.sign();
        console.log("\n✅ LLM successfully self-corrected!");
    }
}

await llmGeneratedCode();
