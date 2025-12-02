# Built for speed

NDK makes multiple optimizations possible to create a performant client.

## Signature Verifications

Signature validation is typically the most computationally expensive operation in a nostr client. Thus, NDK attempts to
reduce the number of signature verifications that need to be done as much as possible.

### Service Worker signature validation

In order to create performant clients, it's very useful to offload this computation to a service worker, to avoid
blocking the main thread.

```ts
// Using with vite
const sigWorker = import.meta.env.DEV ?
		new Worker(new URL('@nostr-dev-kit/ndk/workers/sig-verification?worker', import.meta.url), { type: 'module' }) : new NDKSigVerificationWorker();

const ndk = new NDK();
ndk.signatureVerificationWorker = worker
```

Since signature verification will thus be done asynchronously, it's important to listen for invalid signatures and
handle them appropriately; you should
always warn your users when they are receiving invalid signatures from a relay and/or immediately disconnect from an
evil relay.

```ts
ndk.on("event:invalid-sig", (event) => {
    const { relay } = event;
    console.error("Invalid signature coming from relay", relay.url);
});
```

### Signature verification sampling

Another parameter we can tweak is how many signatures we verify. By default, NDK will verify every signature, but you
can change this by setting a per-relay verification rate.

```ts
ndk.initialValidationRatio = 0.5; // Only verify 50% of the signatures for each relay
ndk.lowestValidationRatio = 0.01; // Never verify less than 1% of the signatures for each relay
```

NDK will then begin verifying signatures from each relay and, as signatures as verified, it will reduce the verification
rate for that relay.

### Custom validation ratio function

If you need further control on how the verification rate is adjusted, you can provide a validation ratio function. This
function will be called periodically and the returning value will be used to adjust the verification rate.

```ts
ndk.validationRatioFn = (relay: NDKRelay, validatedEvents: number, nonValidatedEvents: number): number => {
    // write your own custom function here
    return validatedEvents / (validatedEvents + nonValidatedEvents);
}
```