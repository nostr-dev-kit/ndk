import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NDK } from "../ndk/index";
import { NDKRelayConnectivity } from "./connectivity";
import { NDKRelay, NDKRelayStatus } from "./index";

// Define WebSocket and its states as globals for the tests
// This enables the tests to run in a Node.js environment
global.WebSocket = class MockWebSocket {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    url: string;
    readyState = 0;
    onopen: (() => void) | null = null;
    onclose: (() => void) | null = null;
    onmessage: ((event: any) => void) | null = null;
    onerror: ((error: any) => void) | null = null;

    constructor(url: string) {
        this.url = url;
    }

    close() {}
    send() {}
} as any;

vi.mock("ws");
vi.useFakeTimers();

describe("NDKRelayConnectivity", () => {
    let ndk: NDK;
    let relay: NDKRelay;
    let connectivity: NDKRelayConnectivity;

    beforeEach(() => {
        ndk = new NDK();
        relay = new NDKRelay("wss://test.relay", undefined, ndk);
        connectivity = new NDKRelayConnectivity(relay, ndk);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("connect", () => {
        it("should set status to CONNECTING when disconnected", async () => {
            await connectivity.connect();
            expect(connectivity.status).toBe(NDKRelayStatus.CONNECTING);
        });

        it("should create a new WebSocket connection", async () => {
            const mockWebSocket = vi.fn();
            const originalWebSocket = global.WebSocket;
            global.WebSocket = mockWebSocket as any;

            await connectivity.connect();
            expect(mockWebSocket).toHaveBeenCalledWith("wss://test.relay/");

            // Restore the original mock
            global.WebSocket = originalWebSocket;
        });
    });

    describe("disconnect", () => {
        beforeEach(() => {
            connectivity._status = NDKRelayStatus.CONNECTED;
        });
        it("should set status to DISCONNECTING", () => {
            connectivity.disconnect();
            expect(connectivity.status).toBe(NDKRelayStatus.DISCONNECTING);
        });

        it("should close the WebSocket connection", () => {
            const mockClose = vi.fn();
            connectivity.ws = { close: mockClose } as any;
            connectivity.disconnect();
            expect(mockClose).toHaveBeenCalled();
        });

        it("should handle disconnect error", () => {
            const mockClose = vi.fn(() => {
                throw new Error("Disconnect failed");
            });
            connectivity.ws = { close: mockClose } as any;
            connectivity.disconnect();
            expect(connectivity.status).toBe(NDKRelayStatus.DISCONNECTED);
        });
    });

    describe("isAvailable", () => {
        it("should return true when status is CONNECTED", () => {
            connectivity._status = NDKRelayStatus.CONNECTED;
            expect(connectivity.isAvailable()).toBe(true);
        });

        it("should return false when status is not CONNECTED", () => {
            connectivity._status = NDKRelayStatus.DISCONNECTED;
            expect(connectivity.isAvailable()).toBe(false);
        });
    });

    describe("send", () => {
        it("should send message when connected and WebSocket is open", async () => {
            const mockSend = vi.fn();
            connectivity._status = NDKRelayStatus.CONNECTED;
            connectivity.ws = { readyState: WebSocket.OPEN, send: mockSend } as any;
            await connectivity.send("test message");
            expect(mockSend).toHaveBeenCalledWith("test message");
        });

        it("should not send message when not connected", async () => {
            connectivity._status = NDKRelayStatus.DISCONNECTED;
            const mockSend = vi.fn();
            connectivity.ws = { readyState: WebSocket.OPEN, send: mockSend } as any;

            await connectivity.send("test message");

            expect(mockSend).not.toHaveBeenCalled();
        });
    });

    describe("publish", () => {
        it("should send EVENT message and return a promise", async () => {
            const mockSend = vi.spyOn(connectivity, "send").mockResolvedValue(undefined);
            const event = { id: "test-id", content: "test-content" };
            const publishPromise = connectivity.publish(event as any);
            expect(mockSend).toHaveBeenCalledWith('["EVENT",{"id":"test-id","content":"test-content"}]');
            expect(publishPromise).toBeInstanceOf(Promise);
        });
    });

    describe("count", () => {
        it("should send COUNT message and return a promise", async () => {
            const mockSend = vi.spyOn(connectivity, "send").mockResolvedValue(undefined);
            const filters = [{ authors: ["test-author"] }];
            const countPromise = connectivity.count(filters, {});
            expect(mockSend).toHaveBeenCalledWith(
                expect.stringMatching(/^\["COUNT","count:\d+",\{"authors":\["test-author"\]\}\]$/),
            );
            expect(countPromise).toBeInstanceOf(Promise);
        });
    });
});
