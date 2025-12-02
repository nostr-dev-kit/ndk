import { vi } from "vitest";

// Make vi available globally
(globalThis as any).vi = vi;

// Setup common mocks
vi.mock("ws", () => ({
    default: class MockWebSocket {
        addEventListener() {}
        send() {}
        close() {}
    },
}));

// Make common Vitest functions available
Object.defineProperties(globalThis, {
    // Timer utilities
    useFakeTimers: { get: () => vi.useFakeTimers },
    useRealTimers: { get: () => vi.useRealTimers },

    // Mock utilities
    mock: { get: () => vi.mock },
    fn: { get: () => vi.fn },
    spyOn: { get: () => vi.spyOn },

    // Global state
    stubGlobal: { get: () => vi.stubGlobal },
    unstubAllGlobals: { get: () => vi.unstubAllGlobals },

    // Mock management
    restoreAllMocks: { get: () => vi.restoreAllMocks },
    resetAllMocks: { get: () => vi.resetAllMocks },
    clearAllMocks: { get: () => vi.clearAllMocks },
});

// Add any other common test setup here
