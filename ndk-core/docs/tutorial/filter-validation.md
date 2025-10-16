# Filter Validation

NDK provides automatic validation and fixing of subscription filters to prevent runtime errors in cache adapters and
relay communications.

## The Problem

When creating filters programmatically, it's easy to accidentally include `undefined` values in arrays, especially when
using `.map()` operations or conditional logic. These undefined values can cause:

- Runtime errors in cache adapters (especially SQLite WASM: "Wrong API use: tried to bind a value of an unknown type")
- Invalid requests sent to relays
- Unexpected filtering behavior

## Filter Validation Modes

NDK supports three validation modes configurable at the instance level:

### 1. Validate Mode (Default)

Throws an error when invalid filters are detected, helping you catch bugs early in development.

```typescript
const ndk = new NDK({
    filterValidationMode: "validate" // This is the default
});

// This will throw an error
const filter = {
    authors: ["valid_pubkey", undefined], // ❌ Contains undefined
    kinds: [1, 30023]
};

ndk.subscribe(filter); // Throws: "Invalid filter(s) detected..."
```

### 2. Fix Mode

Automatically removes invalid values from filters, useful for production environments where you want to be lenient with
data.

```typescript
const ndk = new NDK({
    filterValidationMode: "fix"
});

// Filter with undefined values
const filter = {
    authors: ["pubkey1", undefined, "pubkey2"],
    kinds: [1, undefined, 30023],
    "#t": ["bitcoin", undefined, "nostr"]
};

// NDK will automatically clean the filter before sending to relays:
// {
//   authors: ["pubkey1", "pubkey2"],
//   kinds: [1, 30023],
//   "#t": ["bitcoin", "nostr"]
// }
```

### 3. Ignore Mode

Skip validation entirely (legacy behavior).

```typescript
const ndk = new NDK({
    filterValidationMode: "ignore"
});

// Filters are passed as-is, may cause runtime errors
```

## What is Validated?

The filter validation checks for:

### 1. Undefined Values

- Removes or reports `undefined` in any filter array

### 2. Type Validation

- **authors**: Must be strings and valid 64-character hex pubkeys
- **ids**: Must be strings and valid 64-character hex event IDs
- **kinds**: Must be numbers, integers between 0-65535
- **Tag filters** (#e, #p, etc.): Must be strings
    - #e and #p tags: Must be valid 64-character hex strings

### 3. Invalid Data

- Non-string values in string arrays
- Non-numeric values in kinds array
- Invalid hex strings where required
- Out-of-range kind numbers

## Common Scenarios

### Filtering Deleted Users

```typescript
// Problem: Some users might be deleted/undefined
const userIds = ["user1", "deleted_user", "user3"];
const filter = {
    authors: userIds.map(id => getUserPubkey(id)), // May include undefined
    kinds: [1]
};

// Solution 1: Use fix mode
const ndk = new NDK({ filterValidationMode: "fix" });
ndk.subscribe(filter); // Undefined values automatically removed

// Solution 2: Pre-filter your data
const validAuthors = userIds
    .map(id => getUserPubkey(id))
    .filter(pubkey => pubkey !== undefined);
const filter = {
    authors: validAuthors,
    kinds: [1]
};
```

### Conditional Kind Inclusion

```typescript
// Problem: Conditional logic might produce undefined
const filter = {
    kinds: [
        1, // Text note
        includeArticles ? 30023 : undefined, // May be undefined
        includeVideos ? 30024 : undefined
    ]
};

// Solution: Filter out undefined values
const kinds = [
    1,
    includeArticles && 30023,
    includeVideos && 30024
].filter(Boolean);

const filter = { kinds };
```

## Migration Guide

If you're upgrading NDK and encountering validation errors:

### Option 1: Fix Your Filters (Recommended)

```typescript
// Before
const filter = {
    authors: possiblyUndefinedArray,
    kinds: [1]
};

// After
const filter = {
    authors: possiblyUndefinedArray?.filter(a => a !== undefined),
    kinds: [1]
};
```

### Option 2: Use Fix Mode Temporarily

```typescript
const ndk = new NDK({
    filterValidationMode: "fix" // Auto-fix while you update your code
});
```

### Option 3: Use Ignore Mode (Not Recommended)

```typescript
const ndk = new NDK({
    filterValidationMode: "ignore" // Maintain old behavior
});
```

## Programmatic Validation

You can also validate or fix filters manually using the exported utilities:

```typescript
import { processFilters, NDKFilterValidationMode } from "@nostr-dev-kit/ndk";

// Validate filters (throws on invalid)
try {
    const validatedFilters = processFilters(
        filters,
        NDKFilterValidationMode.VALIDATE
    );
} catch (error) {
    console.error("Invalid filters:", error.message);
}

// Fix filters (returns cleaned filters)
const cleanedFilters = processFilters(
    filters,
    NDKFilterValidationMode.FIX
);
```

## Best Practices

1. **Use validate mode during development** to catch filter issues early
2. **Consider fix mode for production** if you're dealing with dynamic/user-generated filters
3. **Always filter out undefined values** when using `.map()` operations
4. **Validate hex strings** before adding them to filters
5. **Use TypeScript** to catch type issues at compile time

## Error Messages

In validate mode, you'll get detailed error messages showing exactly what's wrong:

```
Invalid filter(s) detected:
Filter[0].authors[1] is undefined
Filter[0].kinds[2] is not a number (got string)
Filter[0].#p[0] is not a valid 64-char hex string: "invalid"
```

This helps you quickly identify and fix the source of invalid data.