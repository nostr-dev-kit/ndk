<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';

  const ndk = getContext<NDKSvelte>('ndk')!;
</script>

<div class="home">
  <header class="hero">
    <h1>NDK Svelte Components</h1>
    <p class="subtitle">
      A collection of production-ready Nostr components built with Svelte 5 and NDK
    </p>
    <div class="badges">
      <span class="badge">Svelte 5 Runes</span>
      <span class="badge">TypeScript</span>
      <span class="badge">Shadcn-style Registry</span>
    </div>
  </header>

  <section class="bg-black w-[500px] h-[500px] p-8 border border-red-500">
    <div class="bg-background w-[300px] h-[300px] border-4">
      <span class="text-white">this should be in color bg-background</span>
    </div>
  </section>

  <section class="bg-white w-[500px] h-[500px] p-8 border border-red-500">
    <div class="bg-background w-[300px] h-[300px] border-4">
      <span class="text-black">this should be in color bg-background</span>
    </div>
  </section>

  <section class="intro">
    <h2>Getting Started</h2>
    <p>
      Browse the components in the sidebar to see live examples and usage documentation.
      All components are built with Svelte 5's new runes API and work seamlessly with NDK.
    </p>
  </section>

  <section class="connection-status">
    <h3>Connection Status</h3>
    <div class="status-grid">
      {#if ndk.pool}
        {#each ndk.pool.relays.values() as relay}
          <div class="relay-status">
            <span class="relay-url">{relay.url}</span>
            <span class="relay-state" class:connected={relay.status === 1}>
              {relay.status === 1 ? '🟢 Connected' : '🔴 Disconnected'}
            </span>
          </div>
        {/each}
      {:else}
        <p>Connecting to relays...</p>
      {/if}
    </div>
  </section>
</div>

<style>
  .home {
    max-width: 1000px;
  }

  .hero {
    padding: 4rem 0 3rem;
    border-bottom: 1px solid hsl(var(--color-border));
    margin-bottom: 3rem;
  }

  .hero h1 {
    font-size: 3.5rem;
    font-weight: 700;
    margin: 0 0 1rem 0;
    color: hsl(var(--color-foreground));
    letter-spacing: -0.025em;
    line-height: 1.1;
  }

  .subtitle {
    font-size: 1.25rem;
    color: hsl(var(--color-muted-foreground));
    margin: 0 0 2rem 0;
    line-height: 1.6;
  }

  .badges {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .badge {
    padding: 0.375rem 0.75rem;
    background: hsl(var(--color-secondary));
    color: hsl(var(--color-secondary-foreground));
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    border: 1px solid hsl(var(--color-border));
  }

  .intro {
    margin-bottom: 3rem;
  }

  .intro h2 {
    font-size: 2rem;
    font-weight: 700;
    margin: 0 0 1rem 0;
    color: hsl(var(--color-foreground));
    letter-spacing: -0.025em;
  }

  .intro p {
    font-size: 1rem;
    line-height: 1.7;
    color: hsl(var(--color-muted-foreground));
  }

  .connection-status {
    margin-bottom: 3rem;
    padding: 1.5rem;
    background: hsl(var(--color-card));
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.5rem;
  }

  .connection-status h3 {
    margin: 0 0 1rem 0;
    font-size: 1rem;
    font-weight: 600;
    color: hsl(var(--color-foreground));
  }

  .status-grid {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .relay-status {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background: hsl(var(--color-muted) / 0.5);
    border-radius: 0.375rem;
    border: 1px solid hsl(var(--color-border));
  }

  .relay-url {
    font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
    font-size: 0.875rem;
    color: hsl(var(--color-foreground));
  }

  .relay-state {
    font-size: 0.875rem;
    font-weight: 500;
    color: hsl(var(--color-muted-foreground));
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .relay-state.connected {
    color: hsl(142 76% 36%);
  }
</style>
