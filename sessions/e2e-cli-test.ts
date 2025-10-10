#!/usr/bin/env bun
/**
 * E2E CLI Test for @nostr-dev-kit/sessions
 *
 * Tests multi-account support, login, account switching, and persistence
 */

import NDK, { NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import { FileStorage, MemoryStorage, NDKSessionManager } from "./src";

const SESSION_FILE = "./.test-sessions.json";

async function wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function testBasicLogin() {
    console.log("\n=== Test 1: Basic Login ===");

    const ndk = new NDK({ explicitRelayUrls: ["wss://relay.damus.io"] });
    await ndk.connect();

    const sessions = new NDKSessionManager(ndk);

    // Generate a test signer
    const signer = NDKPrivateKeySigner.generate();
    const user = await signer.user();

    // Login
    console.log("Logging in with signer...");
    const pubkey = await sessions.login(signer);

    console.log("✅ Logged in successfully");
    console.log("   Pubkey:", pubkey.slice(0, 16) + "...");
    console.log("   Active pubkey:", sessions.activePubkey?.slice(0, 16) + "...");
    console.log("   Sessions count:", sessions.getSessions().size);

    if (pubkey !== user.pubkey) {
        throw new Error("Pubkey mismatch!");
    }

    if (sessions.activePubkey !== pubkey) {
        throw new Error("Active pubkey not set correctly!");
    }

    // ndk.pool?.disconnect(); // Not needed for test
    console.log("✅ Test 1 passed\n");
}

async function testMultiAccount() {
    console.log("\n=== Test 2: Multi-Account Support ===");

    const ndk = new NDK({ explicitRelayUrls: ["wss://relay.damus.io"] });
    await ndk.connect();

    const sessions = new NDKSessionManager(ndk);

    // Create 3 test accounts
    const signer1 = NDKPrivateKeySigner.generate();
    const signer2 = NDKPrivateKeySigner.generate();
    const signer3 = NDKPrivateKeySigner.generate();

    const user1 = await signer1.user();
    const user2 = await signer2.user();
    const user3 = await signer3.user();

    console.log("Logging in with 3 accounts...");
    const pubkey1 = await sessions.login(signer1, { setActive: true });
    const pubkey2 = await sessions.login(signer2, { setActive: false });
    const pubkey3 = await sessions.login(signer3, { setActive: false });

    console.log("✅ All accounts logged in");
    console.log("   Account 1:", pubkey1.slice(0, 16) + "...");
    console.log("   Account 2:", pubkey2.slice(0, 16) + "...");
    console.log("   Account 3:", pubkey3.slice(0, 16) + "...");
    console.log("   Total sessions:", sessions.getSessions().size);

    if (sessions.getSessions().size !== 3) {
        throw new Error(`Expected 3 sessions, got ${sessions.getSessions().size}`);
    }

    if (sessions.activePubkey !== pubkey1) {
        throw new Error("Active session should be account 1");
    }

    // ndk.pool?.disconnect(); // Not needed for test
    console.log("✅ Test 2 passed\n");
}

async function testAccountSwitching() {
    console.log("\n=== Test 3: Account Switching ===");

    const ndk = new NDK({ explicitRelayUrls: ["wss://relay.damus.io"] });
    await ndk.connect();

    const sessions = new NDKSessionManager(ndk);

    // Create 2 accounts
    const signer1 = NDKPrivateKeySigner.generate();
    const signer2 = NDKPrivateKeySigner.generate();

    const user1 = await signer1.user();
    const user2 = await signer2.user();

    await sessions.login(signer1);
    await sessions.login(signer2);

    console.log("Switching between accounts...");

    sessions.switchTo(user1.pubkey);
    console.log("✅ Switched to account 1:", sessions.activePubkey?.slice(0, 16) + "...");
    if (sessions.activePubkey !== user1.pubkey) {
        throw new Error("Failed to switch to account 1");
    }
    if (ndk.signer !== signer1) {
        throw new Error("NDK signer not updated to signer1");
    }

    sessions.switchTo(user2.pubkey);
    console.log("✅ Switched to account 2:", sessions.activePubkey?.slice(0, 16) + "...");
    if (sessions.activePubkey !== user2.pubkey) {
        throw new Error("Failed to switch to account 2");
    }
    if (ndk.signer !== signer2) {
        throw new Error("NDK signer not updated to signer2");
    }

    sessions.switchTo(null);
    console.log("✅ Cleared active account");
    if (sessions.activePubkey !== undefined) {
        throw new Error("Failed to clear active account");
    }

    // ndk.pool?.disconnect(); // Not needed for test
    console.log("✅ Test 3 passed\n");
}

async function testLogout() {
    console.log("\n=== Test 4: Logout ===");

    const ndk = new NDK({ explicitRelayUrls: ["wss://relay.damus.io"] });
    await ndk.connect();

    const sessions = new NDKSessionManager(ndk);

    const signer1 = NDKPrivateKeySigner.generate();
    const signer2 = NDKPrivateKeySigner.generate();
    const user1 = await signer1.user();
    const user2 = await signer2.user();

    await sessions.login(signer1);
    await sessions.login(signer2);

    console.log("Logging out account 1...");
    sessions.logout(user1.pubkey);

    console.log("✅ Account 1 logged out");
    console.log("   Remaining sessions:", sessions.getSessions().size);
    console.log("   Active pubkey:", sessions.activePubkey?.slice(0, 16) + "...");

    if (sessions.getSessions().size !== 1) {
        throw new Error("Expected 1 session remaining");
    }

    if (sessions.getSession(user1.pubkey)) {
        throw new Error("Account 1 should be removed");
    }

    // Active should switch to remaining session
    if (sessions.activePubkey !== user2.pubkey) {
        throw new Error("Active session should switch to account 2");
    }

    console.log("Logging out remaining account...");
    sessions.logout();

    console.log("✅ All accounts logged out");
    console.log("   Remaining sessions:", sessions.getSessions().size);

    if (sessions.getSessions().size !== 0) {
        throw new Error("All sessions should be removed");
    }

    // ndk.pool?.disconnect(); // Not needed for test
    console.log("✅ Test 4 passed\n");
}

async function testPersistence() {
    console.log("\n=== Test 5: Persistence with FileStorage ===");

    // Clean up any existing session file
    try {
        await Bun.write(SESSION_FILE, "");
    } catch (e) {}

    const ndk1 = new NDK({ explicitRelayUrls: ["wss://relay.damus.io"] });
    await ndk1.connect();

    const storage = new FileStorage(SESSION_FILE);
    const sessions1 = new NDKSessionManager(ndk1, { storage, autoSave: false });

    // Create and save sessions
    const signer1 = NDKPrivateKeySigner.generate();
    const signer2 = NDKPrivateKeySigner.generate();
    const user1 = await signer1.user();
    const user2 = await signer2.user();

    console.log("Creating 2 sessions...");
    await sessions1.login(signer1, { setActive: true });
    await sessions1.login(signer2, { setActive: false });

    console.log("Persisting to file...");
    await sessions1.persist();

    console.log("✅ Sessions persisted");
    // ndk1.pool?.disconnect(); // Not needed for test

    // Create new manager and restore
    console.log("Creating new session manager and restoring...");
    const ndk2 = new NDK({ explicitRelayUrls: ["wss://relay.damus.io"] });
    await ndk2.connect();

    const sessions2 = new NDKSessionManager(ndk2, { storage });
    await sessions2.restore();

    console.log("✅ Sessions restored");
    console.log("   Restored sessions count:", sessions2.getSessions().size);
    console.log("   Active pubkey:", sessions2.activePubkey?.slice(0, 16) + "...");

    if (sessions2.getSessions().size !== 2) {
        throw new Error(`Expected 2 sessions, got ${sessions2.getSessions().size}`);
    }

    if (sessions2.activePubkey !== user1.pubkey) {
        throw new Error("Active session not restored correctly");
    }

    // Check that signers were restored
    const session1 = sessions2.getSession(user1.pubkey);
    const session2 = sessions2.getSession(user2.pubkey);

    if (!session1) throw new Error("Session 1 not found");
    if (!session2) throw new Error("Session 2 not found");

    console.log("   Session 1 pubkey:", session1.pubkey.slice(0, 16) + "...");
    console.log("   Session 2 pubkey:", session2.pubkey.slice(0, 16) + "...");

    // Clean up
    // ndk2.pool?.disconnect(); // Not needed for test
    try {
        await Bun.write(SESSION_FILE, "");
    } catch (e) {}

    console.log("✅ Test 5 passed\n");
}

async function testSubscriptions() {
    console.log("\n=== Test 6: State Subscriptions ===");

    const ndk = new NDK({ explicitRelayUrls: ["wss://relay.damus.io"] });
    await ndk.connect();

    const sessions = new NDKSessionManager(ndk);

    let callCount = 0;
    const unsubscribe = sessions.subscribe((state) => {
        callCount++;
        console.log(`   Subscription callback called (${callCount})`);
    });

    const signer = NDKPrivateKeySigner.generate();
    await sessions.login(signer);

    // Wait a bit for subscription to fire
    await wait(10);

    if (callCount === 0) {
        throw new Error("Subscription callback was not called");
    }

    console.log("✅ Subscription working");
    console.log("   Callback called", callCount, "times");

    unsubscribe();
    // ndk.pool?.disconnect(); // Not needed for test
    console.log("✅ Test 6 passed\n");
}

async function testMemoryStorage() {
    console.log("\n=== Test 7: MemoryStorage ===");

    const ndk = new NDK({ explicitRelayUrls: ["wss://relay.damus.io"] });
    await ndk.connect();

    const storage = new MemoryStorage();
    const sessions = new NDKSessionManager(ndk, { storage, autoSave: false });

    const signer = NDKPrivateKeySigner.generate();
    await sessions.login(signer);

    console.log("Persisting to memory...");
    await sessions.persist();

    console.log("Loading from memory...");
    const loaded = await storage.load();

    console.log("✅ Memory storage working");
    console.log("   Loaded sessions count:", loaded.sessions.size);

    if (loaded.sessions.size !== 1) {
        throw new Error("Expected 1 session in memory");
    }

    await sessions.clear();
    const cleared = await storage.load();

    console.log("✅ Memory cleared");
    console.log("   Sessions after clear:", cleared.sessions.size);

    if (cleared.sessions.size !== 0) {
        throw new Error("Expected 0 sessions after clear");
    }

    // ndk.pool?.disconnect(); // Not needed for test
    console.log("✅ Test 7 passed\n");
}

async function main() {
    console.log("🚀 Starting E2E CLI Tests for @nostr-dev-kit/sessions\n");
    console.log("=".repeat(60));

    try {
        await testBasicLogin();
        await testMultiAccount();
        await testAccountSwitching();
        await testLogout();
        await testPersistence();
        await testSubscriptions();
        await testMemoryStorage();

        console.log("=".repeat(60));
        console.log("\n🎉 All tests passed!\n");
        process.exit(0);
    } catch (error) {
        console.error("\n❌ Test failed:", error);
        process.exit(1);
    }
}

main();
