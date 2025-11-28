import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { SignerGenerator, UserGenerator } from "../../../../test";
import type { NDKEvent } from "../../../events/index";
import { NDK } from "../../../ndk/index";
import type { NDKPrivateKeySigner } from "../../private-key/index";
import { NDKNip46Backend, type IEventHandlingStrategy } from "./index";

/**
 * Unit tests for NDKNip46Backend event handling.
 *
 * Tests the async error handling fixes:
 * 1. Proper awaiting of sendResponse calls
 * 2. errorHandled flag preventing double error responses
 * 3. try-catch around sendResponse to handle failures gracefully
 */
describe("NDKNip46Backend", () => {
    let ndk: NDK;
    let backend: NDKNip46Backend;
    let signer: NDKPrivateKeySigner;
    let mockSendResponse: Mock;
    let mockParseEvent: Mock;

    beforeEach(async () => {
        ndk = new NDK();
        signer = SignerGenerator.getSigner("alice");

        // Create backend with a permit callback that always allows
        backend = new NDKNip46Backend(ndk, signer, async () => true);

        // Mock the RPC methods
        mockSendResponse = vi.fn().mockResolvedValue(undefined);
        mockParseEvent = vi.fn();

        backend.rpc = {
            sendResponse: mockSendResponse,
            parseEvent: mockParseEvent,
        } as any;
    });

    /**
     * Creates a mock NDKEvent with the given pubkey and a valid verifySignature method.
     */
    function createMockEvent(pubkey: string): NDKEvent {
        return {
            pubkey,
            verifySignature: vi.fn().mockReturnValue(true),
            rawEvent: vi.fn().mockReturnValue({}),
        } as unknown as NDKEvent;
    }

    describe("handleIncomingEvent", () => {
        describe("successful request handling", () => {
            it("should send response when strategy returns a result", async () => {
                // Arrange: Setup a mock strategy that returns a successful response
                const mockStrategy: IEventHandlingStrategy = {
                    handle: vi.fn().mockResolvedValue("success_response"),
                };
                backend.handlers["test_method"] = mockStrategy;

                mockParseEvent.mockResolvedValue({
                    id: "request-123",
                    method: "test_method",
                    params: ["param1"],
                });

                const event = createMockEvent("remote-pubkey");

                // Act: Handle the incoming event
                await (backend as any).handleIncomingEvent(event);

                // Assert: Verify sendResponse was called with the success response
                expect(mockSendResponse).toHaveBeenCalledTimes(1);
                expect(mockSendResponse).toHaveBeenCalledWith(
                    "request-123",
                    "remote-pubkey",
                    "success_response"
                );
            });

            it("should send 'Not authorized' error when strategy returns undefined", async () => {
                // Arrange: Setup a mock strategy that returns undefined (not authorized)
                const mockStrategy: IEventHandlingStrategy = {
                    handle: vi.fn().mockResolvedValue(undefined),
                };
                backend.handlers["test_method"] = mockStrategy;

                mockParseEvent.mockResolvedValue({
                    id: "request-123",
                    method: "test_method",
                    params: [],
                });

                const event = createMockEvent("remote-pubkey");

                // Act: Handle the incoming event
                await (backend as any).handleIncomingEvent(event);

                // Assert: Verify sendResponse was called with "Not authorized" error
                expect(mockSendResponse).toHaveBeenCalledTimes(1);
                expect(mockSendResponse).toHaveBeenCalledWith(
                    "request-123",
                    "remote-pubkey",
                    "error",
                    undefined,
                    "Not authorized"
                );
            });
        });

        describe("error handling", () => {
            it("should send error response when strategy throws an exception", async () => {
                // Arrange: Setup a mock strategy that throws an error
                const mockStrategy: IEventHandlingStrategy = {
                    handle: vi.fn().mockRejectedValue(new Error("Strategy failed")),
                };
                backend.handlers["test_method"] = mockStrategy;

                mockParseEvent.mockResolvedValue({
                    id: "request-123",
                    method: "test_method",
                    params: [],
                });

                const event = createMockEvent("remote-pubkey");

                // Act: Handle the incoming event
                await (backend as any).handleIncomingEvent(event);

                // Assert: Verify sendResponse was called with the error message
                expect(mockSendResponse).toHaveBeenCalledTimes(1);
                expect(mockSendResponse).toHaveBeenCalledWith(
                    "request-123",
                    "remote-pubkey",
                    "error",
                    undefined,
                    "Strategy failed"
                );
            });

            it("should NOT send double error response when strategy throws (errorHandled flag)", async () => {
                // Arrange: Setup a mock strategy that throws an error
                // This test verifies the fix for the double error response bug
                const mockStrategy: IEventHandlingStrategy = {
                    handle: vi.fn().mockRejectedValue(new Error("First error")),
                };
                backend.handlers["test_method"] = mockStrategy;

                mockParseEvent.mockResolvedValue({
                    id: "request-123",
                    method: "test_method",
                    params: [],
                });

                const event = createMockEvent("remote-pubkey");

                // Act: Handle the incoming event
                await (backend as any).handleIncomingEvent(event);

                // Assert: Verify sendResponse was called ONLY ONCE (not twice)
                // Before the fix, it would send "First error" AND "Not authorized"
                expect(mockSendResponse).toHaveBeenCalledTimes(1);
                expect(mockSendResponse).toHaveBeenCalledWith(
                    "request-123",
                    "remote-pubkey",
                    "error",
                    undefined,
                    "First error"
                );
            });

            it("should handle sendResponse failure gracefully during error response", async () => {
                // Arrange: Setup a strategy that throws, and sendResponse also fails
                const mockStrategy: IEventHandlingStrategy = {
                    handle: vi.fn().mockRejectedValue(new Error("Strategy error")),
                };
                backend.handlers["test_method"] = mockStrategy;

                mockParseEvent.mockResolvedValue({
                    id: "request-123",
                    method: "test_method",
                    params: [],
                });

                // Make sendResponse throw an error
                mockSendResponse.mockRejectedValue(new Error("Send failed"));

                const event = createMockEvent("remote-pubkey");

                // Act: Should not throw even though sendResponse fails
                let threwError = false;
                try {
                    await (backend as any).handleIncomingEvent(event);
                } catch {
                    threwError = true;
                }

                // Assert: handleIncomingEvent should not throw, and sendResponse was attempted
                expect(threwError).toBe(false);
                expect(mockSendResponse).toHaveBeenCalled();
            });

            it("should handle sendResponse failure gracefully during success response", async () => {
                // Arrange: Setup a strategy that succeeds, but sendResponse fails
                const mockStrategy: IEventHandlingStrategy = {
                    handle: vi.fn().mockResolvedValue("success"),
                };
                backend.handlers["test_method"] = mockStrategy;

                mockParseEvent.mockResolvedValue({
                    id: "request-123",
                    method: "test_method",
                    params: [],
                });

                // Make sendResponse throw an error
                mockSendResponse.mockRejectedValue(new Error("Send failed"));

                const event = createMockEvent("remote-pubkey");

                // Act: Should not throw even though sendResponse fails
                let threwError = false;
                try {
                    await (backend as any).handleIncomingEvent(event);
                } catch {
                    threwError = true;
                }

                // Assert: handleIncomingEvent should not throw, and sendResponse was attempted
                expect(threwError).toBe(false);
                expect(mockSendResponse).toHaveBeenCalled();
            });
        });

        describe("unsupported methods", () => {
            it("should send 'Not authorized' for unsupported methods", async () => {
                // Arrange: Use a method that doesn't have a handler
                mockParseEvent.mockResolvedValue({
                    id: "request-123",
                    method: "unsupported_method",
                    params: [],
                });

                const event = createMockEvent("remote-pubkey");

                // Act: Handle the incoming event
                await (backend as any).handleIncomingEvent(event);

                // Assert: Verify sendResponse was called with "Not authorized"
                expect(mockSendResponse).toHaveBeenCalledTimes(1);
                expect(mockSendResponse).toHaveBeenCalledWith(
                    "request-123",
                    "remote-pubkey",
                    "error",
                    undefined,
                    "Not authorized"
                );
            });
        });

        describe("signature verification", () => {
            it("should reject events with invalid signatures", async () => {
                // Arrange: Create an event with invalid signature
                const event = {
                    pubkey: "remote-pubkey",
                    verifySignature: vi.fn().mockReturnValue(false),
                    rawEvent: vi.fn().mockReturnValue({}),
                } as unknown as NDKEvent;

                mockParseEvent.mockResolvedValue({
                    id: "request-123",
                    method: "sign_event",
                    params: [],
                });

                // Act: Handle the incoming event
                await (backend as any).handleIncomingEvent(event);

                // Assert: No response should be sent for invalid signatures
                expect(mockSendResponse).not.toHaveBeenCalled();
            });
        });

        describe("async behavior", () => {
            it("should properly await sendResponse (not fire-and-forget)", async () => {
                // Arrange: Setup a mock that tracks if await is used
                let sendResponseCompleted = false;
                mockSendResponse.mockImplementation(async () => {
                    await new Promise((resolve) => setTimeout(resolve, 10));
                    sendResponseCompleted = true;
                });

                const mockStrategy: IEventHandlingStrategy = {
                    handle: vi.fn().mockResolvedValue("success"),
                };
                backend.handlers["test_method"] = mockStrategy;

                mockParseEvent.mockResolvedValue({
                    id: "request-123",
                    method: "test_method",
                    params: [],
                });

                const event = createMockEvent("remote-pubkey");

                // Act: Handle the event and wait for completion
                await (backend as any).handleIncomingEvent(event);

                // Assert: sendResponse should have completed (was properly awaited)
                expect(sendResponseCompleted).toBe(true);
            });
        });
    });

    describe("handler registration", () => {
        it("should have all standard NIP-46 handlers registered", () => {
            // Assert: Verify all standard handlers are registered
            expect(backend.handlers["connect"]).toBeDefined();
            expect(backend.handlers["sign_event"]).toBeDefined();
            expect(backend.handlers["nip04_encrypt"]).toBeDefined();
            expect(backend.handlers["nip04_decrypt"]).toBeDefined();
            expect(backend.handlers["nip44_encrypt"]).toBeDefined();
            expect(backend.handlers["nip44_decrypt"]).toBeDefined();
            expect(backend.handlers["get_public_key"]).toBeDefined();
            expect(backend.handlers["ping"]).toBeDefined();
        });

        it("should allow custom strategy registration via setStrategy", () => {
            // Arrange: Create a custom strategy
            const customStrategy: IEventHandlingStrategy = {
                handle: vi.fn().mockResolvedValue("custom_response"),
            };

            // Act: Register the custom strategy
            backend.setStrategy("custom_method", customStrategy);

            // Assert: The custom strategy should be registered
            expect(backend.handlers["custom_method"]).toBe(customStrategy);
        });
    });
});
