# Quick Start

Get started with NDK Sessions in minutes.

## Installation

::: code-group

```sh [npm]
npm i @nostr-dev-kit/sessions
```

```sh [pnpm]
pnpm add @nostr-dev-kit/sessions
```

```sh [yarn]
yarn add @nostr-dev-kit/sessions
```

```sh [bun]
bun add @nostr-dev-kit/sessions
```

:::

## Basic Setup

### 1. Initialize NDK

First, create and [initialise your NDK instance](/core/docs/getting-started/usage#instantiate-ndk).

### 2. Create Session Manager

Create a session manager with your preferred storage:

<<< @/sessions/docs/snippets/init_sessions_local_storage.ts

More about [storage options](/sessions/docs/storage-options.html).

### 3. Restore Previous Sessions

Restore any previously saved sessions:

<<< @/sessions/docs/snippets/sessions_restore.ts

### 4. Login (and auto-fetch)

Login with [a signer](/core/docs/fundamentals/signers). To automatically fetch user data, configure `fetches` in the
constructor:

<<< @/sessions/docs/snippets/session_fetch_user_data.ts

## Read-only Sessions

TODO -> Write

## Logging out

```typescript
// Logout specific account
sessions.logout(pubkey1);

// Or logout current active account
sessions.logout();
```
