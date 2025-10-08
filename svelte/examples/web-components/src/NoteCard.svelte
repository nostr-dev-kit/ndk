<svelte:options
  customElement={{
    tag: "nostr-note-card",
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
  let error = $state<string | null>(null);

  const timeAgo = $derived.by(() => {
    if (!note?.created_at) return "";
    const seconds = Math.floor(Date.now() / 1000 - note.created_at);
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  });

  const authorInitials = $derived.by(() => {
    const name = profile?.displayName || profile?.name;
    if (!name) return "??";
    const words = name.split(" ");
    if (words.length > 1) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  });

  async function loadNote() {
    if (!noteId) {
      error = "No note ID provided";
      loading = false;
      return;
    }

    try {
      const relayList = relays.split(",").map((r) => r.trim());
      ndk = new NDK({ explicitRelayUrls: relayList });
      await ndk.connect();

      const event = await ndk.fetchEvent(noteId);
      if (!event) {
        error = "Note not found";
        loading = false;
        return;
      }

      note = event;

      const author = ndk.getUser({ pubkey: event.pubkey });
      await author.fetchProfile();
      profile = author.profile || null;

      loading = false;
    } catch (e) {
      error = e instanceof Error ? e.message : "Failed to load note";
      loading = false;
    }
  }

  onMount(() => {
    loadNote();
  });
</script>

<div class="nostr-note-card" data-theme={theme}>
  {#if loading}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Loading note...</p>
    </div>
  {:else if error}
    <div class="error-state">
      <div class="error-icon">⚠️</div>
      <p>{error}</p>
    </div>
  {:else if note}
    <div class="card-content">
      <div class="header">
        <div class="author-info">
          {#if profile?.image}
            <img src={profile.image} alt={profile.name || "User"} class="avatar" />
          {:else}
            <div class="avatar placeholder">{authorInitials}</div>
          {/if}
          <div class="author-details">
            <div class="author-name">
              {profile?.displayName || profile?.name || "Anonymous"}
              {#if profile?.nip05}
                <svg class="verified" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              {/if}
            </div>
            <div class="timestamp">{timeAgo} ago</div>
          </div>
        </div>
      </div>

      <div class="content">
        {note.content}
      </div>

      <div class="actions">
        <button class="action-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Reply
        </button>
        <button class="action-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
          </svg>
          Repost
        </button>
        <button class="action-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          Like
        </button>
        <button class="action-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Zap
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  :host {
    display: block;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }

  .nostr-note-card {
    width: 100%;
    max-width: 600px;
    border-radius: 20px;
    overflow: hidden;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .nostr-note-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
  }

  .nostr-note-card[data-theme="light"] {
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  }

  .loading-state,
  .error-state {
    padding: 60px 40px;
    text-align: center;
    color: white;
  }

  .nostr-note-card[data-theme="light"] .loading-state,
  .nostr-note-card[data-theme="light"] .error-state {
    color: #334155;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 12px;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .error-icon {
    font-size: 40px;
    margin-bottom: 8px;
  }

  .card-content {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    border-radius: 20px;
    padding: 24px;
  }

  .nostr-note-card[data-theme="light"] .card-content {
    background: rgba(255, 255, 255, 0.8);
  }

  .header {
    margin-bottom: 16px;
  }

  .author-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid rgba(255, 255, 255, 0.2);
  }

  .avatar.placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-size: 16px;
    font-weight: 600;
  }

  .author-details {
    flex: 1;
  }

  .author-name {
    font-size: 16px;
    font-weight: 600;
    color: white;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .nostr-note-card[data-theme="light"] .author-name {
    color: #1e293b;
  }

  .verified {
    width: 18px;
    height: 18px;
    color: #10b981;
  }

  .timestamp {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
  }

  .nostr-note-card[data-theme="light"] .timestamp {
    color: #64748b;
  }

  .content {
    font-size: 15px;
    line-height: 1.6;
    color: white;
    margin-bottom: 16px;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  .nostr-note-card[data-theme="light"] .content {
    color: #334155;
  }

  .actions {
    display: flex;
    gap: 12px;
    padding-top: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .nostr-note-card[data-theme="light"] .actions {
    border-color: rgba(0, 0, 0, 0.1);
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 8px;
    color: white;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .nostr-note-card[data-theme="light"] .action-btn {
    background: rgba(0, 0, 0, 0.05);
    color: #475569;
  }

  .action-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }

  .nostr-note-card[data-theme="light"] .action-btn:hover {
    background: rgba(0, 0, 0, 0.1);
  }

  .action-btn svg {
    width: 16px;
    height: 16px;
  }
</style>
