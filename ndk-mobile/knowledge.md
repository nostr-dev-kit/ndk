# NDK Mobile Knowledge

## State Management

### Current Approach (Zustand)

- Zustand stores are created as singletons to prevent multiple instances
- Use lazy initialization with getStore() pattern
- Export hooks that return singleton store state
- When consuming store in hooks, use selectors directly

### Experimental Jotai Migration

- Atoms provide more granular state management
- Derived state can be computed automatically with derived atoms
- Actions are explicit atoms that can be composed
- State updates are more explicit with set function
- Can coexist with Zustand stores during gradual migration

## Store Patterns

- Zustand stores should be created as singletons to prevent multiple instances
- Use the pattern of lazy initialization with a getStore() function for stores
- Export a hook created with zustand's create(), not the store instance
- The hook should return the singleton store's state
- When consuming the store in hooks, use the hook directly with selectors:

    ```typescript
    // Correct:
    const value = useStore((s) => s.value);

    // Incorrect:
    const store = useStore;
    const value = store((s) => s.value);
    ```

## Important Implementation Details

- NDK store is a singleton to maintain consistent state across the app
- Store initialization happens on first access
- Subsequent imports reuse the same store instance

## Context Provider Pattern

- Applications must be wrapped with NDKProvider to use NDK hooks
- NDKProvider initializes and provides both NDK and Session stores
- All hooks (useNDK, useNDKSession) must be used within NDKProvider
- Example usage:
    ```tsx
    <NDKProvider params={{ settingsStore, ...ndkParams }}>
        <App />
    </NDKProvider>
    ```
