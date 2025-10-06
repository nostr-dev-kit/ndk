<script lang="ts">
  import { onMount } from 'svelte';
  import NDK from '@nostr-dev-kit/ndk';
  import { RelayManager } from '@nostr-dev-kit/svelte';

  let ndk = $state<NDK | undefined>(undefined);

  onMount(() => {
    ndk = new NDK({
      explicitRelayUrls: [
        'wss://relay.damus.io',
        'wss://nos.lol',
        'wss://relay.nostr.band',
      ],
    });

    ndk.connect();
  });
</script>

<main>
  <div class="app-header">
    <h1>🌐 NDK Relay Manager</h1>
    <p class="subtitle">Component Browser & Testing Interface</p>
  </div>

  <div class="container">
    {#if ndk}
      <RelayManager {ndk} />
    {:else}
      <div class="loading">
        <div class="spinner"></div>
        <p>Initializing NDK...</p>
      </div>
    {/if}
  </div>

  <footer>
    <p>
      Built with <a href="https://github.com/nostr-dev-kit/ndk" target="_blank">NDK</a>
      - Nostr Development Kit
    </p>
  </footer>
</main>

<style>
  :global(*) {
    box-sizing: border-box;
  }

  :global(body) {
    margin: 0;
    padding: 0;
    font-family:
      -apple-system,
      BlinkMacSystemFont,
      'Segoe UI',
      Roboto,
      Oxygen,
      Ubuntu,
      Cantarell,
      'Helvetica Neue',
      sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
  }

  main {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .app-header {
    text-align: center;
    padding: 3rem 2rem 2rem;
    color: white;
  }

  .app-header h1 {
    margin: 0 0 0.5rem 0;
    font-size: 2.5rem;
    font-weight: 800;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .subtitle {
    margin: 0;
    font-size: 1.125rem;
    opacity: 0.95;
    font-weight: 400;
  }

  .container {
    flex: 1;
    max-width: 1400px;
    width: 100%;
    margin: 0 auto;
    padding: 2rem;
  }

  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    color: white;
    gap: 1rem;
  }

  .spinner {
    width: 48px;
    height: 48px;
    border: 4px solid rgba(255, 255, 255, 0.2);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .loading p {
    font-size: 1.125rem;
    margin: 0;
    font-weight: 500;
  }

  footer {
    text-align: center;
    padding: 2rem;
    color: white;
  }

  footer p {
    margin: 0;
    font-size: 0.875rem;
    opacity: 0.9;
  }

  footer a {
    color: white;
    text-decoration: underline;
    font-weight: 600;
  }

  footer a:hover {
    opacity: 0.8;
  }

  :global(.relay-manager) {
    --manager-bg: #ffffff;
    --card-bg: #ffffff;
    --border-color: #e5e7eb;
    --hover-bg: #f9fafb;
    --text-primary: #111827;
    --text-secondary: #6b7280;
    --text-tertiary: #9ca3af;
    --primary-color: #667eea;
    --primary-hover: #5568d3;
    --primary-light: rgba(102, 126, 234, 0.1);
    --disabled-bg: #f9fafb;
    --count-bg: #f3f4f6;
    --count-text: #6b7280;
    --tabs-bg: #ffffff;
  }

  @media (max-width: 768px) {
    .app-header h1 {
      font-size: 2rem;
    }

    .subtitle {
      font-size: 1rem;
    }

    .container {
      padding: 1rem;
    }
  }
</style>
