# Signature Verification Demo

This Svelte 5 example demonstrates NDK's adaptive signature verification sampling using web workers.

## Features

- **Web Worker Integration**: Signature verification runs in a separate thread to avoid blocking the UI
- **Adaptive Sampling**: Starts at 100% validation and gradually reduces to 10% as trust builds
- **Real-time Stats**: Visual dashboard showing verification metrics per relay
- **Invalid Signature Detection**: Alerts when invalid signatures are detected

## How It Works

1. **Initial Validation**: All events are verified when first connecting to a relay
2. **Trust Building**: As valid events are received, the validation ratio decreases
3. **Adaptive Response**: If an invalid signature is detected, validation ratio increases
4. **Performance**: Worker-based verification prevents UI blocking

## Configuration

The demo uses these NDK settings:

```typescript
{
  signatureVerificationWorker: new Worker(...),
  initialValidationRatio: 1.0,    // 100% initially
  lowestValidationRatio: 0.1      // 10% minimum
}
```

## Running

```bash
bun install
bun run dev
```

## What to Watch

- **Events Received**: Total events from all relays
- **Invalid Signatures**: Count of signature verification failures
- **Verification Time**: Total time spent verifying signatures
- **Relay Stats**: Per-relay validation counts and target ratios

The "Target Ratio" shows the probability that each event from that relay will be verified. This decreases as trust builds.
