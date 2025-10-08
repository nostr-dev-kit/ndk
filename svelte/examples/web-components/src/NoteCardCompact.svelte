<svelte:options
  customElement={{
    tag: "nostr-note-card-compact",
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

  let { noteId = "", relays = "wss://relay.damus.io,wss://nos.lol", theme = "light" }: Props = $props();

  let ndk: NDK;
  let note = $state<NDKEvent | null>(null);
  let profile = $state<NDKUserProfile | null>(null);
  let loading = $state(true);

  const timeAgo = $derived.by(() => {
    if (!note?.created_at) return "";
    const seconds = Math.floor(Date.now() / 1000 - note.created_at);
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
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

<div class="compact-note" data-theme={theme}>
  {#if loading}
    <div class="loading">...</div>
  {:else if note}
    <div class="note">
      {#if profile?.image}
        <img src={profile.image} alt="" class="avatar" />
      {:else}
        <div class="avatar"></div>
      {/if}
      <div class="body">
        <div class="header">
          <span class="name">{profile?.name || "anon"}</span>
          <span class="time">{timeAgo}</span>
        </div>
        <p class="text">{note.content}</p>
        <div class="stats">
          <span>💬 0</span>
          <span>🔁 0</span>
          <span>❤️ 0</span>
          <span>⚡ 0</span>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  :host {
    display: block;
    font-family: -apple-system, sans-serif;
  }

  .compact-note {
    width: 100%;
    max-width: 500px;
  }

  .loading {
    padding: 12px;
    text-align: center;
    color: #94a3b8;
  }

  .note {
    display: flex;
    gap: 10px;
    padding: 12px;
    background: white;
    border-bottom: 1px solid #f1f5f9;
    transition: background 0.2s;
  }

  .compact-note[data-theme="dark"] .note {
    background: #0f172a;
    border-color: #1e293b;
  }

  .note:hover {
    background: #f8fafc;
  }

  .compact-note[data-theme="dark"] .note:hover {
    background: #1e293b;
  }

  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
    background: #e2e8f0;
    flex-shrink: 0;
  }

  .compact-note[data-theme="dark"] .avatar {
    background: #334155;
  }

  .body {
    flex: 1;
    min-width: 0;
  }

  .header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }

  .name {
    font-size: 14px;
    font-weight: 600;
    color: #0f172a;
  }

  .compact-note[data-theme="dark"] .name {
    color: white;
  }

  .time {
    font-size: 13px;
    color: #94a3b8;
  }

  .text {
    font-size: 14px;
    line-height: 1.5;
    color: #334155;
    margin: 0 0 6px;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  .compact-note[data-theme="dark"] .text {
    color: #cbd5e1;
  }

  .stats {
    display: flex;
    gap: 16px;
    font-size: 12px;
    color: #64748b;
  }

  .stats span {
    cursor: pointer;
    transition: color 0.2s;
  }

  .stats span:hover {
    color: #3b82f6;
  }
</style>
