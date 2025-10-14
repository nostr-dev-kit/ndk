---
layout: page
title: NDK Cookbook
---

<style>
.cookbook-hero {
  text-align: center;
  padding: 3rem 0;
  border-bottom: 1px solid var(--vp-c-divider);
}

.cookbook-hero h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.cookbook-subtitle {
  font-size: 1.25rem;
  color: var(--vp-c-text-2);
  margin-bottom: 2rem;
}

.search-box {
  max-width: 600px;
  margin: 0 auto 2rem;
}

.search-box input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}

.trending-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  margin: 1.5rem 0;
}

.tag {
  padding: 0.25rem 0.75rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  font-size: 0.875rem;
  color: var(--vp-c-text-1);
  text-decoration: none;
  transition: all 0.2s;
}

.tag:hover {
  border-color: var(--vp-c-brand);
  color: var(--vp-c-brand);
}

.recipe-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  background: var(--vp-c-bg-soft);
  transition: all 0.2s;
}

.recipe-card:hover {
  border-color: var(--vp-c-brand);
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.recipe-title {
  font-size: 1.5rem;
  margin: 0 0 0.75rem 0;
}

.recipe-title a {
  color: var(--vp-c-text-1);
  text-decoration: none;
}

.recipe-title a:hover {
  color: var(--vp-c-brand);
}

.recipe-description {
  color: var(--vp-c-text-2);
  margin-bottom: 1rem;
  line-height: 1.6;
}

.recipe-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.recipe-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  flex-wrap: wrap;
}

.recipe-meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.stats {
  display: flex;
  gap: 1rem;
  margin-left: auto;
}

.new-badge {
  background: var(--vp-c-brand);
  color: white;
  padding: 0.125rem 0.5rem;
  border-radius: 3px;
  font-size: 0.75rem;
  font-weight: 600;
}
</style>

<div class="cookbook-hero">
  <h1>NDK Cookbook</h1>
  <p class="cookbook-subtitle">Discover self-contained recipes for building with NDK</p>

  <div class="search-box">
    <input type="text" placeholder="🔍 Search recipes..." />
  </div>

  <div class="trending-tags">
    <span style="margin-right: 0.5rem; color: var(--vp-c-text-2);">Trending:</span>
    <a href="#" class="tag">#nip-46</a>
    <a href="#" class="tag">#multi-session</a>
    <a href="#" class="tag">#cashu</a>
    <a href="#" class="tag">#outbox-model</a>
    <a href="#" class="tag">#authentication</a>
  </div>
</div>

## Recent Recipes

<div class="recipe-card">
  <h3 class="recipe-title">
    <a href="/ndk/cookbook/svelte5/multi-session-management">Multi-Session Management with Account Switcher</a>
  </h3>

  <p class="recipe-description">
    Learn how to manage multiple Nostr accounts simultaneously in a Svelte 5 application. Includes session switching, profile management, and a complete UI for handling multiple logged-in users.
  </p>

  <div class="recipe-tags">
    <span class="tag">#svelte</span>
    <span class="tag">#authentication</span>
    <span class="tag">#multi-session</span>
    <span class="tag">#session-management</span>
  </div>

  <div class="recipe-meta">
    <span class="recipe-meta-item">📦 svelte</span>
    <span class="recipe-meta-item">⭐⭐⭐ Advanced</span>
    <span class="recipe-meta-item">⏱ 20 min</span>
    <div class="stats">
      <span class="recipe-meta-item">👍 47</span>
      <span class="recipe-meta-item">💬 12</span>
      <span class="recipe-meta-item">📖 1.2k</span>
    </div>
  </div>
</div>

<div class="recipe-card">
  <h3 class="recipe-title">
    <a href="/ndk/cookbook/svelte5/basic-authentication">Complete Authentication Flow with NIP-07, nsec, and NIP-46</a>
  </h3>

  <p class="recipe-description">
    Implement a complete authentication system supporting browser extensions (NIP-07), private keys (nsec), and remote signers (NIP-46) with bunker:// and nostrconnect:// flows. Includes QR code generation and error handling.
  </p>

  <div class="recipe-tags">
    <span class="tag">#svelte</span>
    <span class="tag">#authentication</span>
    <span class="tag">#nip-07</span>
    <span class="tag">#nip-46</span>
    <span class="tag">#sessions</span>
  </div>

  <div class="recipe-meta">
    <span class="recipe-meta-item">📦 svelte</span>
    <span class="recipe-meta-item">⭐⭐ Intermediate</span>
    <span class="recipe-meta-item">⏱ 15 min</span>
    <div class="stats">
      <span class="recipe-meta-item">👍 234</span>
      <span class="recipe-meta-item">💬 23</span>
      <span class="recipe-meta-item">📖 3.4k</span>
    </div>
  </div>
</div>

<div class="recipe-card">
  <h3 class="recipe-title">
    <a href="/ndk/snippets/testing/mock-relays">Testing with Mock Relays</a>
  </h3>

  <p class="recipe-description">
    Create and use mock relays for testing NDK applications without connecting to real Nostr relays. Perfect for unit tests, integration tests, and development environments.
  </p>

  <div class="recipe-tags">
    <span class="tag">#ndk-core</span>
    <span class="tag">#testing</span>
    <span class="tag">#mock</span>
    <span class="tag">#relays</span>
  </div>

  <div class="recipe-meta">
    <span class="recipe-meta-item">📦 ndk-core</span>
    <span class="recipe-meta-item">⭐ Beginner</span>
    <span class="recipe-meta-item">⏱ 8 min</span>
    <div class="stats">
      <span class="recipe-meta-item">👍 189</span>
      <span class="recipe-meta-item">💬 15</span>
      <span class="recipe-meta-item">📖 2.8k</span>
    </div>
  </div>
</div>

<div class="recipe-card">
  <h3 class="recipe-title">
    <a href="/ndk/snippets/wallet/connect-nwc">Connect to Nostr Wallet Connect (NWC)</a>
  </h3>

  <p class="recipe-description">
    Set up a connection to an NWC wallet and configure it for zapping. Learn how to handle wallet events, request permissions, and send Lightning payments through Nostr.
  </p>

  <div class="recipe-tags">
    <span class="tag">#ndk-wallet</span>
    <span class="tag">#nwc</span>
    <span class="tag">#zaps</span>
    <span class="tag">#payments</span>
    <span class="tag">#lightning</span>
  </div>

  <div class="recipe-meta">
    <span class="recipe-meta-item">📦 ndk-wallet</span>
    <span class="recipe-meta-item">⭐⭐ Intermediate</span>
    <span class="recipe-meta-item">⏱ 12 min</span>
    <div class="stats">
      <span class="recipe-meta-item">👍 156</span>
      <span class="recipe-meta-item">💬 8</span>
      <span class="recipe-meta-item">📖 1.9k</span>
    </div>
  </div>
</div>

<div class="recipe-card">
  <h3 class="recipe-title">
    <a href="/ndk/snippets/wallet/using-cashu-wallet">Using Cashu Wallet for E-Cash</a>
  </h3>

  <p class="recipe-description">
    Create and use a Cashu wallet for managing e-cash tokens. Includes minting, melting, sending, and receiving Cashu tokens with complete error handling and balance management.
  </p>

  <div class="recipe-tags">
    <span class="tag">#ndk-wallet</span>
    <span class="tag">#cashu</span>
    <span class="tag">#e-cash</span>
    <span class="tag">#nutzaps</span>
    <span class="tag">#nip-60</span>
  </div>

  <div class="recipe-meta">
    <span class="recipe-meta-item">📦 ndk-wallet</span>
    <span class="recipe-meta-item">⭐⭐⭐ Advanced</span>
    <span class="recipe-meta-item">⏱ 25 min</span>
    <div class="stats">
      <span class="recipe-meta-item">👍 98</span>
      <span class="recipe-meta-item">💬 19</span>
      <span class="recipe-meta-item">📖 876</span>
    </div>
  </div>
</div>

<div class="recipe-card">
  <h3 class="recipe-title">
    <a href="/ndk/snippets/event/basic">Publishing Your First Nostr Event</a>
  </h3>

  <p class="recipe-description">
    Learn the fundamentals of creating and publishing Nostr events with NDK. Covers event structure, signing, and publishing to relays with proper error handling.
  </p>

  <div class="recipe-tags">
    <span class="tag">#ndk-core</span>
    <span class="tag">#events</span>
    <span class="tag">#publishing</span>
    <span class="tag">#beginner</span>
  </div>

  <div class="recipe-meta">
    <span class="recipe-meta-item">📦 ndk-core</span>
    <span class="recipe-meta-item">⭐ Beginner</span>
    <span class="recipe-meta-item">⏱ 5 min</span>
    <div class="stats">
      <span class="recipe-meta-item">👍 445</span>
      <span class="recipe-meta-item">💬 34</span>
      <span class="recipe-meta-item">📖 8.2k</span>
    </div>
  </div>
</div>

---

## Browse by Category

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 2rem 0;">
  <div style="padding: 1rem; border: 1px solid var(--vp-c-divider); border-radius: 8px;">
    <h4>🔐 Authentication</h4>
    <p style="color: var(--vp-c-text-2); font-size: 0.875rem;">8 recipes</p>
  </div>

  <div style="padding: 1rem; border: 1px solid var(--vp-c-divider); border-radius: 8px;">
    <h4>📝 Events</h4>
    <p style="color: var(--vp-c-text-2); font-size: 0.875rem;">12 recipes</p>
  </div>

  <div style="padding: 1rem; border: 1px solid var(--vp-c-divider); border-radius: 8px;">
    <h4>🌐 Relays</h4>
    <p style="color: var(--vp-c-text-2); font-size: 0.875rem;">6 recipes</p>
  </div>

  <div style="padding: 1rem; border: 1px solid var(--vp-c-divider); border-radius: 8px;">
    <h4>💰 Payments</h4>
    <p style="color: var(--vp-c-text-2); font-size: 0.875rem;">10 recipes</p>
  </div>

  <div style="padding: 1rem; border: 1px solid var(--vp-c-divider); border-radius: 8px;">
    <h4>🧪 Testing</h4>
    <p style="color: var(--vp-c-text-2); font-size: 0.875rem;">8 recipes</p>
  </div>

  <div style="padding: 1rem; border: 1px solid var(--vp-c-divider); border-radius: 8px;">
    <h4>📱 Mobile</h4>
    <p style="color: var(--vp-c-text-2); font-size: 0.875rem;">7 recipes</p>
  </div>
</div>

## Popular Tags

<div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 1.5rem 0;">
  <a href="#" class="tag">#ndk-core</a>
  <a href="#" class="tag">#svelte</a>
  <a href="#" class="tag">#authentication</a>
  <a href="#" class="tag">#events</a>
  <a href="#" class="tag">#relays</a>
  <a href="#" class="tag">#subscriptions</a>
  <a href="#" class="tag">#signers</a>
  <a href="#" class="tag">#zaps</a>
  <a href="#" class="tag">#cashu</a>
  <a href="#" class="tag">#nip-46</a>
  <a href="#" class="tag">#nip-07</a>
  <a href="#" class="tag">#outbox</a>
  <a href="#" class="tag">#cache</a>
  <a href="#" class="tag">#testing</a>
  <a href="#" class="tag">#mobile</a>
  <a href="#" class="tag">#profiles</a>
  <a href="#" class="tag">#reactions</a>
  <a href="#" class="tag">#dms</a>
  <a href="#" class="tag">#media</a>
  <a href="#" class="tag">#blossom</a>
</div>
