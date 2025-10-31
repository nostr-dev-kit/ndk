<script lang="ts">
  import BlockCard from '$site-components/BlockCard.svelte';
</script>

<section class="max-w-[1400px] mx-auto py-24 px-8 pb-16 text-center relative overflow-hidden">
  <div class="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[1400px] h-[500px] opacity-50 pointer-events-none z-0" style="background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQwMCIgaGVpZ2h0PSI1MDAiIHZpZXdCb3g9IjAgMCAxNDAwIDUwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZDEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZmY5YWE4O3N0b3Atb3BhY2l0eTowLjMiLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojYTNjNGY4O3N0b3Atb3BhY2l0eTowLjMiLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8ZmlsdGVyIGlkPSJibHVyIj4KICAgICAgPGZlR2F1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj0iNDAiLz4KICAgIDwvZmlsdGVyPgogIDwvZGVmcz4KICA8cGF0aCBkPSJNMjAwIDEwMEw0MDAgMzAwTDYwMCAxNTBMODAwIDM1MEwxMDAwIDIwMEwxMjAwIDMwMCIgc3Ryb2tlPSJ1cmwoI2dyYWQxKSIgc3Ryb2tlLXdpZHRoPSIxMjAiIGZpbGw9Im5vbmUiIGZpbHRlcj0idXJsKCNibHVyKSIgb3BhY2l0eT0iMC42Ii8+CiAgPHBhdGggZD0iTTEwMCAyMDBMNDAwIDEwMEw3MDAgMzUwTDkwMCAxNTBMMTEwMCAzMDBMMTMwMCAxNTAiIHN0cm9rZT0idXJsKCNncmFkMSkiIHN0cm9rZS13aWR0aD0iMTAwIiBmaWxsPSJub25lIiBmaWx0ZXI9InVybCgjYmx1cikiIG9wYWNpdHk9IjAuNCIvPgogIDxwYXRoIGQ9Ik0zMDAgNTBMNjAwIDI1MEw5MDAgODBMMTEwMCAyODAiIHN0cm9rZT0iIzhmYTNmYiIgc3Ryb2tlLXdpZHRoPSI4MCIgZmlsbD0ibm9uZSIgZmlsdGVyPSJ1cmwoI2JsdXIpIiBvcGFjaXR5PSIwLjMiLz4KPC9zdmc+'); background-size: contain; background-repeat: no-repeat; background-position: center top;"></div>
  <div class="relative z-10">
    <h1 class="text-6xl font-bold -tracking-[0.03em] mb-6" style="background: linear-gradient(135deg, var(--color-foreground) 0%, color-mix(in srgb, var(--color-foreground) 80%, transparent) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Building Blocks for Nostr</h1>
    <p class="text-[1.375rem] text-muted-foreground max-w-[600px] mx-auto mb-12">
      Production-ready components that help you build Nostr apps faster. Copy, paste, ship.
    </p>
    <div class="max-w-[600px] mx-auto mb-16 relative">
      <svg class="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
      <input type="text" class="w-full py-4 px-5 pl-12 bg-background border border-border rounded-xl text-foreground text-base transition-all focus:outline-none focus:border-primary" placeholder="Search blocks...">
    </div>
  </div>
</section>

<div class="max-w-[1400px] mx-auto mb-12 px-8 flex gap-3 overflow-x-auto">
  <button class="py-2.5 px-5 bg-primary border border-primary rounded-full text-primary-foreground text-sm font-medium whitespace-nowrap cursor-pointer transition-all">All Blocks</button>
  <button class="py-2.5 px-5 bg-background border border-border rounded-full text-muted-foreground text-sm font-medium whitespace-nowrap cursor-pointer transition-all hover:bg-muted hover:text-foreground">Feeds & Discovery</button>
  <button class="py-2.5 px-5 bg-background border border-border rounded-full text-muted-foreground text-sm font-medium whitespace-nowrap cursor-pointer transition-all hover:bg-muted hover:text-foreground">User Profiles</button>
  <button class="py-2.5 px-5 bg-background border border-border rounded-full text-muted-foreground text-sm font-medium whitespace-nowrap cursor-pointer transition-all hover:bg-muted hover:text-foreground">Publishing</button>
  <button class="py-2.5 px-5 bg-background border border-border rounded-full text-muted-foreground text-sm font-medium whitespace-nowrap cursor-pointer transition-all hover:bg-muted hover:text-foreground">Messaging</button>
  <button class="py-2.5 px-5 bg-background border border-border rounded-full text-muted-foreground text-sm font-medium whitespace-nowrap cursor-pointer transition-all hover:bg-muted hover:text-foreground">Payments</button>
</div>

<section class="px-8 pb-24">
  <div class="max-w-[1400px] mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-semibold text-foreground">Authentication</h2>
      <span class="text-muted-foreground text-sm">1 block</span>
    </div>

    <div class="grid grid-cols-[repeat(auto-fill,minmax(360px,1fr))] gap-6 mb-16">
      <BlockCard
        title="Login"
        description="Smart login component with adaptive UI - supports nsec, ncryptsec, browser extensions, bunker signers, and NIP-05."
        icon="🔐"
        href="/blocks/login"
        variantCount={2}
        badges={[
          { label: 'NIP-07', variant: 'nip' },
          { label: 'NIP-46', variant: 'nip' },
          { label: 'NIP-49', variant: 'nip' }
        ]}
        gradient="linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)"
        iconGradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      />
    </div>

    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-semibold text-foreground">Feeds & Discovery</h2>
      <span class="text-muted-foreground text-sm">3 blocks</span>
    </div>

    <div class="grid grid-cols-[repeat(auto-fill,minmax(360px,1fr))] gap-6">
      <BlockCard
        title="Timeline Feeds"
        description="Infinite scroll feeds with real-time updates, filtering, and multiple layout options."
        icon="📰"
        href="/blocks/timeline-feeds"
        variantCount={5}
        badges={[
          { label: 'Kind 1' },
          { label: 'NIP-01', variant: 'nip' }
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
          { label: 'NIP-10', variant: 'nip' }
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
          { label: 'Multiple Kinds' }
        ]}
        gradient="linear-gradient(135deg, rgba(67, 233, 123, 0.1) 0%, rgba(56, 249, 215, 0.1) 100%)"
        iconGradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
      />
    </div>

    <div class="flex items-center justify-between mb-6 mt-16">
      <h2 class="text-2xl font-semibold text-foreground">Publishing</h2>
      <span class="text-muted-foreground text-sm">1 block</span>
    </div>

    <div class="grid grid-cols-[repeat(auto-fill,minmax(360px,1fr))] gap-6">
      <BlockCard
        title="Note Composer"
        description="Composable note and reply composer with mentions, media uploads, and multiple layout options."
        icon="✍️"
        href="/blocks/note-composer"
        variantCount={4}
        badges={[
          { label: 'Kind 1' },
          { label: 'Kind 1111' },
          { label: 'NIP-10', variant: 'nip' }
        ]}
        gradient="linear-gradient(135deg, rgba(250, 172, 70, 0.1) 0%, rgba(255, 140, 90, 0.1) 100%)"
        iconGradient="linear-gradient(135deg, #faac46 0%, #ff8c5a 100%)"
      />
    </div>
  </div>
</section>
