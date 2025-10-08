<svelte:options
  customElement={{
    tag: "nostr-note-card-glass",
    props: {
      noteId: { type: "String" },
      relays: { type: "String" },
      theme: { type: "String" },
    }
  }}
/>

<script lang="ts">
  import NDK, { NDKEvent, type NDKUserProfile } from "@nostr-dev-kit/ndk";
  import { onMount } from "svelte";

  interface Props {
    noteId?: string;
    relays?: string;
    theme?: "light" | "dark";
  }

  let { noteId = "", relays = "wss://relay.damus.io,wss://nos.lol", theme = "dark" }: Props = $props();

  let ndk: NDK;
  let note = $state<NDKEvent | null>(null);
  let profile = $state<NDKUserProfile | null>(null);
  let loading = $state(true);

  const timeAgo = $derived.by(() => {
    if (!note?.created_at) return "";
    const seconds = Math.floor(Date.now() / 1000 - note.created_at);
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  });

  async function loadNote() {
    if (!noteId) {
      loading = false;
      return;
    }

    try {
      const relayList = relays.split(",").map((r) => r.trim());
      ndk = new NDK({ explicitRelayUrls: relayList });
      await ndk.connect();

      const event = await ndk.fetchEvent(noteId);
      if (!event) {
        loading = false;
        return;
      }

      note = event;

      const author = ndk.getUser({ pubkey: event.pubkey });
      await author.fetchProfile();
      profile = author.profile || null;

      loading = false;
    } catch {
      loading = false;
    }
  }

  onMount(() => {
    loadNote();
  });
</script>

<div class="glass-note" data-theme={theme}>
  {#if loading}
    <div class="loading">
      <div class="glass-spinner"></div>
    </div>
  {:else if note}
    <div class="glass-card">
      <div class="background-blur"></div>

      <div class="header">
        {#if profile?.image}
          <img src={profile.image} alt="" class="avatar" />
        {:else}
          <div class="avatar placeholder"></div>
        {/if}
        <div class="author-info">
          <h4 class="author-name">{profile?.displayName || profile?.name || "Anonymous"}</h4>
          <p class="time">{timeAgo}</p>
        </div>
      </div>

      <div class="content">
        {note.content}
      </div>

      <div class="actions">
        <button class="glass-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
        <button class="glass-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
          </svg>
        </button>
        <button class="glass-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
        <button class="glass-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  :host {
    display: block;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .glass-note {
    width: 100%;
    max-width: 500px;
    padding: 20px;
  }

  .glass-note[data-theme="light"] {
    --bg: rgba(255, 255, 255, 0.7);
    --border: rgba(255, 255, 255, 0.8);
    --text: #1e293b;
    --text-secondary: #64748b;
  }

  .glass-note[data-theme="dark"] {
    --bg: rgba(15, 23, 42, 0.7);
    --border: rgba(255, 255, 255, 0.1);
    --text: #f1f5f9;
    --text-secondary: #94a3b8;
  }

  .loading {
    display: flex;
    justify-content: center;
    padding: 40px;
  }

  .glass-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--border);
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .glass-card {
    position: relative;
    background: var(--bg);
    backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid var(--border);
    border-radius: 24px;
    padding: 24px;
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    overflow: hidden;
  }

  .background-blur {
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle at center,
      rgba(139, 92, 246, 0.1) 0%,
      transparent 50%
    );
    animation: rotate 20s linear infinite;
    pointer-events: none;
  }

  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    position: relative;
  }

  .avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--border);
  }

  .avatar.placeholder {
    background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
  }

  .author-info {
    flex: 1;
  }

  .author-name {
    font-size: 16px;
    font-weight: 600;
    color: var(--text);
    margin: 0 0 4px;
  }

  .time {
    font-size: 13px;
    color: var(--text-secondary);
    margin: 0;
  }

  .content {
    font-size: 15px;
    line-height: 1.6;
    color: var(--text);
    margin-bottom: 16px;
    white-space: pre-wrap;
    word-wrap: break-word;
    position: relative;
  }

  .actions {
    display: flex;
    gap: 8px;
    padding-top: 12px;
    border-top: 1px solid var(--border);
    position: relative;
  }

  .glass-btn {
    flex: 1;
    padding: 10px;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid var(--border);
    border-radius: 12px;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .glass-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(139, 92, 246, 0.5);
    color: #8b5cf6;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
  }

  .glass-btn svg {
    width: 18px;
    height: 18px;
  }
</style>
