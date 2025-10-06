import "fake-indexeddb/auto";
import { vi } from "vitest";

// Mock the debug module
vi.mock("debug", () => {
    return {
        default: () => {
            const debugFn = (..._args: any[]) => {};
            debugFn.extend = () => debugFn;
            return debugFn;
        },
    };
});
