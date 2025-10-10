/**
 * Test setup for Svelte 5 runes
 *
 * Provides mock implementations of $state and $derived for testing stores
 */

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

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
(globalThis as any).$state = <T>(initialValue: T): T => {
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
(globalThis as any).$derived = <T>(fn: () => T): T => fn();

// Mock $derived.by
(globalThis as any).$derived.by = <T>(fn: () => T): T => fn();

// Mock $effect
(globalThis as any).$effect = (fn: () => void | (() => void)) => {
    const cleanup = fn();
    // In tests, we don't need to track effects, but return a no-op cleanup
    return () => {
        if (typeof cleanup === "function") cleanup();
    };
};

// Mock $props (for components)
(globalThis as any).$props = <T>(): T => ({}) as T;
