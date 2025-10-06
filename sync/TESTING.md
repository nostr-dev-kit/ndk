# Testing NIP-77 Sync Implementation

## E2E Test Status

The e2e-test.ts demonstrates the sync functionality but **most Nostr relays don't support NIP-77 yet**, so tests will timeout or fail with protocol errors.

### Running E2E Tests

```bash
bun run e2e
```

**Expected Behavior:**
- ⚠️ Tests will likely timeout or fail with "Sync timeout - relay may not support NIP-77"
- This is **normal** - very few relays implement NIP-77 currently
- The test is still useful for validating the code paths when a compatible relay is available

### What the E2E Test Validates

When run against a NIP-77-compatible relay, the tests verify:

1. **Basic Sync** - Can sync events from relay
2. **Subscription Integration** - Active subscriptions receive synced events
3. **AutoFetch Behavior** - `autoFetch: false` returns only `need`/`have` sets
4. **Cache Integration** - Synced events are saved to cache

### E2E Test Configuration

Edit `e2e-test.ts` to test with different relays:

```typescript
const TEST_RELAY = "wss://your-nip77-relay.com";
const TEST_PUBKEY = "your-test-pubkey-hex";
const SYNC_TIMEOUT = 10000; // 10 seconds
```

## Unit Testing (TODO)

For reliable testing without relay dependencies, we should add:

### 1. Mock Relay Tests

Test the protocol implementation with a mock relay that returns controlled responses:

```typescript
// sync/src/__tests__/sync-mock-relay.test.ts
describe('Sync with Mock Relay', () => {
  it('should handle basic sync protocol', async () => {
    const mockRelay = new MockNIP77Relay();
    // ... test sync flow
  });
});
```

### 2. Storage Tests

Test the Negentropy storage independently:

```typescript
// sync/src/__tests__/negentropy-storage.test.ts
describe('NegentropyStorage', () => {
  it('should build from events', () => {
    const events = [/* mock events */];
    const storage = NegentropyStorage.fromEvents(events);
    expect(storage.size()).toBe(events.length);
  });
});
```

### 3. Protocol Tests

Test message encoding/decoding:

```typescript
// sync/src/__tests__/negentropy-protocol.test.ts
describe('Negentropy Protocol', () => {
  it('should encode/decode varint', () => {
    const encoded = encodeVarInt(12345);
    const decoded = decodeVarInt(new WrappedBuffer(encoded));
    expect(decoded).toBe(12345);
  });
});
```

## Integration Testing

### Testing with a Real NIP-77 Relay

If you have access to a relay that supports NIP-77:

1. Update `TEST_RELAY` in `e2e-test.ts`
2. Verify relay supports NEG-OPEN/NEG-MSG/NEG-CLOSE
3. Run `bun run e2e`

### Setting Up a Test Relay

You can run your own NIP-77 relay for testing:

1. **strfry** (recommended): Has NIP-77 support
   ```bash
   # Install strfry
   git clone https://github.com/hoytech/strfry
   cd strfry
   make
   # Configure and run
   ./strfry relay
   ```

2. **nostream** with negentropy plugin
   ```bash
   # Check nostream documentation for NIP-77 support
   ```

## Manual Testing

### Test Sync with Real Relay

```typescript
import NDK from '@nostr-dev-kit/ndk';
import { ndkSync } from '@nostr-dev-kit/sync';

const ndk = new NDK({
  explicitRelayUrls: ['wss://relay.example.com'],
  cacheAdapter: myCacheAdapter
});

await ndk.connect();

try {
  const result = await ndkSync.call(ndk, {
    kinds: [1],
    limit: 10
  });

  console.log(`Synced ${result.events.length} events`);
  console.log(`Need: ${result.need.size}, Have: ${result.have.size}`);
} catch (err) {
  console.error('Sync failed:', err.message);
  // Expected if relay doesn't support NIP-77
}
```

### Verify Subscription Integration

```typescript
// Create subscription first
const sub = ndk.subscribe({ kinds: [1], limit: 5 });

const receivedEvents: NDKEvent[] = [];
sub.on('event', (event) => {
  console.log('Subscription received:', event.id);
  receivedEvents.push(event);
});

// Now sync - events should flow to subscription
const result = await ndkSync.call(ndk, { kinds: [1], limit: 5 });

console.log(`Subscription got ${receivedEvents.length} events`);
console.log(`Sync got ${result.events.length} events`);
```

## Known Issues

### Relay Compatibility

As of October 2025:
- **relay.damus.io**: Does not support NIP-77
- **nos.lol**: Does not support NIP-77
- **relay.nostr.band**: Does not support NIP-77
- **strfry-based relays**: May support NIP-77 (check relay documentation)

### Protocol Errors

If you see errors like:
- "Sync timeout" → Relay doesn't support NIP-77
- "getBytes: unexpected end of buffer" → Protocol version mismatch
- "Already initiated" → Bug in session management (should be fixed)

## Future Testing Improvements

1. **Mock Relay Implementation** - Full NIP-77 mock for unit tests
2. **Protocol Fuzzing** - Test edge cases in message parsing
3. **Performance Benchmarks** - Measure sync efficiency
4. **Multi-Relay Scenarios** - Test sequential sync behavior
5. **Cache Adapter Tests** - Test with different cache implementations

## Contributing

If you have access to a NIP-77-compatible relay, please:
1. Update this document with relay details
2. Run the e2e tests and report results
3. Submit PR with any necessary fixes

---

**Last Updated**: October 6, 2025
