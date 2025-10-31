<script lang="ts">
  import BlockCard from '$site-components/BlockCard.svelte';
</script>

<section class="hero">
  <div class="hero-background"></div>
  <div class="hero-content">
    <h1 class="heading">Building Blocks for Nostr</h1>
    <p class="description">
      Production-ready components that help you build Nostr apps faster. Copy, paste, ship.
    </p>
    <div class="search-container">
      <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
      <input type="text" class="search-input" placeholder="Search blocks...">
    </div>
  </div>
</section>

<div class="filters">
  <button class="filter-pill active">All Blocks</button>
  <button class="filter-pill">Feeds & Discovery</button>
  <button class="filter-pill">User Profiles</button>
  <button class="filter-pill">Publishing</button>
  <button class="filter-pill">Messaging</button>
  <button class="filter-pill">Payments</button>
</div>

<section class="blocks-section">
  <div class="container">
    <div class="category-header">
      <h2 class="category-title">Feeds & Discovery</h2>
      <span class="category-count">3 blocks</span>
    </div>

    <div class="blocks-grid">
      <BlockCard
        title="Timeline Feeds"
        description="Infinite scroll feeds with real-time updates, filtering, and multiple layout options."
        icon="📰"
        href="/blocks/timeline-feeds"
        variantCount={5}
        badges={[
          { label: 'Kind 1' },
          { label: 'NIP-01', variant: 'nip' },
          { label: 'Medium' }
        ]}
        gradient="linear-gradient(135deg, rgba(245, 93, 108, 0.1) 0%, rgba(255, 100, 130, 0.1) 100%)"
        iconGradient="linear-gradient(135deg, #f55d6c 0%, #ff6482 100%)"
      />

      <BlockCard
        title="Thread Viewers"
        description="Nested conversation threads with reply chains and collapsible branches."
        icon="💬"
        href="/blocks/thread-viewers"
        variantCount={3}
        badges={[
          { label: 'Kind 1' },
          { label: 'NIP-10', variant: 'nip' },
          { label: 'Complex' }
        ]}
        gradient="linear-gradient(135deg, rgba(79, 172, 254, 0.1) 0%, rgba(0, 242, 254, 0.1) 100%)"
        iconGradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
      />

      <BlockCard
        title="Search & Explore"
        description="Global search with filters, trending topics, and user discovery."
        icon="🔍"
        href="/blocks/search-explore"
        variantCount={4}
        badges={[
          { label: 'Multiple Kinds' },
          { label: 'Medium' }
        ]}
        gradient="linear-gradient(135deg, rgba(67, 233, 123, 0.1) 0%, rgba(56, 249, 215, 0.1) 100%)"
        iconGradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
      />
    </div>
  </div>
</section>

<style>
  .hero {
    max-width: 1400px;
    margin: 0 auto;
    padding: 6rem 2rem 4rem;
    text-align: center;
    position: relative;
    overflow: hidden;
  }

  .hero-background {
    position: absolute;
    top: -20%;
    left: 50%;
    transform: translateX(-50%);
    width: 1400px;
    height: 500px;
    background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQwMCIgaGVpZ2h0PSI1MDAiIHZpZXdCb3g9IjAgMCAxNDAwIDUwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZDEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZmY5YWE4O3N0b3Atb3BhY2l0eTowLjMiLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojYTNjNGY4O3N0b3Atb3BhY2l0eTowLjMiLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8ZmlsdGVyIGlkPSJibHVyIj4KICAgICAgPGZlR2F1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj0iNDAiLz4KICAgIDwvZmlsdGVyPgogIDwvZGVmcz4KICA8cGF0aCBkPSJNMjAwIDEwMEw0MDAgMzAwTDYwMCAxNTBMODAwIDM1MEwxMDAwIDIwMEwxMjAwIDMwMCIgc3Ryb2tlPSJ1cmwoI2dyYWQxKSIgc3Ryb2tlLXdpZHRoPSIxMjAiIGZpbGw9Im5vbmUiIGZpbHRlcj0idXJsKCNibHVyKSIgb3BhY2l0eT0iMC42Ii8+CiAgPHBhdGggZD0iTTEwMCAyMDBMNDAwIDEwMEw3MDAgMzUwTDkwMCAxNTBMMTEwMCAzMDBMMTMwMCAxNTAiIHN0cm9rZT0idXJsKCNncmFkMSkiIHN0cm9rZS13aWR0aD0iMTAwIiBmaWxsPSJub25lIiBmaWx0ZXI9InVybCgjYmx1cikiIG9wYWNpdHk9IjAuNCIvPgogIDxwYXRoIGQ9Ik0zMDAgNTBMNjAwIDI1MEw5MDAgODBMMTEwMCAyODAiIHN0cm9rZT0iIzhmYTNmYiIgc3Ryb2tlLXdpZHRoPSI4MCIgZmlsbD0ibm9uZSIgZmlsdGVyPSJ1cmwoI2JsdXIpIiBvcGFjaXR5PSIwLjMiLz4KPC9zdmc+');
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center top;
    opacity: 0.5;
    pointer-events: none;
    z-index: 0;
  }

  .hero-content {
    position: relative;
    z-index: 1;
  }

  .heading {
    font-size: 4rem;
    font-weight: 700;
    letter-spacing: -0.03em;
    margin-bottom: 1.5rem;
    background: linear-gradient(135deg, var(--color-foreground) 0%, color-mix(in srgb, var(--color-foreground) 80%, transparent) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .description {
    font-size: 1.375rem;
    color: var(--color-muted-foreground);
    max-width: 600px;
    margin: 0 auto 3rem;
  }

  .search-container {
    max-width: 600px;
    margin: 0 auto 4rem;
    position: relative;
  }

  .search-input {
    width: 100%;
    padding: 1rem 1.25rem 1rem 3rem;
    background: var(--color-background);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    color: var(--color-foreground);
    font-size: 1rem;
    transition: all 0.2s;
  }

  .search-input:focus {
    outline: none;
    border-color: var(--color-primary);
  }

  .search-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-muted-foreground);
    width: 20px;
    height: 20px;
  }

  .filters {
    max-width: 1400px;
    margin: 0 auto 3rem;
    padding: 0 2rem;
    display: flex;
    gap: 0.75rem;
    overflow-x: auto;
  }

  .filter-pill {
    padding: 0.625rem 1.25rem;
    background: var(--color-background);
    border: 1px solid var(--color-border);
    border-radius: 100px;
    color: var(--color-muted-foreground);
    font-size: 0.875rem;
    font-weight: 500;
    white-space: nowrap;
    cursor: pointer;
    transition: all 0.2s;
  }

  .filter-pill:hover {
    background: var(--color-muted);
    color: var(--color-foreground);
  }

  .filter-pill.active {
    background: var(--color-primary);
    border-color: var(--color-primary);
    color: var(--primary-foreground);
  }

  .blocks-section {
    padding: 0 2rem 6rem;
  }

  .container {
    max-width: 1400px;
    margin: 0 auto;
  }

  .category-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
  }

  .category-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--color-foreground);
  }

  .category-count {
    color: var(--color-muted-foreground);
    font-size: 0.9rem;
  }

  .blocks-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    gap: 1.5rem;
  }

  @media (max-width: 968px) {
    .heading {
      font-size: 2.5rem;
    }

    .blocks-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
