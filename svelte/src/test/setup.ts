/**
 * Test setup for Svelte 5 runes
 *
 * Provides mock implementations of $state and $derived for testing stores
 */

// Simple reactive implementation for tests
class ReactiveValue<T> {
    #value: T;
    #subscribers = new Set<() => void>();

    constructor(initialValue: T) {
        this.#value = initialValue;
    }

    get value(): T {
        return this.#value;
    }

    set value(newValue: T) {
        this.#value = newValue;
        this.#subscribers.forEach((fn) => fn());
    }

    subscribe(fn: () => void) {
        this.#subscribers.add(fn);
        return () => this.#subscribers.delete(fn);
    }
}

// Mock $state
(globalThis as any).$state = function <T>(initialValue: T): T {
    if (typeof initialValue === "object" && initialValue !== null) {
        // For objects and arrays, return a proxy that tracks changes
        return new Proxy(initialValue, {
            set(target: any, prop, value) {
                target[prop] = value;
                return true;
            },
        });
    }
    return initialValue as T;
};

// Mock $derived
(globalThis as any).$derived = function <T>(fn: () => T): T {
    return fn();
};

// Mock $derived.by
(globalThis as any).$derived.by = function <T>(fn: () => T): T {
    return fn();
};

// Mock $effect
(globalThis as any).$effect = function (fn: () => void | (() => void)) {
    const cleanup = fn();
    // In tests, we don't need to track effects, but return a no-op cleanup
    return () => {
        if (typeof cleanup === "function") cleanup();
    };
};

// Mock $props (for components)
(globalThis as any).$props = function <T>(): T {
    return {} as T;
};
