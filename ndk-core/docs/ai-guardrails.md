# AI Guardrails

AI Guardrails is a runtime validation system designed to catch common mistakes when using NDK, especially those made by
LLMs (Large Language Models) generating code.

## Overview

AI Guardrails provides:

- **Educational error messages** - Clear explanations of what went wrong and how to fix it
- **Zero performance impact** - Disabled by default, opt-in only
- **Granular control** - Enable all checks or selectively disable specific ones
- **LLM-friendly** - Designed to help AI-generated code self-correct
- **Always visible** - Both errors and warnings throw exceptions AND log to console.error (so AIs see them even if
  throws get swallowed)

## Quick Start

```typescript
import NDK from "@nostr-dev-kit/ndk";

// Enable all guardrails (recommended for development)
const ndk = new NDK({ aiGuardrails: true });

// Or enable with exceptions
const ndk = new NDK({
  aiGuardrails: {
    skip: new Set(['filter-large-limit', 'fetch-events-usage'])
  }
});

// Or programmatically control
ndk.aiGuardrails.skip('event-param-replaceable-no-dtag');
ndk.aiGuardrails.enable('filter-bech32-in-array');
```

## Available Guardrails

### Filter-Related Checks

#### `filter-bech32-in-array`

**Level:** Error

Catches bech32-encoded values in filter arrays. Filters expect hex values, not bech32.

```typescript
// ❌ WRONG
ndk.subscribe({
  authors: ['npub1...'] // bech32 npub
});

// ✅ CORRECT
import { nip19 } from 'nostr-tools';
const { data } = nip19.decode('npub1...');
ndk.subscribe({
  authors: [data] // hex pubkey
});

// Or use filterFromId for complete bech32 entities
import { filterFromId } from '@nostr-dev-kit/ndk';
const filter = filterFromId('nevent1...');
ndk.subscribe(filter);
```

#### `filter-only-limit`

**Level:** Error

Catches filters with only a `limit` parameter and no filtering criteria.

```typescript
// ❌ WRONG - will fetch random events
ndk.subscribe({ limit: 10 });

// ✅ CORRECT
ndk.subscribe({
  kinds: [1],
  limit: 10
});
```

#### `filter-large-limit`

**Level:** Warning

Warns about very large limit values that can cause performance issues.

```typescript
// ⚠️  WARNING
ndk.subscribe({
  kinds: [1],
  limit: 10000 // Too large!
});

// ✅ BETTER
ndk.subscribe({
  kinds: [1],
  limit: 100 // More reasonable
});
```

#### `filter-empty`

**Level:** Error

Catches completely empty filters.

```typescript
// ❌ WRONG
ndk.subscribe({});

// ✅ CORRECT
ndk.subscribe({ kinds: [1] });
```

#### `filter-since-after-until`

**Level:** Error

Catches filters where `since` is after `until`, which would match zero events.

```typescript
// ❌ WRONG
ndk.subscribe({
  since: 1000000,
  until: 500000
});

// ✅ CORRECT
ndk.subscribe({
  since: 500000,
  until: 1000000
});
```

#### `filter-invalid-a-tag`

**Level:** Error

Catches malformed `#a` tag values. Must be `kind:pubkey:d-tag` format.

```typescript
// ❌ WRONG
ndk.subscribe({
  '#a': ['nevent1...'] // bech32 instead of address
});

// ✅ CORRECT
ndk.subscribe({
  '#a': ['30023:fa984bd7...:my-article']
});
```

### fetchEvents Anti-Pattern

#### `fetch-events-usage`

**Level:** Warning

Warns about using `fetchEvents()` which is a blocking operation.

```typescript
// ⚠️  SUBOPTIMAL - blocks until EOSE
const events = await ndk.fetchEvents({ kinds: [1] });

// ✅ BETTER - reactive, non-blocking
ndk.subscribe({ kinds: [1] }, {
  onEvent: (event) => {
    console.log('Got event:', event);
  }
});

// Or for single events
const event = await ndk.fetchEvent({ kinds: [1] });
```

**When to disable:** If you truly need to block until all events arrive (rare).

```typescript
ndk.aiGuardrails.skip('fetch-events-usage');
const events = await ndk.fetchEvents(filter);
```

### Event Construction Checks

#### `event-missing-kind`

**Level:** Error

Catches attempts to sign events without a `kind`.

```typescript
// ❌ WRONG
const event = new NDKEvent(ndk);
event.content = "Hello";
await event.sign(); // Error!

// ✅ CORRECT
const event = new NDKEvent(ndk);
event.kind = 1; // Set kind first
event.content = "Hello";
await event.sign();
```

#### `event-content-is-object`

**Level:** Error

Catches attempts to set event content to an object instead of a string.

```typescript
// ❌ WRONG
const event = new NDKEvent(ndk);
event.kind = 30023;
event.content = { title: "My Article" }; // Object!
await event.sign(); // Error!

// ✅ CORRECT
const event = new NDKEvent(ndk);
event.kind = 30023;
event.content = JSON.stringify({ title: "My Article" });
await event.sign();
```

#### `event-param-replaceable-no-dtag`

**Level:** Warning

Warns about parameterized replaceable events (kinds 30000-39999) without a d-tag.

```typescript
// ⚠️  WARNING - will use empty string as d-tag
const event = new NDKEvent(ndk);
event.kind = 30023;
event.content = "My article";
await event.sign(); // Warning!

// ✅ BETTER
const event = new NDKEvent(ndk);
event.kind = 30023;
event.dTag = "my-unique-article-id";
event.content = "My article";
await event.sign();
```

#### `event-created-at-milliseconds`

**Level:** Error

Catches using milliseconds instead of seconds for `created_at`.

```typescript
// ❌ WRONG
const event = new NDKEvent(ndk);
event.kind = 1;
event.content = "Hello";
event.created_at = Date.now(); // Milliseconds!
await event.sign(); // Error!

// ✅ CORRECT
const event = new NDKEvent(ndk);
event.kind = 1;
event.content = "Hello";
event.created_at = Math.floor(Date.now() / 1000); // Seconds
await event.sign();
```

### Tag Validation Checks

#### `tag-invalid-p-tag`

**Level:** Error

Catches invalid p-tags (must be 64-character hex pubkeys).

```typescript
// ❌ WRONG
const event = new NDKEvent(ndk);
event.kind = 1;
event.tags.push(['p', 'npub1...']); // bech32!
await event.sign(); // Error!

// ✅ CORRECT
const event = new NDKEvent(ndk);
event.kind = 1;
event.tags.push(['p', ndkUser.pubkey]); // hex pubkey
await event.sign();
```

#### `tag-invalid-e-tag`

**Level:** Error

Catches invalid e-tags (must be 64-character hex event IDs).

```typescript
// ❌ WRONG
const event = new NDKEvent(ndk);
event.kind = 1;
event.tags.push(['e', 'note1...']); // bech32!
await event.sign(); // Error!

// ✅ CORRECT
const event = new NDKEvent(ndk);
event.kind = 1;
event.tags.push(['e', referencedEvent.id]); // hex event ID
await event.sign();
```

#### `event-manual-reply-markers`

**Level:** Warning

Warns about manually adding e-tags with reply/root markers instead of using `.reply()`.

```typescript
// ⚠️ SUBOPTIMAL
const reply = new NDKEvent(ndk);
reply.kind = 1;
reply.content = "Great post!";
reply.tags.push(['e', parentEvent.id, '', 'reply']); // Manual marker
await reply.sign(); // Warning!

// ✅ BETTER - Use reply() method
const reply = new NDKEvent(ndk);
reply.kind = 1;
reply.content = "Great post!";
await reply.reply(parentEvent); // Handles threading automatically
```

## Programmatic Control

### Temporarily Disable a Check

```typescript
// Disable for one-time use
ndk.aiGuardrails.skip('fetch-events-usage');
const events = await ndk.fetchEvents(filter);

// Re-enable it
ndk.aiGuardrails.enable('fetch-events-usage');
```

### Check What's Skipped

```typescript
const skipped = ndk.aiGuardrails.getSkipped();
console.log('Skipped checks:', skipped);
```

### Runtime Enable/Disable

```typescript
// Start with guardrails disabled
const ndk = new NDK();

// Enable later
ndk.aiGuardrails.setMode(true);

// Or enable with specific skips
ndk.aiGuardrails.setMode({
  skip: new Set(['filter-large-limit'])
});

// Disable entirely
ndk.aiGuardrails.setMode(false);
```

## Error Messages

When a guardrail is triggered, it will:

1. **Log to console.error** (visible even if the exception is caught)
2. **Throw an Error** (stops execution)

Both "ERROR" and "WARNING" level checks throw exceptions - warnings are not just console warnings.

### Fatal vs Non-Fatal Errors

Some errors are **fatal** - they represent fundamental mistakes that cannot be bypassed:

- Missing event kind
- Content as object instead of string
- Timestamps in milliseconds instead of seconds
- Invalid p-tag/e-tag formats
- Bech32 in filter arrays
- Empty filters or invalid time ranges

**Fatal errors do NOT show the "To disable this check" message.**

Example fatal error (no disable option):

```
🤖 AI_GUARDRAILS ERROR: Cannot sign event without 'kind'. Set event.kind before signing.

💡 Example: event.kind = 1; // for text note
```

Example non-fatal error (can be disabled):

```
🤖 AI_GUARDRAILS ERROR: Filter[0] contains only 'limit' without any filtering criteria.

💡 Add filtering criteria like 'kinds', 'authors', or '#e' tags.

🔇 To disable this check:
   ndk.aiGuardrails.skip('filter-only-limit')
   or set: ndk.aiGuardrails = { skip: new Set(['filter-only-limit']) }
```

## Best Practices

### For Development

Enable all guardrails during development:

```typescript
const ndk = new NDK({
  aiGuardrails: true,
  // ... other options
});
```

### For Production

Keep guardrails disabled in production for zero performance impact:

```typescript
const ndk = new NDK({
  aiGuardrails: process.env.NODE_ENV === 'development',
  // ... other options
});
```

### For AI-Generated Code

If you're using AI to generate code, enable guardrails and let the AI learn from the errors:

```typescript
// In your prompt/system message:
"When NDK throws an AI_GUARDRAILS error, read the error message carefully.
It explains what's wrong and how to fix it. Update your code accordingly."
```

The AI can also programmatically skip checks it knows are safe:

```typescript
// LLM can disable specific checks when it knows what it's doing
ndk.aiGuardrails.skip('filter-large-limit'); // I know I need 5000 events
ndk.subscribe({ kinds: [1], limit: 5000 });
```

## Complete Check ID Reference

Import these for type-safe check IDs:

```typescript
import { GuardrailCheckId } from '@nostr-dev-kit/ndk';

// All available check IDs:
GuardrailCheckId.FILTER_BECH32_IN_ARRAY
GuardrailCheckId.FILTER_ONLY_LIMIT
GuardrailCheckId.FILTER_LARGE_LIMIT
GuardrailCheckId.FILTER_EMPTY
GuardrailCheckId.FILTER_SINCE_AFTER_UNTIL
GuardrailCheckId.FILTER_INVALID_A_TAG
GuardrailCheckId.FETCH_EVENTS_USAGE
GuardrailCheckId.EVENT_MISSING_KIND
GuardrailCheckId.EVENT_PARAM_REPLACEABLE_NO_DTAG
GuardrailCheckId.EVENT_CREATED_AT_MILLISECONDS
GuardrailCheckId.EVENT_NO_NDK_INSTANCE
GuardrailCheckId.EVENT_CONTENT_IS_OBJECT
GuardrailCheckId.EVENT_MODIFIED_AFTER_SIGNING
GuardrailCheckId.EVENT_MANUAL_REPLY_MARKERS
GuardrailCheckId.TAG_E_FOR_PARAM_REPLACEABLE
GuardrailCheckId.TAG_BECH32_VALUE
GuardrailCheckId.TAG_DUPLICATE
GuardrailCheckId.TAG_INVALID_P_TAG
GuardrailCheckId.TAG_INVALID_E_TAG
GuardrailCheckId.SUBSCRIBE_NOT_STARTED
GuardrailCheckId.SUBSCRIBE_CLOSE_ON_EOSE_NO_HANDLER
GuardrailCheckId.SUBSCRIBE_PASSED_EVENT_NOT_FILTER
GuardrailCheckId.SUBSCRIBE_AWAITED
GuardrailCheckId.RELAY_INVALID_URL
GuardrailCheckId.RELAY_HTTP_INSTEAD_OF_WS
GuardrailCheckId.RELAY_NO_ERROR_HANDLERS
GuardrailCheckId.VALIDATION_PUBKEY_IS_NPUB
GuardrailCheckId.VALIDATION_PUBKEY_WRONG_LENGTH
GuardrailCheckId.VALIDATION_EVENT_ID_IS_BECH32
GuardrailCheckId.VALIDATION_EVENT_ID_WRONG_LENGTH
```

## Philosophy

AI Guardrails is designed with these principles:

1. **Educational, not punitive** - Error messages teach, don't just reject
2. **Opt-in, not opt-out** - Zero impact when disabled (default)
3. **Flexible** - Granular control over what's checked
4. **LLM-friendly** - Help AI code self-correct and learn patterns

## Contributing

To add a new guardrail:

1. Add the check ID to `GuardrailCheckId` in `ai-guardrails.ts`
2. Implement the check where appropriate (filter validation, event signing, etc.)
3. Use `ndk.aiGuardrails.error()` or `ndk.aiGuardrails.warn()`
4. Add clear, actionable error messages with hints
5. Document it in this file
6. Add tests

Example:

```typescript
if (ndk?.aiGuardrails.isEnabled()) {
  ndk.aiGuardrails.error(
    GuardrailCheckId.YOUR_NEW_CHECK,
    "Clear explanation of what's wrong",
    "Helpful hint on how to fix it"
  );
}
```
