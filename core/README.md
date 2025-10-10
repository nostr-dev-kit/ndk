# @nostr-dev-kit/ndk

[![npm version](https://img.shields.io/npm/v/@nostr-dev-kit/ndk.svg)](https://www.npmjs.com/package/@nostr-dev-kit/ndk)
[![Build Status](https://github.com/nostr-dev-kit/ndk/actions/workflows/deploy.yml/badge.svg)](https://github.com/nostr-dev-kit/ndk/actions)
[![AI Guardrails Included](https://img.shields.io/badge/AI%20Guardrails-Included-brightgreen)](https://github.com/nostr-dev-kit/ndk/tree/master/ndk/src/ai-guardrails)

> NDK (Nostr Development Kit) is a TypeScript/JavaScript library that simplifies building Nostr clients, relays, and related applications.

## ⚠️ Important: Enable AI Guardrails

**If you're new to NDK or using an AI assistant, enable AI Guardrails:**

```typescript
const ndk = new NDK({ aiGuardrails: true });
```

This prevents 90% of common mistakes (bech32 in filters, missing fields, invalid formats) with clear error messages. Disable in production.

## 🤖 For AI Assistants & New Developers

NDK includes **AI Guardrails** - runtime validation that catches common mistakes:

- Using npub/note1 in filters (must be hex)
- Missing required fields on events
- Invalid tag formats
- Performance anti-patterns

**Enable with `aiGuardrails: true`** - see Quick Start below.

## Features

- Outbox model support
- Relay connection pool with automatic reconnection and failover
- Flexible subscription API with caching, batching, and auto-closing
- Event creation, validation, and wrappers for major NIPs (e.g., NIP-01, NIP-04, NIP-07, NIP-18, NIP-49, NIP-57, NIP-60, NIP-61)
- Signer adapters: private key, encrypted keys (NIP-49), browser extension (NIP-07), remote signing (NIP-46)
- Pluggable cache adapters (Redis, Dexie, SQLite, etc.)
- Data Vending Machine support (NIP-90)
- Zap utilities (NIP-57, NIP-61)
- Threading, event kinds, and utility functions (URL normalization, metadata tags, filters)
- Modular design with many pluggable packages for different frameworks (Mobile, Svelte 4 and 5, React)

## Installation

```bash
npm install @nostr-dev-kit/ndk
# or
yarn add @nostr-dev-kit/ndk
# or
bun add @nostr-dev-kit/ndk
```

## Quick Start

```typescript
import NDK, { NDKEvent, NDKPrivateKeySigner } from '@nostr-dev-kit/ndk';

async function main() {
  const signer = NDKPrivateKeySigner.generate();
  const ndk = new NDK({
    explicitRelayUrls: ['wss://relay.primal.net'],
    signer,

    // ⚠️ STRONGLY RECOMMENDED: Enable during development
    // Catches common mistakes before they cause silent failures
    aiGuardrails: true
  });

  // Connect to relays
  await ndk.connect();

  // Publish a simple text note
  const event = new NDKEvent(ndk, {
    kind: 1,
    content: 'Hello Nostr via NDK!',
  })
  await event.sign();
  event.publish();

 // subscribe to all event interactions
  ndk.subscribe(event.filter(), { closeOnEose: false }, {
   onEvent: (replyEvent: NDKEvent) => console.log(replyEvent.author.npub, "interacted with our hello world with a kind", replyEvent.kind);
  })

  // Subscribe to incoming text notes
  const subscription = ndk.subscribe(
    { kinds: [1] },
    { closeOnEose: true },
    {
      onEvent: (evt) => console.log('Received event:', evt),
      onEose: () => console.log('End of stream'),
    }
  );
}

main().catch(console.error);
```

## Documentation

Full API reference and guides are available at [https://nostr-dev-kit.github.io/ndk](https://nostr-dev-kit.github.io/ndk).

## License

MIT
