---
title: Multi-Session Management with Account Switcher
description: Manage multiple Nostr accounts simultaneously with session switching and profile management
tags: ['ndk-svelte5', 'authentication', 'multi-session', 'session-management']
difficulty: advanced
timeToRead: 20
package: ndk-svelte5
author: NDK Team
dateAdded: 2024-03-04
---

# Multi-Session Management with Account Switcher

This cookbook demonstrates how to manage multiple Nostr accounts simultaneously in a Svelte 5 application. Users can log in with multiple accounts, switch between them instantly, and view all active sessions with a beautiful account switcher UI.

## What You'll Build

- Multiple account management
- Session switching with instant updates
- Account switcher dropdown component
- Session list view
- Profile data for each session
- Logout individual or all sessions

## Understanding Multi-Session

NDK's session management system allows you to:
- Have multiple accounts logged in simultaneously
- Switch between accounts instantly
- Maintain separate profile data, follows, and mutes for each account
- Persist all sessions across page reloads

## Adding Multiple Sessions

### Add a New Session

Use `sessions.add()` to add an additional session without logging out of the current one:

```typescript
import { NDKPrivateKeySigner } from "@nostr-dev-kit/ndk"
import { sessions } from "@nostr-dev-kit/ndk-svelte5"

async function addAnotherAccount(nsecKey: string) {
  try {
    const signer = new NDKPrivateKeySigner(nsecKey)
    await sessions.add(signer)
    console.log('Added new session')
  } catch (error) {
    console.error('Failed to add session:', error)
  }
}
```

### Generate and Add a New Account

```typescript
import { NDKPrivateKeySigner } from "@nostr-dev-kit/ndk"
import { sessions } from "@nostr-dev-kit/ndk-svelte5"

async function generateAndAddAccount() {
  const signer = NDKPrivateKeySigner.generate()
  await sessions.add(signer)
  console.log('Generated and added new account')
}
```

## Switching Between Sessions

Use `sessions.switch()` to switch to a different logged-in account:

```typescript
function switchSession(pubkey: string) {
  sessions.switch(pubkey)
  console.log('Switched to session:', pubkey)
}
```

## Accessing All Sessions

The `sessions.all` store contains an array of all logged-in sessions:

```typescript
// Get all sessions
console.log('Total sessions:', sessions.all.length)

// Iterate through all sessions
sessions.all.forEach(session => {
  console.log('Pubkey:', session.pubkey)
  console.log('Follows:', session.follows.size)
  console.log('Mutes:', session.mutes.size)
})

// Check if a specific pubkey is logged in
const isActive = sessions.all.some(s => s.pubkey === sessions.current?.pubkey)
```

## Session Data Structure

Each session in `sessions.all` contains:

```typescript
interface Session {
  pubkey: string        // The user's public key
  follows: Set<string>  // Set of followed pubkeys
  mutes: Set<string>    // Set of muted pubkeys
}
```

## Logging Out

### Logout Current Session

```typescript
function logout() {
  sessions.logout()
}
```

### Logout All Sessions

```typescript
function logoutAll() {
  sessions.logoutAll()
}
```

## Complete Session Switcher Component

Here's a beautiful dropdown session switcher:

```svelte
<script lang="ts">
  import NDK from "@nostr-dev-kit/ndk"
  import { NDKPrivateKeySigner, NDKNip07Signer } from "@nostr-dev-kit/ndk"
  import { sessions, initStores } from "@nostr-dev-kit/ndk-svelte5"

  const ndk = new NDK({
    explicitRelayUrls: ['wss://relay.damus.io', 'wss://nos.lol']
  })

  let initialized = $state(false)
  initStores(ndk).then(() => {
    ndk.connect()
    initialized = true
  })

  let showSessionMenu = $state(false)

  async function addAnotherAccount() {
    const signer = NDKPrivateKeySigner.generate()
    await sessions.add(signer)
  }

  function switchSession(pubkey: string) {
    sessions.switch(pubkey)
    showSessionMenu = false
  }

  function logout() {
    sessions.logout()
  }

  function logoutAll() {
    if (confirm('Logout all sessions?')) {
      sessions.logoutAll()
    }
  }

  function formatPubkey(pubkey: string): string {
    return `${pubkey.slice(0, 8)}...${pubkey.slice(-8)}`
  }
</script>

<style>
  .session-switcher {
    position: relative;
    display: inline-block;
  }
  .current-session {
    padding: 8px 16px;
    background: #0066cc;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-family: monospace;
  }
  .session-menu {
    position: absolute;
    top: 100%;
    right: 0;
    background: white;
    border: 1px solid #ddd;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    min-width: 300px;
    margin-top: 8px;
    z-index: 1000;
  }
  .session-item {
    padding: 12px 16px;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;
  }
  .session-item:hover {
    background: #f9f9f9;
  }
  .session-item.active {
    background: #f0f7ff;
    border-left: 4px solid #0066cc;
  }
  .session-pubkey {
    font-family: monospace;
    font-size: 13px;
    font-weight: 600;
  }
  .session-meta {
    font-size: 12px;
    color: #666;
    margin-top: 4px;
  }
  .badge {
    background: #0066cc;
    color: white;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 10px;
    font-weight: 600;
  }
  .menu-actions {
    padding: 12px 16px;
    border-top: 2px solid #e0e0e0;
  }
  button {
    padding: 8px 12px;
    margin: 4px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: white;
    cursor: pointer;
    font-size: 13px;
  }
</style>

{#if initialized && sessions.current}
  <div class="session-switcher">
    <button
      class="current-session"
      onclick={() => showSessionMenu = !showSessionMenu}
    >
      {formatPubkey(sessions.current.pubkey)}
      {#if sessions.all.length > 1}
        ({sessions.all.length})
      {/if}
    </button>

    {#if showSessionMenu}
      <div class="session-menu">
        <div style="padding: 12px 16px; border-bottom: 1px solid #e0e0e0;">
          <strong>Logged in Accounts</strong>
        </div>

        {#each sessions.all as session}
          <div
            class="session-item"
            class:active={sessions.current?.pubkey === session.pubkey}
            onclick={() => switchSession(session.pubkey)}
          >
            <div>
              <span class="session-pubkey">
                {formatPubkey(session.pubkey)}
              </span>
              {#if sessions.current?.pubkey === session.pubkey}
                <span class="badge">ACTIVE</span>
              {/if}
            </div>
            <div class="session-meta">
              Follows: {session.follows.size} · Mutes: {session.mutes.size}
            </div>
          </div>
        {/each}

        <div class="menu-actions">
          <button onclick={addAnotherAccount}>Add Account</button>
          <button onclick={logout}>Logout Current</button>
          {#if sessions.all.length > 1}
            <button onclick={logoutAll}>Logout All</button>
          {/if}
        </div>
      </div>
    {/if}
  </div>
{/if}
```

## Session List Component

A simple list showing all sessions:

```svelte
<script lang="ts">
  import { sessions } from "@nostr-dev-kit/ndk-svelte5"

  function switchSession(pubkey: string) {
    sessions.switch(pubkey)
  }
</script>

<div>
  <h3>All Sessions ({sessions.all.length})</h3>

  {#if sessions.all.length === 0}
    <p>No sessions available</p>
  {:else}
    {#each sessions.all as session}
      <div class="session">
        <div>
          <strong>{session.pubkey.slice(0, 16)}...</strong>
          {#if sessions.current?.pubkey === session.pubkey}
            <span class="badge">ACTIVE</span>
          {/if}
        </div>
        <div>
          Follows: {session.follows.size} | Mutes: {session.mutes.size}
        </div>
        {#if sessions.current?.pubkey !== session.pubkey}
          <button onclick={() => switchSession(session.pubkey)}>
            Switch
          </button>
        {/if}
      </div>
    {/each}
  {/if}
</div>
```

## Best Practices

1. **Check for current session**: Always use `sessions.current` to check if a user is logged in
2. **Handle session switching**: Subscriptions update automatically when switching sessions
3. **Session persistence**: All sessions persist in localStorage across page reloads
4. **Memory management**: Each session loads its own profile, follows, and mutes independently
5. **UI feedback**: Always show which session is currently active

## Common Patterns

### Quick Session Switch in Header

```svelte
<header>
  {#if sessions.all.length > 1}
    <select
      value={sessions.current?.pubkey}
      onchange={(e) => sessions.switch(e.target.value)}
    >
      {#each sessions.all as session}
        <option value={session.pubkey}>
          {session.pubkey.slice(0, 16)}...
        </option>
      {/each}
    </select>
  {/if}
</header>
```

### Reactive Session Updates

```svelte
<script lang="ts">
  import { sessions } from "@nostr-dev-kit/ndk-svelte5"

  // This will automatically update when session switches
  $effect(() => {
    if (sessions.current) {
      console.log('Current session changed:', sessions.current.pubkey)
    }
  })
</script>
```

## See Also

- [Complete Authentication Flow](/ndk/cookbook/svelte5/basic-authentication) - Login methods
- [Session API Reference](/ndk/api/) - Full API documentation
