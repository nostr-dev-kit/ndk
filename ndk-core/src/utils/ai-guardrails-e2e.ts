#!/usr/bin/env tsx
/**
 * E2E script to demonstrate AI Guardrails in action.
 * Run with: npx tsx ndk-core/src/utils/ai-guardrails-e2e.ts
 */

import { NDK } from "../ndk/index.js";
import { NDKEvent } from "../events/index.js";
import { NDKPrivateKeySigner } from "../signers/private-key/index.js";

const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RESET = "\x1b[0m";

console.log(`${GREEN}=== AI Guardrails E2E Demo ===${RESET}\n`);

// Initialize NDK with guardrails enabled
const ndk = new NDK({ aiGuardrails: true });
const signer = NDKPrivateKeySigner.generate();
ndk.signer = signer;

async function testGuardrail(testName: string, testFn: () => Promise<void> | void) {
    console.log(`${YELLOW}Testing: ${testName}${RESET}`);
    try {
        await testFn();
        console.log(`${RED}❌ FAILED - No error thrown${RESET}\n`);
    } catch (error) {
        if (error instanceof Error && error.message.includes("AI_GUARDRAILS")) {
            console.log(`${GREEN}✅ PASSED - Guardrail triggered${RESET}`);
            console.log(`${GREEN}Message preview: ${error.message.split("\n")[0]}${RESET}\n`);
        } else {
            console.log(`${RED}❌ FAILED - Unexpected error: ${error}${RESET}\n`);
        }
    }
}

async function runTests() {
    // Test 1: Missing kind
    await testGuardrail("event-missing-kind", async () => {
        const event = new NDKEvent(ndk);
        event.content = "Hello world";
        await event.sign();
    });

    // Test 2: Content is object
    await testGuardrail("event-content-is-object", async () => {
        const event = new NDKEvent(ndk);
        event.kind = 1;
        event.content = { foo: "bar" } as unknown as string;
        await event.sign();
    });

    // Test 3: Created_at in milliseconds
    await testGuardrail("event-created-at-milliseconds", async () => {
        const event = new NDKEvent(ndk);
        event.kind = 1;
        event.content = "Hello";
        event.created_at = Date.now(); // milliseconds instead of seconds
        await event.sign();
    });

    // Test 4: Invalid p-tag (npub instead of hex)
    await testGuardrail("tag-invalid-p-tag", async () => {
        const event = new NDKEvent(ndk);
        event.kind = 1;
        event.content = "Hello";
        event.tags.push(["p", "npub1xyz..."]);
        await event.sign();
    });

    // Test 5: Invalid e-tag (note instead of hex)
    await testGuardrail("tag-invalid-e-tag", async () => {
        const event = new NDKEvent(ndk);
        event.kind = 1;
        event.content = "Hello";
        event.tags.push(["e", "note1xyz..."]);
        await event.sign();
    });

    // Test 6: Manual reply markers (warning)
    await testGuardrail("event-manual-reply-markers", async () => {
        const event = new NDKEvent(ndk);
        event.kind = 1;
        event.content = "Great post!";
        event.tags.push(["e", "a".repeat(64), "", "reply"]);
        await event.sign();
    });

    // Test 7: Bech32 in filter authors
    await testGuardrail("filter-bech32-in-array (authors)", () => {
        ndk.subscribe({
            authors: ["npub1xyz..."],
        });
    });

    // Test 8: Bech32 in filter ids
    await testGuardrail("filter-bech32-in-array (ids)", () => {
        ndk.subscribe({
            ids: ["note1xyz..."],
        });
    });

    // Test 9: Filter with only limit
    await testGuardrail("filter-only-limit", () => {
        ndk.subscribe({ limit: 10 });
    });

    // Test 10: Empty filter
    await testGuardrail("filter-empty", () => {
        ndk.subscribe({});
    });

    // Test 11: since > until
    await testGuardrail("filter-since-after-until", () => {
        ndk.subscribe({
            kinds: [1],
            since: 1000000,
            until: 500000,
        });
    });

    // Test 12: Large limit (warning)
    await testGuardrail("filter-large-limit", () => {
        ndk.subscribe({
            kinds: [1],
            limit: 5000,
        });
    });

    // Test 13: Invalid #a tag format
    await testGuardrail("filter-invalid-a-tag", () => {
        ndk.subscribe({
            "#a": ["naddr1xyz..."], // bech32 instead of kind:pubkey:dtag
        });
    });

    // Test 14: Param replaceable without d-tag (warning)
    await testGuardrail("event-param-replaceable-no-dtag", async () => {
        const event = new NDKEvent(ndk);
        event.kind = 30023; // param replaceable
        event.content = "My article";
        await event.sign();
    });

    // Test 15: fetchEvents anti-pattern (warning)
    await testGuardrail("fetch-events-usage", async () => {
        await ndk.fetchEvents({ kinds: [1] });
    });

    console.log(`${GREEN}=== All tests completed ===${RESET}`);
    console.log(`\n${YELLOW}Note: All guardrails throw AND log to console.error (visible above)${RESET}`);
    process.exit(0);
}

runTests().catch((error) => {
    console.error(`${RED}Fatal error:${RESET}`, error);
    process.exit(1);
});
