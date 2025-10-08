<script lang="ts">
  import { ndk } from './lib/ndk';
  import { NDKUser } from '@nostr-dev-kit/ndk';
  import { SvelteMap } from 'svelte/reactivity';
  import BookmarkCard from './components/BookmarkCard.svelte';
  import AddBookmarkModal from './components/AddBookmarkModal.svelte';
  import TagCloud from './components/TagCloud.svelte';
  import LoginButton from './components/LoginButton.svelte';
  import UserMenu from './components/UserMenu.svelte';
  import RelaySelector from './components/RelaySelector.svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';

  // Subscribe to bookmarks (kind 39701)
  const subscription = ndk.$subscribe(() => [
    {
      kinds: [39701],
      limit: 100,
    },
  ]);

  let showModal = $state(false);
  let selectedTag = $state<string | null>(null);
  let selectedRelay = $state<string | null>(null);
  let searchQuery = $state('');

  // Use reactive values directly (no polling needed)
  let bookmarks = $derived(Array.from(subscription.events));
  let eosed = $derived(subscription.eosed);
  let currentUser = $derived((() => {
    if (!ndk.$sessions.current) return undefined;
    const user = new NDKUser({ pubkey: ndk.$sessions.current.pubkey });
    user.ndk = ndk;
    user.profile = ndk.$sessions.current.profile;
    return user;
  })());

  // Debug: log user info
  $effect(() => {
    if (currentUser) {
      console.log('👤 Current User Info:', {
        pubkey: currentUser.pubkey,
        npub: currentUser.npub,
        profile: currentUser.profile,
        user: currentUser,
      });
    }
  });

  // Extract all tags with counts
  const tagCounts = $derived(
    (() => {
      const counts = new Map();
      for (const bookmark of bookmarks) {
        const tags = bookmark.tags.filter((t) => t[0] === 't');
        for (const [, tag] of tags) {
          counts.set(tag, (counts.get(tag) || 0) + 1);
        }
      }
      return Array.from(counts.entries())
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);
    })()
  );

  // Filter bookmarks
  const filteredBookmarks = $derived(
    (() => {
      let filtered = bookmarks;

      // Filter by relay
      if (selectedRelay) {
        filtered = filtered.filter((b) => b.relay?.url === selectedRelay);
      }

      // Filter by tag
      if (selectedTag) {
        filtered = filtered.filter((b) => b.tags.some((t) => t[0] === 't' && t[1] === selectedTag));
      }

      // Filter by search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter((b) => {
          const title = b.tags.find((t) => t[0] === 'title')?.[1] || '';
          const url = b.tags.find((t) => t[0] === 'd')?.[1] || '';
          const content = b.content || '';
          return (
            title.toLowerCase().includes(query) ||
            url.toLowerCase().includes(query) ||
            content.toLowerCase().includes(query)
          );
        });
      }

      return [...filtered].sort((a, b) => {
        const aTime = Number(a.tags.find((t) => t[0] === 'published_at')?.[1] || a.created_at);
        const bTime = Number(b.tags.find((t) => t[0] === 'published_at')?.[1] || b.created_at);
        return bTime - aTime;
      });
    })()
  );

  // Create bento grid pattern (varying sizes)
  const bentoPattern = $derived(
    (() => {
      const pattern: Array<'small' | 'medium' | 'large'> = [];
      let i = 0;
      while (i < filteredBookmarks.length) {
        // Every 7th item is large, every 3rd is medium, rest are small
        if (i % 7 === 0) {
          pattern.push('large');
        } else if (i % 3 === 0) {
          pattern.push('medium');
        } else {
          pattern.push('small');
        }
        i++;
      }
      return pattern;
    })()
  );

  function handleTagClick(tag: string | null) {
    selectedTag = tag;
  }

  function handleRelayChange(relay: string | null) {
    selectedRelay = relay;
  }
</script>

<div class="app">
  <header class="header">
    <div class="header-content">
      <div class="logo">
        <span class="logo-icon">⭐</span>
        <h1>Constellation</h1>
      </div>

      <div class="header-stats">
        <span class="stat">
          <span class="stat-value">{filteredBookmarks.length}</span>
          <span class="stat-label">stars</span>
        </span>
        {#if !eosed}
          <span class="loading-pulse"></span>
        {/if}

        <RelaySelector {selectedRelay} onRelayChange={handleRelayChange} />

        {#if currentUser}
          <UserMenu user={currentUser} />
        {:else}
          <LoginButton />
        {/if}
      </div>
    </div>

    <div class="header-actions">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input
          type="search"
          placeholder="Search bookmarks..."
          bind:value={searchQuery}
        />
      </div>
    </div>
  </header>

  <main class="main">
    {#if tagCounts.length > 0}
      <section class="tags-section">
        <TagCloud tags={tagCounts} {selectedTag} onTagClick={handleTagClick} />
      </section>
    {/if}

    {#if filteredBookmarks.length === 0}
      <div class="empty-state">
        {#if bookmarks.length === 0}
          <div class="empty-icon">✨</div>
          <h2>Your constellation awaits</h2>
          <p>
            Start collecting the web's brightest stars. Click the + button to add your first
            bookmark.
          </p>
        {:else}
          <div class="empty-icon">🔭</div>
          <h2>No matches found</h2>
          <p>Try a different search or tag</p>
        {/if}
      </div>
    {:else}
      <div class="bento-grid">
        {#each filteredBookmarks as bookmark, i (bookmark.id)}
          <BookmarkCard {bookmark} size={bentoPattern[i]} />
        {/each}
      </div>
    {/if}
  </main>

  {#if currentUser}
    <button class="fab" onclick={() => (showModal = true)} type="button" aria-label="Add bookmark">
      <span class="fab-icon">+</span>
    </button>

    {#if showModal}
      <AddBookmarkModal onClose={() => (showModal = false)} />
    {/if}
  {/if}
</div>

<style>
  .app {
    min-height: 100vh;
    padding-bottom: 5rem;
  }

  .header {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(10, 10, 15, 0.8);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
    padding: 1.5rem;
  }

  .header-content {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .logo-icon {
    font-size: 2rem;
    filter: drop-shadow(0 0 10px rgba(168, 85, 247, 0.5));
  }

  .logo h1 {
    margin: 0;
    font-size: 1.75rem;
    font-weight: 800;
    background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .header-stats {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .stat {
    display: flex;
    align-items: baseline;
    gap: 0.375rem;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
  }

  .stat-label {
    font-size: 0.875rem;
    color: var(--text-secondary);
  }

  .loading-pulse {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--accent-purple);
    box-shadow: 0 0 10px var(--accent-purple);
  }

  .header-actions {
    max-width: 1400px;
    margin: 0 auto;
  }

  .search-box {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1.25rem;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 9999px;
    transition: all 0.2s;
  }

  .search-box:focus-within {
    border-color: var(--accent-purple);
    box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.2);
  }

  .search-icon {
    font-size: 1.125rem;
  }

  .search-box input {
    flex: 1;
    background: none;
    border: none;
    outline: none;
    color: var(--text-primary);
    font-size: 0.875rem;
    font-family: inherit;
  }

  .search-box input::placeholder {
    color: var(--text-tertiary);
  }

  .main {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
  }

  .tags-section {
    margin-bottom: 2rem;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 4rem 2rem;
    min-height: 400px;
  }

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    filter: drop-shadow(0 0 20px rgba(168, 85, 247, 0.3));
  }

  .empty-state h2 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
  }

  .empty-state p {
    color: var(--text-secondary);
    max-width: 400px;
    margin: 0;
  }

  .bento-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
    grid-auto-flow: dense;
  }

  .bento-grid :global(.card.large) {
    grid-column: span 2;
    grid-row: span 2;
  }

  .bento-grid :global(.card.medium) {
    grid-column: span 1;
    grid-row: span 2;
  }

  @media (max-width: 768px) {
    .bento-grid {
      grid-template-columns: 1fr;
    }

    .bento-grid :global(.card.large),
    .bento-grid :global(.card.medium) {
      grid-column: span 1;
      grid-row: span 1;
    }

    .header {
      padding: 1rem;
    }

    .logo h1 {
      font-size: 1.5rem;
    }

    .main {
      padding: 1.5rem 1rem;
    }
  }

  .fab {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue));
    border: none;
    cursor: pointer;
    box-shadow:
      0 8px 24px rgba(168, 85, 247, 0.4),
      0 0 0 0 rgba(168, 85, 247, 0.5);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .fab:hover {
    transform: scale(1.1) rotate(90deg);
    box-shadow:
      0 12px 32px rgba(168, 85, 247, 0.5),
      0 0 0 8px rgba(168, 85, 247, 0.2);
  }

  .fab:active {
    transform: scale(0.95) rotate(90deg);
  }

  .fab-icon {
    font-size: 2rem;
    color: white;
    font-weight: 300;
    line-height: 1;
  }
</style>
