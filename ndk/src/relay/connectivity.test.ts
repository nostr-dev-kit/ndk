import { NDKRelayConnectivity } from "./connectivity";
import { NDKRelay, NDKRelayStatus } from "./index";
import { NDK } from "../ndk/index";

jest.mock("ws");
jest.useFakeTimers();

describe("NDKRelayConnectivity", () => {
    let ndk: NDK;
    let relay: NDKRelay;
    let connectivity: NDKRelayConnectivity;

    beforeEach(() => {
        ndk = new NDK();
        relay = new NDKRelay("wss://test.relay");
        connectivity = new NDKRelayConnectivity(relay, ndk);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("connect", () => {
        it("should set status to CONNECTING when disconnected", async () => {
            await connectivity.connect();
            expect(connectivity.status).toBe(NDKRelayStatus.CONNECTING);
        });

        it("should set status to RECONNECTING when not disconnected", async () => {
            connectivity["_status"] = NDKRelayStatus.CONNECTED;
            await connectivity.connect();
            expect(connectivity.status).toBe(NDKRelayStatus.RECONNECTING);
        });

        it("should create a new WebSocket connection", async () => {
            const mockWebSocket = jest.fn();
            global.WebSocket = mockWebSocket as any;

            await connectivity.connect();
            expect(mockWebSocket).toHaveBeenCalledWith("wss://test.relay/");
        });
    });

    describe("disconnect", () => {
        beforeEach(() => {
            connectivity["_status"] = NDKRelayStatus.CONNECTED;
        });
        it("should set status to DISCONNECTING", () => {
            connectivity.disconnect();
            expect(connectivity.status).toBe(NDKRelayStatus.DISCONNECTING);
        });

        it("should close the WebSocket connection", () => {
            const mockClose = jest.fn();
            connectivity["ws"] = { close: mockClose } as any;
            connectivity.disconnect();
            expect(mockClose).toHaveBeenCalled();
        });

        it("should handle disconnect error", () => {
            const mockClose = jest.fn(() => {
                throw new Error("Disconnect failed");
            });
            connectivity["ws"] = { close: mockClose } as any;
            connectivity.disconnect();
            expect(connectivity.status).toBe(NDKRelayStatus.DISCONNECTED);
        });
    });

    describe("isAvailable", () => {
        it("should return true when status is CONNECTED", () => {
            connectivity["_status"] = NDKRelayStatus.CONNECTED;
            expect(connectivity.isAvailable()).toBe(true);
        });

        it("should return false when status is not CONNECTED", () => {
            connectivity["_status"] = NDKRelayStatus.DISCONNECTED;
            expect(connectivity.isAvailable()).toBe(false);
        });
    });

    describe("send", () => {
        it("should send message when connected and WebSocket is open", async () => {
            const mockSend = jest.fn();
            connectivity["_status"] = NDKRelayStatus.CONNECTED;
            connectivity["ws"] = { readyState: WebSocket.OPEN, send: mockSend } as any;
            await connectivity.send("test message");
            expect(mockSend).toHaveBeenCalledWith("test message");
        });

        it("should throw error when not connected", async () => {
            connectivity["_status"] = NDKRelayStatus.DISCONNECTED;
            await expect(connectivity.send("test message")).rejects.toThrow(
                "Attempting to send on a closed relay connection"
            );
        });
    });

    describe("publish", () => {
        it("should send EVENT message and return a promise", async () => {
            const mockSend = jest.spyOn(connectivity, "send").mockResolvedValue(undefined);
            const event = { id: "test-id", content: "test-content" };
            const publishPromise = connectivity.publish(event as any);
            expect(mockSend).toHaveBeenCalledWith(
                '["EVENT",{"id":"test-id","content":"test-content"}]'
            );
            expect(publishPromise).toBeInstanceOf(Promise);
        });
    });

    describe("count", () => {
        it("should send COUNT message and return a promise", async () => {
            const mockSend = jest.spyOn(connectivity, "send").mockResolvedValue(undefined);
            const filters = [{ authors: ["test-author"] }];
            const countPromise = connectivity.count(filters, {});
            expect(mockSend).toHaveBeenCalledWith(
                expect.stringMatching(/^\["COUNT","count:\d+",\{"authors":\["test-author"\]\}\]$/)
            );
            expect(countPromise).toBeInstanceOf(Promise);
        });
    });
});
