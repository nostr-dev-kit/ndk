# NIP-61 Test Vectors

This directory contains test vectors for validating NIP-61 nutzap implementations.

## Files

- `nip61.json` - Comprehensive test vectors for NIP-61 validation

## Test Vector Structure

Each test vector contains:
- `name`: Unique identifier for the test case
- `description`: Human-readable description of what this tests
- `event`: A complete Nostr event representing a nutzap
- `expectedValid`: Boolean indicating if the event should pass validation
- `expectedIssues`: Array of validation issue codes that should be detected

## Validation Issue Codes

### Errors (make nutzap invalid)
- `NO_PROOFS` - No Cashu proofs provided
- `NO_RECIPIENT` - Missing recipient p tag
- `MULTIPLE_RECIPIENTS` - More than one recipient p tag
- `NO_MINT` - Missing mint u tag
- `MULTIPLE_MINTS` - More than one mint u tag
- `MULTIPLE_EVENT_TAGS` - More than one event e tag
- `MALFORMED_PROOF_SECRET` - Proof secret cannot be parsed

### Warnings (suggest improvements but don't invalidate)
- `NO_EVENT_TAG_IN_EVENT` - Event missing e tag (recommended for replay protection)
- `MISSING_EVENT_TAG_IN_PROOF` - Proof secret missing e tag
- `MISMATCHED_EVENT_TAG_IN_PROOF` - Proof e tag doesn't match event e tag
- `MISSING_SENDER_TAG_IN_PROOF` - Proof secret missing P tag for sender verification
- `MISMATCHED_SENDER_TAG_IN_PROOF` - Proof P tag doesn't match sender pubkey

## NIP-61 Replay Protection

As of the updated NIP-61 specification, nutzap proofs should include two tags in their P2PK lock structure:

1. **`e` tag**: Contains the event ID being zapped (prevents replay attacks to different events)
2. **`P` tag**: Contains the sender's pubkey (prevents impersonation)

### Proof Secret Format

```json
[
  "P2PK",
  {
    "data": "02<recipient-pubkey-hex>",
    "nonce": "<random-nonce>",
    "tags": [
      ["e", "<event-id-being-zapped>"],
      ["P", "<sender-pubkey>"]
    ]
  }
]
```

### Backwards Compatibility

- Nutzaps without `e` and `P` tags are considered **valid** but will generate **warnings**
- This ensures backwards compatibility while encouraging adoption of the new security features
- Only critical structural issues (missing proofs, recipients, mint, etc.) make a nutzap invalid

## Generating Test Vectors

To regenerate the test vectors:

```bash
bun run /Users/pablofernandez/tenex/NDK-nhlteu/core/scripts/generate-nip61-test-vectors.ts > test-vectors/nip61.json
```

## Using Test Vectors

To use these test vectors in your implementation:

```typescript
import testVectors from "./test-vectors/nip61.json";

for (const vector of testVectors.vectors) {
  const event = vector.event;
  const nutzap = NDKNutzap.from(event);
  const result = nutzap.validateNIP61();

  // Check if validity matches expectation
  assert.equal(result.valid, vector.expectedValid);

  // Check if expected issues are present
  const issueCodes = result.issues.map(i => i.code);
  for (const expectedCode of vector.expectedIssues || []) {
    assert.ok(issueCodes.includes(expectedCode));
  }
}
```

## Test Categories

The test vectors cover:

1. **Valid events** - Events that pass all validation
2. **Valid with warnings** - Events that are valid but have recommended improvements
3. **Invalid events** - Events with critical errors that make them invalid

This ensures comprehensive coverage of the NIP-61 specification.
