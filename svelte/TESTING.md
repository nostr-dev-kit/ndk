# Testing Guide for @nostr-dev-kit/svelte

This guide explains how to write tests for the NDK Svelte package, which uses **Svelte 5 runes** and modern reactive patterns.

## Table of Contents

- [Quick Start](#quick-start)
- [Test Utilities](#test-utilities)
- [Testing Patterns](#testing-patterns)
  - [Testing Reactive Code (Runes)](#testing-reactive-code-runes)
  - [Testing Builder Actions](#testing-builder-actions)
  - [Testing Stores](#testing-stores)
  - [Mocking NDK Methods](#mocking-ndk-methods)
- [Best Practices](#best-practices)
- [Running Tests](#running-tests)

## Quick Start

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test follow-action
```

## Test Utilities

We provide comprehensive test utilities in `src/lib/test-utils.ts`:

### From ndk-core

```typescript
import {
    UserGenerator,      // Generate test users (alice, bob, carol, dave, eve)
    SignerGenerator,    // Generate signers for test users
    TestEventFactory,   // Create test events easily
    EventGenerator,     // Generate various event types
    RelayMock,          // Mock relay for testing
    TimeController,     // Control time in tests
} from './test-utils';
```

### Svelte-specific helpers

```typescript
import {
    createTestNDK,      // Create NDK instance for tests
    waitForEffects,     // Wait for reactive effects to settle
    generateTestPubkey, // Generate valid test pubkeys
} from './test-utils';
```

## Testing Patterns

### Testing Reactive Code (Runes)

When testing Svelte 5 code that uses `$state`, `$derived`, or `$effect`, you must use `$effect.root()` for proper cleanup:

```typescript
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createTestNDK, waitForEffects } from "../../test-utils";

describe("My Reactive Function", () => {
    let ndk;
    let cleanup;

    beforeEach(() => {
        ndk = createTestNDK();
    });

    afterEach(() => {
        cleanup?.();
        cleanup = undefined;
    });

    it("should react to changes", async () => {
        let result;

        cleanup = $effect.root(() => {
            // Your reactive code here
            result = myReactiveFunction(ndk, () => someConfig);
        });

        // Wait for effects to settle
        await waitForEffects();

        expect(result.someProperty).toBe(expectedValue);
    });
});
```

### Testing Builder Actions

Builder actions (follow, zap, reply, etc.) follow a consistent pattern:

```typescript
import { NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestNDK, UserGenerator } from "../../test-utils";
import { createFollowAction } from "./follow-action.svelte";

describe("createFollowAction", () => {
    let ndk;
    let cleanup;
    let testUser;

    beforeEach(async () => {
        ndk = createTestNDK();
        ndk.signer = NDKPrivateKeySigner.generate();

        // Create test user
        testUser = await UserGenerator.getUser("bob", ndk);

        // Mock store getters (they're read-only)
        const mockFollows = {
            has: vi.fn().mockReturnValue(false),
            add: vi.fn().mockResolvedValue(undefined),
            remove: vi.fn().mockResolvedValue(undefined),
        };
        vi.spyOn(ndk, "$follows", "get").mockReturnValue(mockFollows);
    });

    afterEach(() => {
        cleanup?.();
        cleanup = undefined;
    });

    it("should follow user when not following", async () => {
        const mockFollows = ndk.$follows;
        vi.mocked(mockFollows.has).mockReturnValue(false);

        let action;
        cleanup = $effect.root(() => {
            action = createFollowAction(() => ({ ndk, target: testUser }));
        });

        await action.follow();

        expect(mockFollows.add).toHaveBeenCalledWith(testUser.pubkey);
    });
});
```

### Testing Stores

Stores in NDK Svelte are reactive and use Svelte 5 runes:

```typescript
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestNDK, waitForEffects } from "../test-utils";

describe("MyStore", () => {
    let ndk;
    let cleanup;

    beforeEach(() => {
        ndk = createTestNDK();
    });

    afterEach(() => {
        cleanup?.();
        cleanup = undefined;
    });

    it("should update reactive state", async () => {
        cleanup = $effect.root(() => {
            // Access store
            const value = ndk.$myStore.someProperty;
            // Test store behavior
        });

        await waitForEffects();
        // Assertions
    });
});
```

### Mocking NDK Methods

Use Vitest's `vi.spyOn()` to mock NDK methods:

```typescript
import { vi } from "vitest";
import { NDKEvent } from "@nostr-dev-kit/ndk";

it("should fetch events", async () => {
    const mockEvent = new NDKEvent(ndk);
    mockEvent.content = "Test content";

    // Mock the fetchEvent method
    vi.spyOn(ndk, "fetchEvent").mockResolvedValue(mockEvent);

    // Your test code that calls ndk.fetchEvent
    const result = await ndk.fetchEvent("note1...");

    expect(ndk.fetchEvent).toHaveBeenCalledWith("note1...", { wrap: true });
    expect(result.content).toBe("Test content");
});
```

#### Mocking Store Getters

Stores like `$follows` are getters and must be mocked differently:

```typescript
// ❌ Wrong - will throw "Cannot set property"
ndk.$follows = mockFollows;

// ✅ Correct - mock the getter
const mockFollows = {
    has: vi.fn().mockReturnValue(false),
    add: vi.fn().mockResolvedValue(undefined),
};
vi.spyOn(ndk, "$follows", "get").mockReturnValue(mockFollows);

// Then access it normally
const follows = ndk.$follows;
vi.mocked(follows.has).mockReturnValue(true);
```

## Best Practices

### 1. Use Test Users from UserGenerator

Always use `UserGenerator` for consistent test users:

```typescript
const alice = await UserGenerator.getUser("alice", ndk);
const bob = await UserGenerator.getUser("bob", ndk);
```

Available users: `alice`, `bob`, `carol`, `dave`, `eve`

### 2. Clean Up $effect.root

Always clean up reactive roots in `afterEach`:

```typescript
afterEach(() => {
    cleanup?.();
    cleanup = undefined;
});
```

### 3. Wait for Effects

After triggering reactive changes, wait for effects to settle:

```typescript
await waitForEffects();
```

### 4. Test Both Success and Error Cases

```typescript
describe("myFunction", () => {
    it("should succeed with valid input", () => {
        // Happy path
    });

    it("should throw with invalid input", () => {
        expect(() => myFunction(invalid)).toThrow("Expected error");
    });

    it("should handle async errors", async () => {
        await expect(myAsyncFunction()).rejects.toThrow("Error");
    });
});
```

### 5. Mock at the Right Level

- Mock NDK methods for unit tests
- Mock relay responses for integration tests
- Use TestEventFactory for creating realistic test data

### 6. Keep Tests Focused

Each test should verify ONE behavior:

```typescript
// ❌ Bad - testing multiple things
it("should follow and unfollow users", () => {
    // Follow logic
    // Unfollow logic
});

// ✅ Good - focused tests
it("should add user to follows when not following", () => {
    // Only test the follow action
});

it("should remove user from follows when already following", () => {
    // Only test the unfollow action
});
```

### 7. Use Descriptive Test Names

```typescript
// ❌ Bad
it("works", () => {});

// ✅ Good
it("should return false when target is undefined", () => {});
it("should add user to follows when not following", () => {});
```

## Running Tests

### Local Development

```bash
# Run all tests once
pnpm test

# Watch mode (re-runs on file changes)
pnpm test:watch

# Run specific test file
pnpm test follow-action

# Run with coverage
pnpm test:coverage
```

### CI/CD

Tests run automatically in GitHub Actions on every push. The build will fail if tests fail.

### Coverage Thresholds

Current coverage thresholds (configured in `vitest.config.ts`):
- Lines: 60%
- Functions: 60%
- Branches: 60%
- Statements: 60%

These will increase as we add more tests.

## Common Patterns

### Testing Event Publishing

```typescript
it("should publish event", async () => {
    const mockPublish = vi.fn().mockResolvedValue(new Set());
    vi.spyOn(someEvent, "publish").mockImplementation(mockPublish);

    await action.execute();

    expect(mockPublish).toHaveBeenCalled();
});
```

### Testing Subscriptions

```typescript
it("should subscribe to events", () => {
    const mockSubscribe = vi.fn();
    vi.spyOn(ndk, "subscribe").mockReturnValue(mockSubscribe as any);

    cleanup = $effect.root(() => {
        createSubscription(ndk, () => ({ kinds: [1] }));
    });

    expect(ndk.subscribe).toHaveBeenCalledWith(
        expect.objectContaining({ kinds: [1] })
    );
});
```

### Testing Error Handling

```typescript
it("should handle network errors gracefully", async () => {
    vi.spyOn(ndk, "fetchEvent").mockRejectedValue(new Error("Network error"));

    let event;
    cleanup = $effect.root(() => {
        event = createFetchEvent(ndk, () => "note1test");
    });

    await waitForEffects();

    expect(event.content).toBeUndefined();
});
```

## Debugging Tests

### View Test Output

Tests run in a headless browser. For debugging:

1. Check the error message and stack trace
2. Look at the failure screenshots in `src/lib/__screenshots__/`
3. Add `console.log()` statements (they appear in test output)
4. Use `vi.fn()` to inspect mock call arguments

### Common Issues

**Issue**: `$state` can only be used as a variable declaration initializer

**Solution**: Don't use `$state()` inside `$effect.root()`. Declare reactive state outside:

```typescript
// ❌ Bad
cleanup = $effect.root(() => {
    const state = $state(initialValue);
});

// ✅ Good - don't use $state in tests, pass values via config callbacks
cleanup = $effect.root(() => {
    result = myFunction(() => ({ config: value }));
});
```

**Issue**: Cannot set property which has only a getter

**Solution**: Use `vi.spyOn()` to mock getters:

```typescript
vi.spyOn(ndk, "$follows", "get").mockReturnValue(mockFollows);
```

## Contributing Tests

When adding new features:

1. **Write tests first** (TDD approach recommended)
2. **Follow existing patterns** in similar test files
3. **Use test utilities** from `test-utils.ts`
4. **Test edge cases** (undefined, null, empty, errors)
5. **Keep tests fast** (mock expensive operations)
6. **Document complex setups** with comments

Example PR checklist:
- [ ] Tests added for new functionality
- [ ] Tests pass locally (`pnpm test`)
- [ ] Coverage meets thresholds (`pnpm test:coverage`)
- [ ] Tests follow patterns in this guide
- [ ] Edge cases are covered

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Svelte 5 Runes](https://svelte.dev/docs/svelte/what-are-runes)
- [NDK Documentation](https://ndk.fyi/)
- [Playwright Browser Testing](https://playwright.dev/)

## Getting Help

- Check existing tests for examples
- Read this guide thoroughly
- Ask in GitHub issues or discussions
- Reference `test-utils.ts` for available helpers

---

**Remember**: Tests are documentation. Write tests that clearly show how your code should be used.
