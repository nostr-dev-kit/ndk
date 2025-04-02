import { vi } from 'vitest';

// Mock react's useEffect and useState
vi.mock('react', async () => {
    const actual = await vi.importActual('react');
    return {
        ...(actual as object),
        useEffect: vi.fn((fn) => fn()),
    };
});

// Silence console errors during tests
vi.spyOn(console, 'error').mockImplementation(() => {});
