<svelte:options
  customElement={{
    tag: "nostr-note-card-twitter",
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

  const formattedTime = $derived.by(() => {
    if (!note?.created_at) return "";
    const date = new Date(note.created_at * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
           ' · ' + date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
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

<div class="twitter-note" data-theme={theme}>
  {#if loading}
    <div class="loading">
      <div class="skeleton"></div>
    </div>
  {:else if note}
    <div class="tweet">
      <div class="header">
        {#if profile?.image}
          <img src={profile.image} alt="" class="avatar" />
        {:else}
          <div class="avatar placeholder"></div>
        {/if}
        <div class="user-info">
          <div class="row">
            <span class="display-name">{profile?.displayName || profile?.name || "Anonymous"}</span>
            {#if profile?.nip05}
              <svg class="verified" viewBox="0 0 24 24"><path fill="currentColor" d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z"/></svg>
            {/if}
            <span class="username">@{profile?.name || "anon"}</span>
          </div>
        </div>
        <button class="more-btn">
          <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
        </button>
      </div>

      <div class="content">{note.content}</div>

      <div class="timestamp">{formattedTime}</div>

      <div class="actions">
        <button class="action">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>
        </button>
        <button class="action">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>
        </button>
        <button class="action">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
        </button>
        <button class="action">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        </button>
        <button class="action">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
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

  .twitter-note {
    width: 100%;
    max-width: 600px;
  }

  .loading {
    padding: 20px;
  }

  .skeleton {
    height: 100px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    border-radius: 8px;
  }

  @keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  .tweet {
    background: white;
    border: 1px solid #eff3f4;
    border-radius: 16px;
    padding: 16px;
  }

  .twitter-note[data-theme="dark"] .tweet {
    background: #000;
    border-color: #2f3336;
  }

  .header {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
  }

  .avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
  }

  .avatar.placeholder {
    background: #e1e8ed;
  }

  .twitter-note[data-theme="dark"] .avatar.placeholder {
    background: #2f3336;
  }

  .user-info {
    flex: 1;
  }

  .row {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .display-name {
    font-size: 15px;
    font-weight: 700;
    color: #0f1419;
  }

  .twitter-note[data-theme="dark"] .display-name {
    color: #e7e9ea;
  }

  .verified {
    width: 20px;
    height: 20px;
    color: #1d9bf0;
  }

  .username {
    font-size: 15px;
    color: #536471;
  }

  .twitter-note[data-theme="dark"] .username {
    color: #71767b;
  }

  .more-btn {
    width: 36px;
    height: 36px;
    border: none;
    background: transparent;
    border-radius: 50%;
    color: #536471;
    cursor: pointer;
    transition: background 0.2s;
  }

  .more-btn:hover {
    background: #f7f9f9;
  }

  .twitter-note[data-theme="dark"] .more-btn:hover {
    background: #1e2732;
  }

  .more-btn svg {
    width: 18px;
    height: 18px;
  }

  .content {
    font-size: 15px;
    line-height: 1.5;
    color: #0f1419;
    margin-bottom: 12px;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  .twitter-note[data-theme="dark"] .content {
    color: #e7e9ea;
  }

  .timestamp {
    font-size: 15px;
    color: #536471;
    padding: 12px 0;
    border-top: 1px solid #eff3f4;
    border-bottom: 1px solid #eff3f4;
    margin-bottom: 12px;
  }

  .twitter-note[data-theme="dark"] .timestamp {
    color: #71767b;
    border-color: #2f3336;
  }

  .actions {
    display: flex;
    justify-content: space-around;
  }

  .action {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    border: none;
    background: transparent;
    color: #536471;
    cursor: pointer;
    border-radius: 50%;
    transition: all 0.2s;
  }

  .twitter-note[data-theme="dark"] .action {
    color: #71767b;
  }

  .action:hover {
    background: #f7f9f9;
  }

  .twitter-note[data-theme="dark"] .action:hover {
    background: #1e2732;
  }

  .action svg {
    width: 20px;
    height: 20px;
  }
</style>
