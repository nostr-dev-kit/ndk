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
  <div class="flex items-center justify-center min-h-screen bg-background">
    <div class="flex flex-col items-center gap-4">
      <svg class="w-12 h-12 text-primary animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
        <path d="M2 17l10 5 10-5"></path>
        <path d="M2 12l10 5 10-5"></path>
      </svg>
      <p class="text-base text-muted-foreground m-0">Initializing...</p>
    </div>
  </div>
{:else}
  <div class="flex min-h-screen bg-background">
    <Navbar
      onLoginClick={() => showLoginModal = true}
      onLogoutClick={handleLogout}
    />

    {#if showSidebar}
      <Sidebar />
    {/if}

    <main
      class="flex-1 mt-14 ml-0 mr-0 flex justify-center transition-[margin-left] duration-300 ease-in-out"
      class:!ml-[280px]={showSidebar && !sidebar.collapsed}
      class:!ml-16={showSidebar && sidebar.collapsed}
      class:!mr-[280px]={showTocForRoute}
      class:max-2xl:!mr-0={showTocForRoute}
      class:max-md:!ml-0={showSidebar && !sidebar.open}
      class:max-md:!ml-[280px]={showSidebar && sidebar.open && !sidebar.collapsed}
      class:max-md:!ml-16={showSidebar && sidebar.open && sidebar.collapsed}
    >
      <div class="w-full max-w-[1000px] border-l border-r border-border">
        {@render children()}
      </div>
    </main>

    {#if showTocForRoute}
      <aside class="fixed right-0 top-14 w-[280px] h-[calc(100vh-3.5rem)] py-12 px-8 overflow-y-auto bg-background border-l border-border max-2xl:hidden">
        <Toc />
      </aside>
    {/if}
  </div>

  <LoginModal
    bind:show={showLoginModal}
    onClose={() => showLoginModal = false}
  />
{/if}
