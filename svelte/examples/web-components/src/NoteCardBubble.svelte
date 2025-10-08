<svelte:options
  customElement={{
    tag: "nostr-note-card-bubble",
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

  const timeStr = $derived.by(() => {
    if (!note?.created_at) return "";
    return new Date(note.created_at * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

<div class="bubble-note" data-theme={theme}>
  {#if loading}
    <div class="loading">
      <div class="bubble-loading"></div>
    </div>
  {:else if note}
    <div class="message">
      <div class="avatar-wrapper">
        {#if profile?.image}
          <img src={profile.image} alt="" class="avatar" />
        {:else}
          <div class="avatar"></div>
        {/if}
      </div>
      <div class="bubble-wrapper">
        <div class="sender-name">{profile?.displayName || profile?.name || "Anonymous"}</div>
        <div class="bubble">
          <p class="text">{note.content}</p>
        </div>
        <div class="time">{timeStr}</div>
      </div>
    </div>
  {/if}
</div>

<style>
  :host {
    display: block;
    font-family: -apple-system, sans-serif;
  }

  .bubble-note {
    width: 100%;
    max-width: 500px;
    padding: 12px;
  }

  .loading {
    display: flex;
    padding: 20px;
  }

  .bubble-loading {
    width: 60px;
    height: 40px;
    background: #e5e7eb;
    border-radius: 20px;
    animation: pulse 1.5s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .message {
    display: flex;
    gap: 10px;
    align-items: flex-end;
  }

  .avatar-wrapper {
    flex-shrink: 0;
  }

  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
    background: #d1d5db;
  }

  .bubble-note[data-theme="dark"] .avatar {
    background: #4b5563;
  }

  .bubble-wrapper {
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-width: 80%;
  }

  .sender-name {
    font-size: 12px;
    color: #6b7280;
    padding-left: 12px;
  }

  .bubble-note[data-theme="dark"] .sender-name {
    color: #9ca3af;
  }

  .bubble {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    border-radius: 18px 18px 18px 4px;
    padding: 12px 16px;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  }

  .text {
    font-size: 15px;
    line-height: 1.5;
    color: white;
    margin: 0;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  .time {
    font-size: 11px;
    color: #9ca3af;
    padding-left: 12px;
  }

  .bubble-note[data-theme="dark"] .time {
    color: #6b7280;
  }
</style>
