// Test setup file
import { vi } from "vitest";

// Mock IndexedDB before any imports happen
const mockIndexedDB = {
    open: vi.fn((dbName: string) => {
        const request: any = {
            onsuccess: null,
            onerror: null,
            onupgradeneeded: null,
            result: null,
        };

        // Simulate async success with no data
        setTimeout(() => {
            if (request.onsuccess) {
                request.onsuccess({ target: { result: null } });
            }
        }, 0);

        return request;
    }),
    deleteDatabase: vi.fn(),
    databases: vi.fn().mockResolvedValue([]),
};

global.indexedDB = mockIndexedDB as any;

// Also mock it on window for jsdom
if (typeof window !== 'undefined') {
    (window as any).indexedDB = mockIndexedDB;
}
