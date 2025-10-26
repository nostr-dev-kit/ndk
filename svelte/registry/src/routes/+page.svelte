<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';

  const ndk = getContext<NDKSvelte>('ndk');
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
    max-width: 900px;
    margin: 0 auto;
  }

  .hero {
    text-align: center;
    padding: 3rem 0;
    border-bottom: 1px solid #e5e7eb;
    margin-bottom: 3rem;
  }

  .hero h1 {
    font-size: 3rem;
    font-weight: 800;
    margin: 0 0 1rem 0;
    background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .subtitle {
    font-size: 1.25rem;
    color: #6b7280;
    margin: 0 0 1.5rem 0;
  }

  .badges {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .badge {
    padding: 0.5rem 1rem;
    background: #f3f4f6;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
  }

  .intro {
    margin-bottom: 3rem;
  }

  .intro h2 {
    font-size: 1.875rem;
    font-weight: 700;
    margin: 0 0 1rem 0;
    color: #111827;
  }

  .intro p {
    font-size: 1.125rem;
    line-height: 1.75;
    color: #4b5563;
  }

  .connection-status {
    margin-bottom: 3rem;
    padding: 1.5rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
  }

  .connection-status h3 {
    margin: 0 0 1rem 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
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
    padding: 0.75rem;
    background: #f9fafb;
    border-radius: 0.5rem;
  }

  .relay-url {
    font-family: monospace;
    font-size: 0.875rem;
    color: #374151;
  }

  .relay-state {
    font-size: 0.875rem;
    font-weight: 500;
    color: #6b7280;
  }

  .relay-state.connected {
    color: #059669;
  }
</style>
