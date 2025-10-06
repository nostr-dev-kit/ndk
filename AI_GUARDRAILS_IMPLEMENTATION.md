# AI Guardrails Implementation Summary

## Overview

Successfully implemented a comprehensive AI Guardrails system for NDK that provides runtime validation to catch common mistakes, especially those made by LLMs generating code.

## Key Features

### 1. **Zero Performance Impact When Disabled**
- Guardrails are **off by default**
- Simple boolean check at runtime - no overhead when disabled
- Opt-in only via constructor parameter

### 2. **Flexible Configuration**

```typescript
// Enable all guardrails
const ndk = new NDK({ aiGuardrails: true });

// Enable with exceptions
const ndk = new NDK({
  aiGuardrails: { skip: new Set(['filter-large-limit']) }
});

// Programmatic control
ndk.aiGuardrails.skip('fetch-events-usage');
ndk.aiGuardrails.enable('filter-bech32-in-array');
```

### 3. **Educational Error Messages**

Errors include:
- Clear explanation of what went wrong
- Helpful hint on how to fix it
- Instructions on how to disable the specific check

Example:
```
🤖 AI_GUARDRAILS ERROR: Filter[0].authors[0] contains bech32: "npub1...".
Authors must be hex pubkeys, not npub.

💡 Decode npub first: nip19.decode(npub).data

🔇 To disable this check:
   ndk.aiGuardrails.skip('filter-bech32-in-array')
   or set: ndk.aiGuardrails = { skip: new Set(['filter-bech32-in-array']) }
```

### 4. **LLM Self-Correction**

LLMs can programmatically skip checks they understand:

```typescript
// LLM knows it needs a large limit for this specific use case
ndk.aiGuardrails.skip('filter-large-limit');
ndk.subscribe({ kinds: [1], limit: 5000 });
```

## Implemented Guardrails

### Filter Validation (7 checks)

1. **filter-bech32-in-array** (Error) - Catches bech32 in filter arrays
2. **filter-only-limit** (Error) - Filter with only limit parameter
3. **filter-large-limit** (Warning) - Limit > 1000
4. **filter-empty** (Error) - Empty filter object
5. **filter-since-after-until** (Error) - since > until
6. **filter-invalid-a-tag** (Error) - Invalid #a tag format
7. Multiple checks for bech32 in ids, authors, and tag filters

### Event Construction (4 checks)

1. **event-missing-kind** (Error) - Signing without kind
2. **event-content-is-object** (Error) - Content is object instead of string
3. **event-param-replaceable-no-dtag** (Warning) - Param replaceable without d-tag
4. **event-created-at-milliseconds** (Error) - Using milliseconds instead of seconds

### Tag Validation (3 checks)

1. **tag-invalid-p-tag** (Error) - Invalid p-tag (not 64-char hex)
2. **tag-invalid-e-tag** (Error) - Invalid e-tag (not 64-char hex)
3. **event-manual-reply-markers** (Warning) - Manual reply markers instead of using .reply()

### Anti-Patterns (1 check)

1. **fetch-events-usage** (Warning) - Using fetchEvents (blocking operation)

## Files Created/Modified

### New Files

1. **`ndk-core/src/utils/ai-guardrails.ts`** - Core guardrails system
2. **`ndk-core/src/utils/ai-guardrails.test.ts`** - Comprehensive tests
3. **`ndk-core/src/utils/index.ts`** - Export barrel
4. **`ndk-core/docs/ai-guardrails.md`** - Full documentation
5. **`ndk-core/docs/examples/ai-guardrails-example.ts`** - Usage examples

### Modified Files

1. **`ndk-core/src/ndk/index.ts`**
   - Added `aiGuardrails` property to NDK class
   - Added `aiGuardrails` option to NDKConstructorParams
   - Added import and initialization

2. **`ndk-core/src/utils/filter-validation.ts`**
   - Added `runAIGuardrailsForFilter()` function
   - Updated `processFilters()` to accept NDK instance
   - Implemented all 7 filter guardrails

3. **`ndk-core/src/subscription/index.ts`**
   - Updated to pass NDK instance to processFilters

4. **`ndk-core/src/events/index.ts`**
   - Added guardrail checks in `sign()` method
   - Checks for kind, content, created_at issues

5. **`ndk-core/src/ndk/index.ts`**
   - Added warning in `fetchEvents()` method

## Architecture

### Class Structure

```typescript
class AIGuardrails {
  private enabled: boolean;
  private skipSet: Set<string>;

  // Configuration
  setMode(mode: boolean | { skip?: Set<string> }): void
  isEnabled(): boolean
  shouldCheck(id: string): boolean

  // Programmatic control
  skip(id: string): void
  enable(id: string): void
  getSkipped(): string[]

  // Validation methods
  error(id: string, message: string, hint?: string): never | void
  warn(id: string, message: string, hint?: string): void
}
```

### Check ID Registry

```typescript
export const GuardrailCheckId = {
  FILTER_BECH32_IN_ARRAY: "filter-bech32-in-array",
  FILTER_ONLY_LIMIT: "filter-only-limit",
  FILTER_LARGE_LIMIT: "filter-large-limit",
  // ... 24 more IDs
} as const;
```

## Usage Patterns

### Development Mode

```typescript
const ndk = new NDK({
  aiGuardrails: true, // Enable all checks
  // ... other options
});
```

### Production Mode

```typescript
const ndk = new NDK({
  aiGuardrails: process.env.NODE_ENV === 'development',
  // ... other options
});
```

### LLM Integration

```typescript
try {
  // LLM-generated code that might have issues
  const event = new NDKEvent(ndk);
  event.content = "Hello";
  await event.sign(); // Throws: missing kind
} catch (error) {
  // LLM reads error message and self-corrects
  console.log(error.message); // Shows what's wrong and how to fix it

  // LLM generates corrected code
  event.kind = 1;
  await event.sign(); // ✅ Success
}
```

## Benefits

1. **Catches Common Mistakes Early** - Errors appear immediately, not hours later
2. **Educational** - Error messages teach correct usage
3. **LLM-Friendly** - AI code can self-correct based on error messages
4. **Zero Cost When Disabled** - No performance impact in production
5. **Granular Control** - Enable/disable specific checks as needed
6. **Type-Safe** - GuardrailCheckId provides autocomplete and type safety

## Testing

Run tests:
```bash
bun test ndk-core/src/utils/ai-guardrails.test.ts
```

## Future Extensions

Easy to add new guardrails:

1. Add check ID to `GuardrailCheckId`
2. Implement check where appropriate
3. Use `ndk.aiGuardrails.error()` or `.warn()`
4. Document in ai-guardrails.md
5. Add tests

Example:
```typescript
if (ndk?.aiGuardrails.shouldCheck('new-check')) {
  ndk.aiGuardrails.error(
    'new-check',
    'Clear explanation',
    'Helpful hint'
  );
}
```

## Remaining Guardrails to Implement

From original list (not yet implemented):

- Tag construction (e, p, a tag validation)
- Duplicate tag detection
- Subscription patterns (not started, close-on-eose without handler)
- Relay URL validation
- Pubkey/event ID format validation in more places
- Post-signing modification detection

These can be added incrementally following the same pattern.

## Notes

- System is fully backwards compatible
- No breaking changes to existing API
- Documentation is comprehensive
- Examples demonstrate all use cases
- Tests validate core functionality
