# Mint Discovery Example

Simple, reactive mint discovery using `createMintDiscoveryStore` from `@nostr-dev-kit/wallet`.

## Basic Usage

```svelte
<script lang="ts">
  import { createMintDiscoveryStore } from '@nostr-dev-kit/wallet';
  import ndk from './lib/ndk';

  const mintStore = createMintDiscoveryStore(ndk, {
    network: 'mainnet',
    timeout: 10000, // Auto-stop after 10 seconds
  });
</script>

{#each $mintStore.mints as mint}
  <div class:online={mint.isOnline}>
    <h3>{mint.name || mint.url}</h3>

    {#if mint.description}
      <p>{mint.description}</p>
    {/if}

    {#if mint.icon}
      <img src={mint.icon} alt={mint.name} />
    {/if}

    <div class="url">{mint.url}</div>

    {#if mint.recommendations.length > 0}
      <span>⭐ {mint.recommendations.length} recommendations</span>
    {/if}

    {#if mint.isOnline !== undefined}
      <span class="status">
        {mint.isOnline ? '🟢 Online' : '🔴 Offline'}
      </span>
    {/if}
  </div>
{/each}

<div class="progress">
  Found {$mintStore.progress.announcementsFound} announcements
  and {$mintStore.progress.recommendationsFound} recommendations
</div>
```

## How It Works

The store automatically:

1. **Subscribes to NIP-87 events** - Mint announcements (kind 38172) and recommendations (kind 38000)
2. **Fetches `/v1/info`** - For each discovered mint, fetches metadata from the mint's info endpoint in the background
3. **Updates reactively** - The UI automatically updates as:
   - New announcements arrive from Nostr relays
   - Mint info loads from HTTP endpoints
   - Recommendations come in

## API

### Store State

- `mints: MintMetadata[]` - Array of discovered mints, sorted by score
- `progress` - Discovery progress counters

### Store Methods

- `getMint(url: string)` - Get a specific mint by URL
- `getTopMints(limit?, minRecommendations?)` - Get top-rated mints
- `searchMints(query: string)` - Search mints by name/description/URL
- `recommendMint(url: string, review: string)` - Publish a recommendation
- `stop()` - Stop discovery and clean up subscriptions

### MintMetadata Properties

- `url: string` - Mint URL
- `name?: string` - Mint name (from announcement or /v1/info)
- `description?: string` - Mint description
- `icon?: string` - Icon URL
- `isOnline?: boolean` - Online status (undefined until checked)
- `recommendations: NDKMintRecommendation[]` - Recommendation events
- `score: number` - Number of recommendations
- `network?: string` - Network identifier
- `nuts: string[]` - Supported NUT protocols
- `contact?: object` - Contact info

## Cleanup

```svelte
<script>
  import { onDestroy } from 'svelte';

  const mintStore = createMintDiscoveryStore(ndk);

  onDestroy(() => {
    mintStore.getState().stop();
  });
</script>
```
