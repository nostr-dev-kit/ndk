import { beforeEach, describe, expect, it } from "vitest";
import { clearPreferredAdapter, getPreferredAdapter, setPreferredAdapter } from "./storage";

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};

    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value;
        },
        removeItem: (key: string) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        },
    };
})();

Object.defineProperty(global, "localStorage", {
    value: localStorageMock,
    writable: true,
});

describe("storage", () => {
    beforeEach(() => {
        localStorageMock.clear();
    });

    describe("getPreferredAdapter", () => {
        it("returns null when no preference is stored", () => {
            expect(getPreferredAdapter()).toBeNull();
        });

        it("returns wasm when wasm is stored", () => {
            setPreferredAdapter("wasm");
            expect(getPreferredAdapter()).toBe("wasm");
        });

        it("returns dexie when dexie is stored", () => {
            setPreferredAdapter("dexie");
            expect(getPreferredAdapter()).toBe("dexie");
        });

        it("returns null for invalid stored values", () => {
            localStorage.setItem("ndk-cache-adapter-preference", "invalid");
            expect(getPreferredAdapter()).toBeNull();
        });
    });

    describe("setPreferredAdapter", () => {
        it("stores wasm preference", () => {
            setPreferredAdapter("wasm");
            expect(localStorage.getItem("ndk-cache-adapter-preference")).toBe("wasm");
        });

        it("stores dexie preference", () => {
            setPreferredAdapter("dexie");
            expect(localStorage.getItem("ndk-cache-adapter-preference")).toBe("dexie");
        });

        it("stores none preference", () => {
            setPreferredAdapter("none");
            expect(localStorage.getItem("ndk-cache-adapter-preference")).toBe("none");
        });
    });

    describe("clearPreferredAdapter", () => {
        it("removes stored preference", () => {
            setPreferredAdapter("wasm");
            expect(getPreferredAdapter()).toBe("wasm");

            clearPreferredAdapter();
            expect(getPreferredAdapter()).toBeNull();
        });

        it("handles clearing when no preference exists", () => {
            clearPreferredAdapter();
            expect(getPreferredAdapter()).toBeNull();
        });
    });

    describe("persistence", () => {
        it("maintains preference across multiple gets", () => {
            setPreferredAdapter("wasm");

            expect(getPreferredAdapter()).toBe("wasm");
            expect(getPreferredAdapter()).toBe("wasm");
            expect(getPreferredAdapter()).toBe("wasm");
        });

        it("overwrites previous preference", () => {
            setPreferredAdapter("wasm");
            expect(getPreferredAdapter()).toBe("wasm");

            setPreferredAdapter("dexie");
            expect(getPreferredAdapter()).toBe("dexie");
        });
    });
});
