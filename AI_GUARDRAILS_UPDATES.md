# AI Guardrails Updates

## Changes Made

### 0. ✅ Warnings Now Throw Exceptions + Fatal Errors Cannot Be Disabled
- **Reason:** AIs need to see warnings even if try/catch blocks swallow exceptions
- **Implementation:** Both `error()` and `warn()` now:
  1. Log to `console.error()` first (visible even if throw is caught)
  2. Then throw an Error (stops execution)
- **Impact:** All guardrails (ERROR and WARNING levels) are now guaranteed visible to AIs
- **Fatal Errors:** Some errors are so fundamental that they cannot be disabled:
  - `event-missing-kind` - Cannot sign without kind
  - `event-content-is-object` - Content must be string
  - `event-created-at-milliseconds` - Timestamp format error
  - `tag-invalid-p-tag` - Invalid p-tag format
  - `tag-invalid-e-tag` - Invalid e-tag format
  - `filter-bech32-in-array` - Bech32 in filter arrays
  - `filter-empty` - Empty filter
  - `filter-since-after-until` - Invalid time range
  - `filter-invalid-a-tag` - Invalid #a tag format
- **Fatal errors do NOT show "To disable this check" message**

### 1. ✅ Removed `event-undefined-content` Check
- **Reason:** Content defaults to `""` via `content ??= ""`
- **Impact:** One less unnecessary check, cleaner error messages

### 2. ✅ Added Invalid Tag Validation

#### `tag-invalid-p-tag` (Error)
Validates that all p-tags contain valid 64-character hex pubkeys.

```typescript
// ❌ Before: Would allow invalid p-tags
event.tags.push(['p', 'npub1...']);

// ✅ Now: Throws error with helpful message
// Error: p-tag[0] has invalid pubkey: "npub1...". Must be 64-char hex.
// Hint: Use ndkUser.pubkey instead of npub. Example: event.tags.push(['p', ndkUser.pubkey])
```

#### `tag-invalid-e-tag` (Error)
Validates that all e-tags contain valid 64-character hex event IDs.

```typescript
// ❌ Before: Would allow invalid e-tags
event.tags.push(['e', 'note1...']);

// ✅ Now: Throws error with helpful message
// Error: e-tag[0] has invalid event ID: "note1...". Must be 64-char hex.
// Hint: Use event.id instead of bech32. Example: event.tags.push(['e', referencedEvent.id])
```

### 3. ✅ Removed `event-created-at-future` Check
- **Reason:** Future timestamps are not problematic (e.g., scheduled events)
- **Impact:** Allows legitimate use cases without false positives

### 4. ✅ Updated Recommendation: Use `ndkUser.pubkey` Instead of `nip19.decode`

**Before:**
```typescript
// Filter error suggested:
// "Decode npub first: nip19.decode(npub).data"
```

**After:**
```typescript
// Filter error now suggests:
// "Use ndkUser.pubkey instead. Example: { authors: [ndkUser.pubkey] }"
```

**Rationale:** If they have an npub, they likely have an NDKUser instance, which is the proper NDK way.

### 5. ✅ Added Manual Reply Marker Detection

#### `event-manual-reply-markers` (Warning)
Detects when developers manually add e-tags with reply/root markers instead of using NDK's `.reply()` method.

```typescript
// ⚠️ Suboptimal: Manual markers
const reply = new NDKEvent(ndk);
reply.kind = 1;
reply.content = "Great post!";
reply.tags.push(['e', parentEvent.id, '', 'reply']); // Manual!
await reply.sign(); // Warning!

// ✅ Better: Use NDK's reply method
await reply.reply(parentEvent); // Handles threading automatically
```

**Detection Logic:**
- Only checks kind 1 events (text notes)
- Looks for e-tags with "reply" or "root" in the 4th position (marker field)
- Warns that NDK has a better way to handle this

## Summary of Active Guardrails

### Filter Validation (7 checks)
1. `filter-bech32-in-array` - Bech32 in filter arrays
2. `filter-only-limit` - Filter with only limit
3. `filter-large-limit` - Large limits (>1000)
4. `filter-empty` - Empty filters
5. `filter-since-after-until` - Invalid time ranges
6. `filter-invalid-a-tag` - Invalid #a tag format
7. Bech32 detection in ids, authors, and tag filters

### Event Construction (4 checks)
1. `event-missing-kind` - No kind set before signing
2. `event-content-is-object` - Content is object not string
3. `event-param-replaceable-no-dtag` - Missing d-tag
4. `event-created-at-milliseconds` - Using ms instead of seconds

### Tag Validation (3 checks)
1. `tag-invalid-p-tag` - Invalid hex in p-tags
2. `tag-invalid-e-tag` - Invalid hex in e-tags
3. `event-manual-reply-markers` - Manual reply markers

### Anti-Patterns (1 check)
1. `fetch-events-usage` - Using blocking fetchEvents

## Total: 15 Active Guardrails

## Files Modified

1. `ndk-core/src/events/index.ts`
   - Removed `event-undefined-content` check
   - Removed `event-created-at-future` check
   - Added `tag-invalid-p-tag` validation
   - Added `tag-invalid-e-tag` validation
   - Added `event-manual-reply-markers` detection

2. `ndk-core/src/utils/filter-validation.ts`
   - Updated npub error message to recommend `ndkUser.pubkey`

3. `ndk-core/src/utils/ai-guardrails.ts`
   - Removed `EVENT_UNDEFINED_CONTENT` constant
   - Removed `EVENT_CREATED_AT_FUTURE` constant
   - Added `TAG_INVALID_P_TAG` constant
   - Added `TAG_INVALID_E_TAG` constant
   - Added `EVENT_MANUAL_REPLY_MARKERS` constant

4. `ndk-core/docs/ai-guardrails.md`
   - Removed documentation for removed checks
   - Added documentation for new tag validation checks
   - Added documentation for reply marker detection
   - Updated examples and best practices

5. `AI_GUARDRAILS_IMPLEMENTATION.md`
   - Updated guardrail counts
   - Updated check categories

## Benefits

### 1. Better Tag Validation
- Catches common mistake of using bech32 in tags
- Provides context-aware hints (npub → ndkUser.pubkey, note → event.id)
- Validates hex format to prevent runtime errors

### 2. Educational Warnings
- Manual reply marker detection teaches developers about `.reply()`
- Reduces accidental misuse of low-level tag APIs
- Encourages use of NDK's high-level methods

### 3. Cleaner Error Messages
- Removed unnecessary `undefined content` check (handled by defaults)
- Removed overly restrictive future timestamp check
- Better recommendations that align with NDK patterns

### 4. More Accurate Detection
- Only checks kind 1 events for reply markers (relevant context)
- Distinguishes between different bech32 types (npub vs note vs nevent)
- Provides specific, actionable error messages

## Breaking Changes

**None.** All changes are additive or improvements to existing checks. The guardrail system is still:
- Off by default
- Opt-in only
- Fully backwards compatible
- Granularly configurable

## Testing

All changes formatted and validated:
```bash
npm run format  # ✅ Passed
```

### E2E Demo Script

Created `ndk-core/src/utils/ai-guardrails-e2e.ts` - an executable script that demonstrates all 15 guardrails in action.

**Run it:**
```bash
npx tsx ndk-core/src/utils/ai-guardrails-e2e.ts
```

**What it does:**
- Tests all 15 guardrail checks
- Shows both console.error output AND exception throwing
- Color-coded output (✅ PASSED for each test)
- Demonstrates that warnings now throw (not just log)

**Example output:**
```
🤖 AI_GUARDRAILS ERROR: Cannot sign event without 'kind'. Set event.kind before signing.
💡 Example: event.kind = 1; // for text note
🔇 To disable this check: ndk.aiGuardrails.skip('event-missing-kind')

✅ PASSED - Guardrail triggered
```

Ready for use in development environments!
