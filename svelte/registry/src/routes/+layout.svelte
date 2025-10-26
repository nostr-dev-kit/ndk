<script lang="ts">
  import { page } from '$app/stores';
  import { NDKSvelte } from '@nostr-dev-kit/svelte';
  import NDK from '@nostr-dev-kit/ndk';
  import { setContext } from 'svelte';

  const ndk = new NDKSvelte({
    explicitRelayUrls: [
      'wss://relay.damus.io',
      'wss://relay.nostr.band',
      'wss://nos.lol'
    ]
  });

  setContext('ndk', ndk);

  $effect(() => {
    ndk.connect();
  });

  const components = [
    { name: 'Avatar', path: '/components/avatar' },
    { name: 'Name', path: '/components/name' },
    { name: 'EventCard', path: '/components/event-card' },
  ];
</script>

<div class="app">
  <aside class="sidebar">
    <div class="sidebar-header">
      <h1>NDK Components</h1>
      <p>Svelte 5 Registry</p>
    </div>
    <nav class="nav">
      <a href="/" class:active={$page.url.pathname === '/'}>
        Home
      </a>
      {#each components as component}
        <a
          href={component.path}
          class:active={$page.url.pathname === component.path}
        >
          {component.name}
        </a>
      {/each}
    </nav>
  </aside>

  <main class="main">
    <slot />
  </main>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    background: #f9fafb;
  }

  .app {
    display: flex;
    min-height: 100vh;
  }

  .sidebar {
    width: 280px;
    background: white;
    border-right: 1px solid #e5e7eb;
    display: flex;
    flex-direction: column;
    position: fixed;
    height: 100vh;
    overflow-y: auto;
  }

  .sidebar-header {
    padding: 2rem 1.5rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .sidebar-header h1 {
    margin: 0 0 0.5rem 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: #111827;
  }

  .sidebar-header p {
    margin: 0;
    font-size: 0.875rem;
    color: #6b7280;
  }

  .nav {
    display: flex;
    flex-direction: column;
    padding: 1rem;
    gap: 0.25rem;
  }

  .nav a {
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    color: #374151;
    text-decoration: none;
    transition: all 0.2s;
    font-size: 0.875rem;
  }

  .nav a:hover {
    background: #f3f4f6;
    color: #111827;
  }

  .nav a.active {
    background: #8b5cf6;
    color: white;
  }

  .main {
    flex: 1;
    margin-left: 280px;
    padding: 2rem;
    max-width: 1200px;
  }

  @media (max-width: 768px) {
    .sidebar {
      display: none;
    }

    .main {
      margin-left: 0;
    }
  }
</style>
