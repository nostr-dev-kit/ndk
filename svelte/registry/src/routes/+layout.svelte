<script lang="ts">
  import '../app.css';
  import { setContext, getContext } from 'svelte';
  import { page } from '$app/stores';
  import { ndk, initializeNDK } from '$lib/ndk.svelte';
  import Navbar from '$site-components/Navbar.svelte';
  import Sidebar from '$site-components/Sidebar.svelte';
  import LoginModal from '$site-components/LoginModal.svelte';
  import { sidebar } from '$lib/stores/sidebar.svelte';
  import { nip19 } from 'nostr-tools';
  import type { Snippet } from 'svelte';
  import Toc from '$site-components/toc.svelte';

  let { children }: { children: Snippet } = $props();

  // Pages can use this to show a TOC
  const showTocForRoute = $derived(
    $page.url.pathname.startsWith('/components/') ||
    $page.url.pathname.startsWith('/docs/') ||
    $page.url.pathname.startsWith('/ui/')
  );

  const showSidebar = $derived($page.url.pathname.startsWith('/docs') || $page.url.pathname.startsWith('/components') || $page.url.pathname.startsWith('/ui'));

  let isInitialized = $state(false);
  let showLoginModal = $state(false);

  setContext('ndk', ndk);

  async function autoCreateAccount() {
    const sourceNpub = 'npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft';
    const decoded = nip19.decode(sourceNpub);
    const sourcePubkey = decoded.data as string;

    const contactListEvent = await ndk.fetchEvent({
      kinds: [3],
      authors: [sourcePubkey],
      limit: 1
    });

    const follows: string[] = [];
    if (contactListEvent) {
      for (const tag of contactListEvent.tags) {
        if (tag[0] === 'p') {
          follows.push(tag[1]);
        }
      }
    }

    const randomNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry'];
    const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
    const randomSeed = Math.random().toString(36).substring(2, 15);
    const avatarUrl = `https://api.dicebear.com/9.x/notionists/svg?seed=${randomSeed}`;

    await ndk.$sessions.createAccount({
      profile: {
        name: randomName,
        about: 'Just checking out Nostr!',
        picture: avatarUrl,
      },
      follows
    });
  }

  $effect(() => {
    console.log('connect')
    initializeNDK().then(async () => {
      isInitialized = true;

      if (!ndk.$currentPubkey) {
        await autoCreateAccount();
      }
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
    <Navbar
      onLoginClick={() => showLoginModal = true}
      onLogoutClick={handleLogout}
    />

    {#if showSidebar}
      <Sidebar />
    {/if}

    <main class="main" class:has-sidebar={showSidebar} class:sidebar-open={sidebar.open} class:sidebar-collapsed={sidebar.collapsed} class:has-toc={showTocForRoute}>
      <div class="main-content">
        {@render children()}
      </div>
    </main>

    {#if showTocForRoute}
      <aside class="right-sidebar">
        <Toc />
      </aside>
    {/if}
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
    background: var(--background);
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
    color: var(--primary);
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  .loading-text {
    font-size: 1rem;
    color: var(--muted-foreground);
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
    background: var(--background);
  }

  .main {
    flex: 1;
    margin-top: 3.5rem;
    margin-left: 0;
    margin-right: 0;
    display: flex;
    justify-content: center;
    transition: margin-left 300ms ease-in-out;
  }

  .main.has-sidebar {
    margin-left: 280px;
  }

  .main.has-sidebar.sidebar-collapsed {
    margin-left: 64px;
  }

  .main.has-toc {
    margin-right: 280px;
  }

  .main-content {
    width: 100%;
    max-width: 1000px;
    border-left: 1px solid var(--border);
    border-right: 1px solid var(--border);
  }

  .right-sidebar {
    position: fixed;
    right: 0;
    top: 3.5rem;
    width: 280px;
    height: calc(100vh - 3.5rem);
    padding: 3rem 2rem;
    overflow-y: auto;
    background: var(--background);
    border-left: 1px solid var(--border);
  }

  @media (max-width: 1600px) {
    .right-sidebar {
      display: none;
    }

    .main.has-toc {
      margin-right: 0;
    }
  }

  @media (max-width: 768px) {
    .main.has-sidebar {
      margin-left: 0;
    }

    .main.has-sidebar.sidebar-open {
      margin-left: 280px;
    }

    .main.has-sidebar.sidebar-open.sidebar-collapsed {
      margin-left: 64px;
    }
  }
</style>
