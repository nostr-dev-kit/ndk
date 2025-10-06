# Signature Verification Demo - Key Features

## 🎯 What This Demo Shows

This example demonstrates NDK's **adaptive signature verification sampling** using a web worker, which provides:

1. **Performance**: Signature verification runs in a separate thread (web worker) to keep the UI responsive
2. **Adaptive Sampling**: Smart verification that starts strict and becomes more efficient as trust builds
3. **Security**: Detects and alerts on invalid signatures from malicious relays

## 🔧 Implementation Details

### Web Worker Setup

The worker (`sig-verify.worker.ts`) handles signature verification:

```typescript
import SigVerifyWorker from './sig-verify.worker.ts?worker'
const sigVerifyWorker = new SigVerifyWorker()

const ndk = new NDKSvelte({
  signatureVerificationWorker: sigVerifyWorker,
  initialValidationRatio: 1.0,     // 100% validation initially
  lowestValidationRatio: 0.1,      // 10% minimum validation
})
```

### How the Sampling Works

1. **Initial Phase**: When connecting to a new relay, validate 100% of events (initialValidationRatio)
2. **Trust Building**: As valid events accumulate, the validation ratio decreases
3. **Minimum Sampling**: Eventually reaches 10% validation (lowestValidationRatio)
4. **Invalid Detection**: If an invalid signature is found, the ratio increases again

### Visual Dashboard

The demo shows:
- Total events received
- Invalid signature count
- Total verification time (demonstrates worker efficiency)
- Per-relay statistics:
  - Validated event count
  - Non-validated event count
  - Current target validation ratio
  - Trusted status

## 🚀 Running the Demo

```bash
cd svelte/examples/sig-verify-demo
bun install
bun run dev
```

Then open http://localhost:5174/

## 📊 What to Observe

Watch how the **Target Ratio** column in the relay stats table decreases over time as each relay proves trustworthy by delivering valid events. This demonstrates the adaptive sampling in action.

If a relay sends an invalid event:
- An alert appears at the top
- The invalid signature counter increments
- The relay's target ratio increases (more verification)

## 🔍 Key Code Patterns

### Event Listener for Invalid Signatures

```typescript
ndk.on('event:invalid-sig', (event, relay) => {
  console.error('Invalid signature:', event.id, 'from', relay?.url)
  // Handle the invalid event (e.g., disconnect from relay)
})
```

### Accessing Relay Stats

```typescript
for (const relay of ndk.pool.relays.values()) {
  console.log({
    url: relay.url,
    validated: relay.validatedEventCount,
    notValidated: relay.nonValidatedEventCount,
    targetRatio: relay.targetValidationRatio,
  })
}
```

## 💡 Benefits

1. **Performance**: Worker-based verification prevents UI freezing
2. **Efficiency**: Reduced verification overhead as trust builds
3. **Security**: Still catches invalid signatures through sampling
4. **Adaptive**: Automatically adjusts to relay behavior

## 🎓 Learning Points

This demo teaches:
- How to set up web workers with Vite in Svelte 5
- NDK's signature verification system
- Adaptive sampling strategies
- Event-driven security monitoring
