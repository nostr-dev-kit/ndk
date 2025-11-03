<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';

  const ndk = getContext<NDKSvelte>('ndk')!;
</script>

<section class="border-grid">
  <div class="container-wrapper">
    <div class="container">
      <h1 class="heading">
        NDK Svelte Components
      </h1>

      <p class="description">
        A collection of production-ready Nostr components built with Svelte 5 and NDK.
        Copy and paste into your apps. Open Source. Free forever.
      </p>

      <div class="badges">
        <span class="badge">Svelte 5 Runes</span>
        <span class="badge">TypeScript</span>
        <span class="badge">Shadcn-style Registry</span>
      </div>

      <div class="actions">
        <a href="/docs" class="button button-primary">
          Get Started
        </a>
        <a href="/blocks" class="button button-secondary">
          Browse Blocks
        </a>
      </div>
    </div>
  </div>
</section>

<section class="intro-section">
  <div class="container-wrapper">
    <div class="intro-container">
      <h2 class="section-heading">Built for Nostr Developers</h2>
      <p class="section-description">
        All components are built with Svelte 5's new runes API and work seamlessly with NDK.
        Browse the components in the sidebar to see live examples and usage documentation.
      </p>
    </div>
  </div>
</section>

<section class="connection-status-section">
  <div class="container-wrapper">
    <div class="status-container">
      <h3 class="status-heading">Connection Status</h3>
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
    </div>
  </div>
</section>

<style>
  .border-grid {
    border-bottom: 1px solid var(--color-border);
  }

  .container-wrapper {
    width: 100%;
    padding: 0 1rem;
  }

  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    padding: 4rem 0;
    text-align: center;
    max-width: 1200px;
    margin: 0 auto;
  }

  @media (min-width: 768px) {
    .container {
      padding: 6rem 0;
    }
  }

  @media (min-width: 1024px) {
    .container {
      padding: 8rem 0;
      gap: 2rem;
    }
  }

  .heading {
    max-width: 42rem;
    text-balance: balance;
    font-size: 2.5rem;
    font-weight: 600;
    line-height: 1.1;
    letter-spacing: -0.025em;
    color: var(--color-foreground);
    margin: 0;
  }

  @media (min-width: 1024px) {
    .heading {
      font-weight: 600;
      line-height: 1.1;
    }
  }

  @media (min-width: 1280px) {
    .heading {
      font-size: 3.5rem;
      letter-spacing: -0.05em;
    }
  }

  .description {
    max-width: 48rem;
    text-balance: balance;
    font-size: 1rem;
    color: var(--color-muted-foreground);
    margin: 0;
    line-height: 1.6;
  }

  @media (min-width: 640px) {
    .description {
      font-size: 1.125rem;
    }
  }

  .badges {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .badge {
    padding: 0.375rem 0.75rem;
    background: var(--color-secondary);
    color: var(--color-secondary-foreground);
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    border: 1px solid var(--color-border);
  }

  .actions {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding-top: 0.5rem;
    flex-wrap: wrap;
  }

  .button {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 500;
    outline: none;
    transition: all 0.15s ease-in-out;
    border-radius: 0.375rem;
    height: 2.5rem;
    gap: 0.375rem;
    padding: 0 1.5rem;
    cursor: pointer;
  }

  .button-primary {
    background: var(--primary);
    color: var(--primary-foreground);
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }

  .button-primary:hover {
    background: color-mix(in srgb, var(--primary) 90%, transparent);
  }

  .button-secondary {
    background: transparent;
    border: 1px solid var(--color-border);
    color: var(--color-foreground);
  }

  .button-secondary:hover {
    background: var(--color-accent);
  }

  .intro-section {
    padding: 3rem 0;
  }

  @media (min-width: 768px) {
    .intro-section {
      padding: 4rem 0;
    }
  }

  .intro-container {
    max-width: 1200px;
    margin: 0 auto;
    text-align: center;
  }

  .section-heading {
    font-size: 2rem;
    font-weight: 700;
    margin: 0 0 1rem 0;
    color: var(--color-foreground);
    letter-spacing: -0.025em;
  }

  .section-description {
    font-size: 1rem;
    line-height: 1.7;
    color: var(--color-muted-foreground);
    max-width: 48rem;
    margin: 0 auto;
  }

  .connection-status-section {
    padding: 3rem 0;
    background: var(--color-muted);
  }

  @media (min-width: 768px) {
    .connection-status-section {
      padding: 4rem 0;
    }
  }

  .status-container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .status-heading {
    margin: 0 0 1.5rem 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--color-foreground);
    text-align: center;
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
    background: var(--color-background);
    border-radius: 0.375rem;
    border: 1px solid var(--color-border);
  }

  .relay-url {
    font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
    font-size: 0.875rem;
    color: var(--color-foreground);
  }

  .relay-state {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-muted-foreground);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .relay-state.connected {
    color: var(--color-success);
  }
</style>
