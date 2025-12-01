import { describe, expect, it, vi, beforeEach } from "vitest";
import { MutesProxy } from "./mutes.svelte.js";
import { NDKEvent, NDKKind } from "@nostr-dev-kit/ndk";
import type { ReactiveSessionsStore } from "./sessions.svelte.js";

describe("MutesProxy", () => {
  let mockStore: ReactiveSessionsStore;
  let muteSet: Set<string>;
  let mutesProxy: MutesProxy;
  let mockUser: any;
  let mockNdk: any;

  beforeEach(() => {
    muteSet = new Set(["pubkey1", "pubkey2"]);

    mockNdk = {
      assertSigner: vi.fn(),
    };

    mockUser = {
      ndk: mockNdk,
    };

    mockStore = {
      get currentUser() {
        return mockUser;
      },
    } as ReactiveSessionsStore;

    mutesProxy = new MutesProxy(mockStore, muteSet);

    // Mock publishReplaceable on NDKEvent
    vi.spyOn(NDKEvent.prototype, "publishReplaceable").mockResolvedValue(
      new Set(),
    );
  });

  describe("constructor", () => {
    it("should initialize with store and muteSet", () => {
      expect(mutesProxy).toBeDefined();
      expect(mutesProxy.size).toBe(2);
      expect(mutesProxy.has("pubkey1")).toBe(true);
      expect(mutesProxy.has("pubkey2")).toBe(true);
    });
  });

  describe("mute method", () => {
    it("should throw error when no active user", async () => {
      mockStore = {
        get currentUser() {
          return undefined;
        },
      } as Partial<ReactiveSessionsStore> as ReactiveSessionsStore;

      mutesProxy = new MutesProxy(mockStore, muteSet);

      await expect(mutesProxy.mute("pubkey3")).rejects.toThrow(
        "No active user",
      );
    });

    it("should throw error when no NDK instance found", async () => {
      mockUser.ndk = null;

      await expect(mutesProxy.mute("pubkey3")).rejects.toThrow(
        "No NDK instance found",
      );
    });

    it("should call ndk.assertSigner", async () => {
      await mutesProxy.mute("pubkey3");

      expect(mockNdk.assertSigner).toHaveBeenCalled();
    });

    it("should do nothing when already muted", async () => {
      await mutesProxy.mute("pubkey1");

      expect(muteSet.has("pubkey1")).toBe(true);
      expect(muteSet.size).toBe(2); // Still 2, not 3
    });

    it("should add pubkey to mute set", async () => {
      expect(muteSet.has("pubkey3")).toBe(false);

      await mutesProxy.mute("pubkey3");

      expect(muteSet.has("pubkey3")).toBe(true);
    });

    it("should create event with kind 10000 (MuteList)", async () => {
      let createdEvent: NDKEvent | undefined;
      vi.spyOn(NDKEvent.prototype, "publishReplaceable").mockImplementation(
        async function (this: NDKEvent) {
          createdEvent = this;
          return new Set();
        },
      );

      await mutesProxy.mute("pubkey3");

      expect(createdEvent).toBeDefined();
      expect(createdEvent!.kind).toBe(NDKKind.MuteList);
      expect(createdEvent!.content).toBe("");
    });

    it("should add all muted pubkeys as p tags", async () => {
      let createdEvent: NDKEvent | undefined;
      vi.spyOn(NDKEvent.prototype, "publishReplaceable").mockImplementation(
        async function (this: NDKEvent) {
          createdEvent = this;
          return new Set();
        },
      );

      await mutesProxy.mute("pubkey3");

      expect(createdEvent).toBeDefined();
      expect(createdEvent!.tags).toContainEqual(["p", "pubkey1"]);
      expect(createdEvent!.tags).toContainEqual(["p", "pubkey2"]);
      expect(createdEvent!.tags).toContainEqual(["p", "pubkey3"]);
      expect(createdEvent!.tags).toHaveLength(3);
    });

    it("should publish the event", async () => {
      const publishSpy = vi.spyOn(NDKEvent.prototype, "publishReplaceable");

      await mutesProxy.mute("pubkey3");

      expect(publishSpy).toHaveBeenCalled();
    });
  });

  describe("unmute method", () => {
    it("should throw error when no active user", async () => {
      mockStore = {
        get currentUser() {
          return undefined;
        },
      } as Partial<ReactiveSessionsStore> as ReactiveSessionsStore;

      mutesProxy = new MutesProxy(mockStore, muteSet);

      await expect(mutesProxy.unmute("pubkey1")).rejects.toThrow(
        "No active user",
      );
    });

    it("should throw error when no NDK instance found", async () => {
      mockUser.ndk = null;

      await expect(mutesProxy.unmute("pubkey1")).rejects.toThrow(
        "No NDK instance found",
      );
    });

    it("should call ndk.assertSigner", async () => {
      await mutesProxy.unmute("pubkey1");

      expect(mockNdk.assertSigner).toHaveBeenCalled();
    });

    it("should do nothing when not muted", async () => {
      const originalSize = muteSet.size;

      await mutesProxy.unmute("pubkey3");

      expect(muteSet.size).toBe(originalSize);
    });

    it("should remove pubkey from mute set", async () => {
      expect(muteSet.has("pubkey1")).toBe(true);

      await mutesProxy.unmute("pubkey1");

      expect(muteSet.has("pubkey1")).toBe(false);
    });

    it("should create event with kind 10000 (MuteList)", async () => {
      let createdEvent: NDKEvent | undefined;
      vi.spyOn(NDKEvent.prototype, "publishReplaceable").mockImplementation(
        async function (this: NDKEvent) {
          createdEvent = this;
          return new Set();
        },
      );

      await mutesProxy.unmute("pubkey1");

      expect(createdEvent).toBeDefined();
      expect(createdEvent!.kind).toBe(NDKKind.MuteList);
      expect(createdEvent!.content).toBe("");
    });

    it("should add remaining muted pubkeys as p tags", async () => {
      let createdEvent: NDKEvent | undefined;
      vi.spyOn(NDKEvent.prototype, "publishReplaceable").mockImplementation(
        async function (this: NDKEvent) {
          createdEvent = this;
          return new Set();
        },
      );

      await mutesProxy.unmute("pubkey1");

      expect(createdEvent).toBeDefined();
      expect(createdEvent!.tags).toContainEqual(["p", "pubkey2"]);
      expect(createdEvent!.tags).not.toContainEqual(["p", "pubkey1"]);
      expect(createdEvent!.tags).toHaveLength(1);
    });

    it("should publish the event", async () => {
      const publishSpy = vi.spyOn(NDKEvent.prototype, "publishReplaceable");

      await mutesProxy.unmute("pubkey1");

      expect(publishSpy).toHaveBeenCalled();
    });
  });

  describe("toggle method", () => {
    it("should call unmute when already muted", async () => {
      const unmuteSpy = vi.spyOn(mutesProxy, "unmute");

      await mutesProxy.toggle("pubkey1");

      expect(unmuteSpy).toHaveBeenCalledWith("pubkey1");
    });

    it("should call mute when not muted", async () => {
      const muteSpy = vi.spyOn(mutesProxy, "mute");

      await mutesProxy.toggle("pubkey3");

      expect(muteSpy).toHaveBeenCalledWith("pubkey3");
    });
  });

  describe("Set delegation methods", () => {
    it("has() should delegate to underlying Set", () => {
      expect(mutesProxy.has("pubkey1")).toBe(true);
      expect(mutesProxy.has("pubkey3")).toBe(false);
    });

    it("size should return underlying Set size", () => {
      expect(mutesProxy.size).toBe(2);

      muteSet.add("pubkey3");
      expect(mutesProxy.size).toBe(3);
    });

    it("iterator should delegate to underlying Set", () => {
      const values = Array.from(mutesProxy);
      expect(values).toContain("pubkey1");
      expect(values).toContain("pubkey2");
      expect(values).toHaveLength(2);
    });

    it("values() should delegate to underlying Set", () => {
      const values = Array.from(mutesProxy.values());
      expect(values).toContain("pubkey1");
      expect(values).toContain("pubkey2");
      expect(values).toHaveLength(2);
    });

    it("keys() should delegate to underlying Set", () => {
      const keys = Array.from(mutesProxy.keys());
      expect(keys).toContain("pubkey1");
      expect(keys).toContain("pubkey2");
      expect(keys).toHaveLength(2);
    });

    it("entries() should delegate to underlying Set", () => {
      const entries = Array.from(mutesProxy.entries());
      expect(entries).toContainEqual(["pubkey1", "pubkey1"]);
      expect(entries).toContainEqual(["pubkey2", "pubkey2"]);
      expect(entries).toHaveLength(2);
    });

    it("forEach should delegate to underlying Set", () => {
      const callback = vi.fn();

      mutesProxy.forEach(callback);

      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback).toHaveBeenCalledWith("pubkey1", "pubkey1", muteSet);
      expect(callback).toHaveBeenCalledWith("pubkey2", "pubkey2", muteSet);
    });

    it("forEach should support thisArg", () => {
      const thisArg = { count: 0 };
      const callback = function (this: any) {
        this.count++;
      };

      mutesProxy.forEach(callback, thisArg);

      expect(thisArg.count).toBe(2);
    });
  });
});
