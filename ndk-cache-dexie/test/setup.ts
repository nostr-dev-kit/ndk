import "fake-indexeddb/auto";
import { vi } from "vitest";

// Mock the debug module
vi.mock("debug", () => {
    return {
        default: () => {
            const debugFn = (...args: any[]) => {
                console.log("[debug]", ...args);
            };
            debugFn.extend = () => debugFn;
            return debugFn;
        },
    };
});
