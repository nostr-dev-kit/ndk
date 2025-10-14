---
title: Complete Authentication Flow with NIP-07, nsec, and NIP-46
description: Implement a complete authentication system supporting browser extensions, private keys, and remote signers
tags: ['svelte', 'authentication', 'nip-07', 'nip-46', 'sessions']
difficulty: intermediate
timeToRead: 15
package: svelte
author: NDK Team
dateAdded: 2024-03-04
---

# Complete Authentication Flow with NIP-07, nsec, and NIP-46

This cookbook demonstrates how to implement a complete authentication system in a Svelte 5 application using NDK's session management. It supports multiple login methods including NIP-07 (browser extensions), private keys (nsec), and NIP-46 (remote signers).

## What You'll Build

- Browser extension login (NIP-07) with nos2x/Alby support
- Private key (nsec) login with validation
- Remote signer via bunker:// URI
- Remote signer via nostrconnect:// with QR code generation
- Session management and persistence
- Error handling and loading states

## Prerequisites

```bash
npm install @nostr-dev-kit/ndk @nostr-dev-kit/svelte qrcode
```

## Basic Setup

First, initialize NDK and the session stores:

```typescript
import NDK from "@nostr-dev-kit/ndk"
import { sessions, initStores } from "@nostr-dev-kit/svelte"

// Initialize NDK with your relay configuration
const ndk = new NDK({
  explicitRelayUrls: [
    'wss://relay.damus.io',
    'wss://nos.lol',
    'wss://relay.nostr.band'
  ]
})

// Initialize stores and connect
let initialized = $state(false)
initStores(ndk).then(() => {
  ndk.connect()
  initialized = true
})
```

## NIP-07: Browser Extension Login

Login using a Nostr browser extension like nos2x or Alby:

```typescript
import { NDKNip07Signer } from "@nostr-dev-kit/ndk"

async function loginWithNip07() {
  try {
    const signer = new NDKNip07Signer()
    await sessions.login(signer)
    console.log('Logged in with browser extension')
  } catch (error) {
    console.error('Failed to connect to extension:', error)
  }
}
```

## Private Key (nsec) Login

Login using an nsec private key:

```typescript
import { NDKPrivateKeySigner } from "@nostr-dev-kit/ndk"

async function loginWithNsec(nsecKey: string) {
  try {
    const signer = new NDKPrivateKeySigner(nsecKey)
    await sessions.login(signer)
    console.log('Logged in with private key')
  } catch (error) {
    console.error('Invalid nsec:', error)
  }
}
```

## NIP-46: Remote Signer (bunker://)

Login using a bunker:// URI from a remote signer:

```typescript
import { NDKNip46Signer } from "@nostr-dev-kit/ndk"

async function loginWithBunker(bunkerUri: string) {
  try {
    const signer = new NDKNip46Signer(ndk, bunkerUri)
    await signer.blockUntilReady()
    await sessions.login(signer)
    console.log('Connected via bunker://')
  } catch (error) {
    console.error('Failed to connect via bunker://', error)
  }
}
```

## NIP-46: Generate nostrconnect:// URI

Generate a nostrconnect:// URI and QR code for remote signers to scan:

```typescript
import { NDKNip46Signer } from "@nostr-dev-kit/ndk"
import QRCode from "qrcode"

async function generateNostrConnect() {
  try {
    // Use a relay from your NDK pool
    const relay = ndk.pool.relays.values().next().value?.url || 'wss://relay.damus.io'

    const signer = NDKNip46Signer.nostrconnect(ndk, relay)

    // Get the generated URI
    const uri = signer.nostrConnectUri
    if (!uri) throw new Error('Failed to generate nostrconnect URI')

    // Generate QR code
    const qrCodeDataUrl = await QRCode.toDataURL(uri, {
      width: 300,
      margin: 2,
    })

    // Display the QR code to the user
    console.log('Scan this QR code:', qrCodeDataUrl)
    console.log('Or use this URI:', uri)

    // Wait for the remote signer to connect
    await signer.blockUntilReady()
    await sessions.login(signer)

    console.log('Connected via nostrconnect://')
  } catch (error) {
    console.error('Failed to generate nostrconnect URI:', error)
  }
}
```

## Complete Login Modal Component

Here's a complete Svelte 5 component with all login methods:

```svelte
<script lang="ts">
  import NDK from "@nostr-dev-kit/ndk"
  import { NDKPrivateKeySigner, NDKNip07Signer, NDKNip46Signer } from "@nostr-dev-kit/ndk"
  import { sessions, initStores } from "@nostr-dev-kit/svelte"
  import QRCode from "qrcode"

  const ndk = new NDK({
    explicitRelayUrls: ['wss://relay.damus.io', 'wss://nos.lol']
  })

  let initialized = $state(false)
  initStores(ndk).then(() => {
    ndk.connect()
    initialized = true
  })

  let showLoginModal = $state(false)
  let nsecInput = $state('')
  let bunkerInput = $state('')
  let loginError = $state('')
  let loginLoading = $state(false)
  let nip46Mode = $state<'bunker' | 'nostrconnect'>('bunker')
  let nostrConnectUri = $state<string | undefined>(undefined)
  let qrCodeDataUrl = $state<string | undefined>(undefined)

  async function loginWithNip07() {
    loginLoading = true
    loginError = ''
    try {
      const signer = new NDKNip07Signer()
      await sessions.login(signer)
      showLoginModal = false
    } catch (error) {
      loginError = error instanceof Error ? error.message : 'Failed to connect'
    } finally {
      loginLoading = false
    }
  }

  async function loginWithNsec() {
    if (!nsecInput.trim()) {
      loginError = 'Please enter an nsec'
      return
    }

    loginLoading = true
    loginError = ''
    try {
      const signer = new NDKPrivateKeySigner(nsecInput.trim())
      await sessions.login(signer)
      nsecInput = ''
      showLoginModal = false
    } catch (error) {
      loginError = error instanceof Error ? error.message : 'Invalid nsec'
    } finally {
      loginLoading = false
    }
  }

  async function loginWithBunker() {
    if (!bunkerInput.trim()) {
      loginError = 'Please enter a bunker:// URI'
      return
    }

    loginLoading = true
    loginError = ''
    try {
      const signer = new NDKNip46Signer(ndk, bunkerInput.trim())
      await signer.blockUntilReady()
      await sessions.login(signer)
      bunkerInput = ''
      showLoginModal = false
    } catch (error) {
      loginError = error instanceof Error ? error.message : 'Failed to connect via bunker://'
    } finally {
      loginLoading = false
    }
  }

  async function generateNostrConnect() {
    loginLoading = true
    loginError = ''
    try {
      const relay = ndk.pool.relays.values().next().value?.url || 'wss://relay.damus.io'
      const signer = NDKNip46Signer.nostrconnect(ndk, relay)

      nostrConnectUri = signer.nostrConnectUri
      if (!nostrConnectUri) throw new Error('Failed to generate nostrconnect URI')

      qrCodeDataUrl = await QRCode.toDataURL(nostrConnectUri, {
        width: 300,
        margin: 2,
      })

      await signer.blockUntilReady()
      await sessions.login(signer)

      nostrConnectUri = undefined
      qrCodeDataUrl = undefined
      showLoginModal = false
    } catch (error) {
      loginError = error instanceof Error ? error.message : 'Failed to generate nostrconnect URI'
    } finally {
      loginLoading = false
    }
  }

  function logout() {
    sessions.logout()
  }
</script>

<div>
  {#if !initialized}
    <p>Initializing...</p>
  {:else if !sessions.current}
    <button onclick={() => showLoginModal = true}>
      Login
    </button>
  {:else}
    <div>
      <p>Logged in as: {sessions.current.pubkey}</p>
      <p>Name: {sessions.profile?.name || '(no name)'}</p>
      <button onclick={logout}>Logout</button>
    </div>
  {/if}
</div>

{#if showLoginModal}
  <div class="modal">
    <h2>Login to Nostr</h2>

    {#if loginError}
      <div class="error">{loginError}</div>
    {/if}

    <!-- NIP-07 -->
    <div class="login-method">
      <h3>Browser Extension (NIP-07)</h3>
      <button onclick={loginWithNip07} disabled={loginLoading}>
        Connect Extension
      </button>
    </div>

    <!-- nsec -->
    <div class="login-method">
      <h3>Private Key (nsec)</h3>
      <input
        type="password"
        bind:value={nsecInput}
        placeholder="nsec1..."
        disabled={loginLoading}
      />
      <button onclick={loginWithNsec} disabled={loginLoading}>
        Login with nsec
      </button>
    </div>

    <!-- NIP-46 -->
    <div class="login-method">
      <h3>Remote Signer (NIP-46)</h3>

      <div class="tabs">
        <button
          onclick={() => nip46Mode = 'nostrconnect'}
          class:active={nip46Mode === 'nostrconnect'}
        >
          Generate QR Code
        </button>
        <button
          onclick={() => nip46Mode = 'bunker'}
          class:active={nip46Mode === 'bunker'}
        >
          Paste bunker:// URI
        </button>
      </div>

      {#if nip46Mode === 'nostrconnect'}
        {#if qrCodeDataUrl && nostrConnectUri}
          <div class="qr-container">
            <img src={qrCodeDataUrl} alt="QR code" />
            <p>{nostrConnectUri}</p>
          </div>
        {:else}
          <button onclick={generateNostrConnect} disabled={loginLoading}>
            Generate QR Code
          </button>
        {/if}
      {:else}
        <input
          type="text"
          bind:value={bunkerInput}
          placeholder="bunker://..."
          disabled={loginLoading}
        />
        <button onclick={loginWithBunker} disabled={loginLoading}>
          Connect with bunker://
        </button>
      {/if}
    </div>

    <button onclick={() => showLoginModal = false}>Cancel</button>
  </div>
{/if}
```

## Key Points

- Always initialize stores with `initStores(ndk)` before using session management
- The `sessions.current` store contains the active session or `undefined` if not logged in
- The `sessions.profile` store contains the current user's profile metadata
- All session data persists across page reloads
- NIP-46 requires `blockUntilReady()` before logging in

## See Also

- [Multi-Session Management](/ndk/cookbook/svelte5/multi-session-management) - Handle multiple accounts
- [Session API Reference](/ndk/api/) - Full API documentation
- [NIP-46 Spec](https://github.com/nostr-protocol/nips/blob/master/46.md) - Remote signer protocol
