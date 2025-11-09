<script lang="ts">
  import '../app.css';
  import { setContext, getContext } from 'svelte';
  import { page } from '$app/stores';
  import { ndk, initializeNDK } from '$lib/site/ndk.svelte';
  import Navbar from '$site-components/Navbar.svelte';
  import LoginModal from '$site-components/LoginModal.svelte';
  import { nip19 } from 'nostr-tools';
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();


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

    <main class="flex-1 mt-14">
      {@render children()}
    </main>
  </div>

  <LoginModal
    bind:show={showLoginModal}
    onClose={() => showLoginModal = false}
  />
{/if}
