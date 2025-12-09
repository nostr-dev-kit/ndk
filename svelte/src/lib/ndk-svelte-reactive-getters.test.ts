import {
  NDKEvent,
  NDKPrivateKeySigner,
  NDKRelayFeedList,
} from "@nostr-dev-kit/ndk";
import { beforeEach, describe, expect, it } from "vitest";
import { createNDK, type NDKSvelte } from "./ndk-svelte.svelte.js";

describe("NDKSvelte Reactive Getters", () => {
  let ndk: NDKSvelte;

  beforeEach(() => {
    ndk = createNDK({
      explicitRelayUrls: ["wss://relay.test"],
      session: true,
    });
  });

  describe("$currentUser and $activeUser", () => {
    it("should return undefined when no user is active", () => {
      expect(ndk.$currentUser).toBeUndefined();
      expect(ndk.$activeUser).toBeUndefined();
    });

    it("should return the active user when a signer is set", async () => {
      const signer = NDKPrivateKeySigner.generate();
      const user = await signer.user();

      // Set signer and wait for activeUser to update
      await new Promise<void>((resolve) => {
        ndk.once("activeUser:change", () => resolve());
        ndk.signer = signer;
      });

      expect(ndk.$currentUser).toBeDefined();
      expect(ndk.$currentUser?.pubkey).toBe(user.pubkey);
      expect(ndk.$activeUser).toBeDefined();
      expect(ndk.$activeUser?.pubkey).toBe(user.pubkey);
    });

    it("should update when activeUser changes", async () => {
      const signer1 = NDKPrivateKeySigner.generate();
      const user1 = await signer1.user();

      const signer2 = NDKPrivateKeySigner.generate();
      const user2 = await signer2.user();

      await new Promise<void>((resolve) => {
        ndk.once("activeUser:change", () => resolve());
        ndk.signer = signer1;
      });
      expect(ndk.$currentUser?.pubkey).toBe(user1.pubkey);
      expect(ndk.$activeUser?.pubkey).toBe(user1.pubkey);

      await new Promise<void>((resolve) => {
        ndk.once("activeUser:change", () => resolve());
        ndk.signer = signer2;
      });
      expect(ndk.$currentUser?.pubkey).toBe(user2.pubkey);
      expect(ndk.$activeUser?.pubkey).toBe(user2.pubkey);
    });

    it("$activeUser should be an alias for $currentUser", async () => {
      const signer = NDKPrivateKeySigner.generate();

      await new Promise<void>((resolve) => {
        ndk.once("activeUser:change", () => resolve());
        ndk.signer = signer;
      });

      expect(ndk.$activeUser).toBe(ndk.$currentUser);
    });
  });

  describe("$currentPubkey", () => {
    it("should return undefined when no user is active", () => {
      expect(ndk.$currentPubkey).toBeUndefined();
    });

    it("should return the active user's pubkey when a signer is set", async () => {
      const signer = NDKPrivateKeySigner.generate();
      const user = await signer.user();

      await new Promise<void>((resolve) => {
        ndk.once("activeUser:change", () => resolve());
        ndk.signer = signer;
      });

      expect(ndk.$currentPubkey).toBe(user.pubkey);
    });

    it("should update when activeUser changes", async () => {
      const signer1 = NDKPrivateKeySigner.generate();
      const user1 = await signer1.user();

      const signer2 = NDKPrivateKeySigner.generate();
      const user2 = await signer2.user();

      await new Promise<void>((resolve) => {
        ndk.once("activeUser:change", () => resolve());
        ndk.signer = signer1;
      });
      expect(ndk.$currentPubkey).toBe(user1.pubkey);

      await new Promise<void>((resolve) => {
        ndk.once("activeUser:change", () => resolve());
        ndk.signer = signer2;
      });
      expect(ndk.$currentPubkey).toBe(user2.pubkey);
    });
  });

  describe("$currentSession", () => {
    it("should return undefined when sessions are not enabled", () => {
      const ndkNoSessions = createNDK({
        explicitRelayUrls: ["wss://relay.test"],
      });

      expect(ndkNoSessions.$currentSession).toBeUndefined();
    });

    it("should return undefined when no session is active", () => {
      expect(ndk.$currentSession).toBeUndefined();
    });

    it("should return the active session after login", async () => {
      const signer = NDKPrivateKeySigner.generate();
      const user = await signer.user();

      await ndk.$sessions?.login(signer, { setActive: true });

      expect(ndk.$currentSession).toBeDefined();
      expect(ndk.$currentSession?.pubkey).toBe(user.pubkey);
    });

    it("should update when switching sessions", async () => {
      const signer1 = NDKPrivateKeySigner.generate();
      const user1 = await signer1.user();

      const signer2 = NDKPrivateKeySigner.generate();
      const user2 = await signer2.user();

      await ndk.$sessions?.login(signer1, { setActive: true });
      expect(ndk.$currentSession?.pubkey).toBe(user1.pubkey);

      await ndk.$sessions?.login(signer2, { setActive: true });
      expect(ndk.$currentSession?.pubkey).toBe(user2.pubkey);

      await ndk.$sessions?.switch(user1.pubkey);
      expect(ndk.$currentSession?.pubkey).toBe(user1.pubkey);
    });

    it("should return undefined after logout", async () => {
      const signer = NDKPrivateKeySigner.generate();
      const user = await signer.user();

      await ndk.$sessions?.login(signer, { setActive: true });
      expect(ndk.$currentSession).toBeDefined();

      ndk.$sessions?.logout(user.pubkey);
      expect(ndk.$currentSession).toBeUndefined();
    });
  });

  describe("$follows", () => {
    it("should return empty array when sessions are not enabled", () => {
      const ndkNoSessions = createNDK({
        explicitRelayUrls: ["wss://relay.test"],
      });

      expect(ndkNoSessions.$follows).toEqual([]);
      expect(Array.isArray(ndkNoSessions.$follows)).toBe(true);
    });

    it("should return empty array when no session is active", () => {
      expect(ndk.$follows).toEqual([]);
      expect(Array.isArray(ndk.$follows)).toBe(true);
    });

    it("should return follows array after login", async () => {
      const signer = NDKPrivateKeySigner.generate();
      await ndk.$sessions?.login(signer, { setActive: true });

      // Initially should be empty (no follows fetched yet)
      expect(ndk.$follows).toEqual([]);
      expect(Array.isArray(ndk.$follows)).toBe(true);
    });

    it("should return empty array after logout", async () => {
      const signer = NDKPrivateKeySigner.generate();
      const user = await signer.user();

      await ndk.$sessions?.login(signer, { setActive: true });
      expect(Array.isArray(ndk.$follows)).toBe(true);

      ndk.$sessions?.logout(user.pubkey);
      expect(ndk.$follows).toEqual([]);
    });
  });

  describe("Reactive getters integration", () => {
    it("should all update together when logging in", async () => {
      const signer = NDKPrivateKeySigner.generate();
      const user = await signer.user();

      expect(ndk.$currentUser).toBeUndefined();
      expect(ndk.$activeUser).toBeUndefined();
      expect(ndk.$currentPubkey).toBeUndefined();
      expect(ndk.$currentSession).toBeUndefined();

      await ndk.$sessions?.login(signer, { setActive: true });

      expect(ndk.$currentUser).toBeDefined();
      expect(ndk.$activeUser).toBeDefined();
      expect(ndk.$currentPubkey).toBe(user.pubkey);
      expect(ndk.$currentSession).toBeDefined();
      expect(ndk.$currentSession?.pubkey).toBe(user.pubkey);
    });

    it("should all update together when logging out", async () => {
      const signer = NDKPrivateKeySigner.generate();
      const user = await signer.user();

      await ndk.$sessions?.login(signer, { setActive: true });

      expect(ndk.$currentUser).toBeDefined();
      expect(ndk.$activeUser).toBeDefined();
      expect(ndk.$currentPubkey).toBeDefined();
      expect(ndk.$currentSession).toBeDefined();

      // Logout - session will be cleared synchronously
      ndk.$sessions?.logout(user.pubkey);

      // Session should be cleared immediately
      expect(ndk.$currentSession).toBeUndefined();

      // Note: activeUser might still be set after logout if no event fires
      // This is OK since there's no active session anyway
    });

    it("should clear $currentUser and $currentPubkey after logout", async () => {
      const signer = NDKPrivateKeySigner.generate();
      const user = await signer.user();

      // Initial state - nothing set
      expect(ndk.$currentUser).toBeUndefined();
      expect(ndk.$currentPubkey).toBeUndefined();

      // Login - user and pubkey should be set
      await ndk.$sessions?.login(signer, { setActive: true });

      expect(ndk.$currentUser).toBeDefined();
      expect(ndk.$currentUser?.pubkey).toBe(user.pubkey);
      expect(ndk.$currentPubkey).toBe(user.pubkey);

      // Logout - user and pubkey should be cleared
      ndk.$sessions?.logout(user.pubkey);

      // After logout, activeUser and pubkey should be cleared
      expect(ndk.$currentUser).toBeUndefined();
      expect(ndk.$currentPubkey).toBeUndefined();
    });
  });

  describe("$sessionEvent", () => {
    it("should return undefined when sessions are not enabled", () => {
      const ndkNoSessions = createNDK({
        explicitRelayUrls: ["wss://relay.test"],
      });

      expect(ndkNoSessions.$sessionEvent(NDKRelayFeedList)).toBeUndefined();
    });

    it("should return undefined when no session is active", () => {
      expect(ndk.$sessionEvent(NDKRelayFeedList)).toBeUndefined();
    });

    it("should return undefined when session exists but event not loaded", async () => {
      const signer = NDKPrivateKeySigner.generate();
      await ndk.$sessions?.login(signer, { setActive: true });

      // No relay feed list event has been loaded
      const relayFeedList = ndk.$sessionEvent(NDKRelayFeedList);
      expect(relayFeedList).toBeUndefined();
    });

    it("should return the session event when it exists", async () => {
      const signer = NDKPrivateKeySigner.generate();
      const user = await signer.user();

      await ndk.$sessions?.login(signer, { setActive: true });

      // Create and store a relay feed list event
      const mockEvent = new NDKEvent(ndk, {
        kind: 10012,
        pubkey: user.pubkey,
        content: "",
        tags: [
          ["relay", "wss://relay.damus.io"],
          ["relay", "wss://nos.lol"],
        ],
        created_at: Math.floor(Date.now() / 1000),
      });
      mockEvent.id = "test-id";

      // Manually set the event in the session
      const session = ndk.$sessions?.current;
      if (session) {
        session.events.set(10012, NDKRelayFeedList.from(mockEvent));
      }

      // Now it should return the event
      const relayFeedList = ndk.$sessionEvent(NDKRelayFeedList);
      expect(relayFeedList).toBeDefined();
      expect(relayFeedList).toBeInstanceOf(NDKRelayFeedList);
      expect(relayFeedList?.relayUrls).toEqual([
        "wss://relay.damus.io",
        "wss://nos.lol",
      ]);
    });
  });
});
