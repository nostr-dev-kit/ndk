<script lang="ts">
  import '../app.css';
  import { setContext } from 'svelte';
  import { ndk, initializeNDK } from '$lib/ndk';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import LoginModal from '$lib/components/LoginModal.svelte';

  let isInitialized = $state(false);
  let showLoginModal = $state(false);

  setContext('ndk', ndk);

  $effect(() => {
    initializeNDK().then(() => {
      isInitialized = true;
    });
  });

  function handleLogout() {
    ndk.$sessions.logout();
  }
</script>

{#if !isInitialized}
  <div class="loading-screen">
    <div class="loading-content">
      <svg class="loading-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
      </svg>
      <p class="loading-text">Initializing...</p>
    </div>
  </div>
{:else}
  <div class="app">
    <Sidebar
      onLoginClick={() => showLoginModal = true}
      onLogoutClick={handleLogout}
    />

    <main class="main">
      <slot />
    </main>
  </div>

  <LoginModal
    bind:show={showLoginModal}
    onClose={() => showLoginModal = false}
  />
{/if}

<style>
  .loading-screen {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: hsl(var(--color-background));
  }

  .loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .loading-spinner {
    width: 3rem;
    height: 3rem;
    color: hsl(var(--color-primary));
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  .loading-text {
    font-size: 1rem;
    color: hsl(var(--color-muted-foreground));
    margin: 0;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  }

  .app {
    display: flex;
    min-height: 100vh;
    background: hsl(var(--color-background));
  }

  .main {
    flex: 1;
    margin-left: 280px;
    padding: 3rem 2rem;
    max-width: 1400px;
  }

  @media (max-width: 768px) {
    .main {
      margin-left: 0;
    }
  }
</style>
