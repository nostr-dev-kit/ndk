<svelte:options
  customElement={{
    tag: "nostr-note-card-minimal",
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
  let error = $state<string | null>(null);

  const formattedDate = $derived.by(() => {
    if (!note?.created_at) return "";
    return new Date(note.created_at * 1000).toLocaleDateString();
  });

  const authorInitials = $derived.by(() => {
    const name = profile?.displayName || profile?.name;
    if (!name) return "??";
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

<div class="minimal-note" data-theme={theme}>
  {#if loading}
    <div class="loading">
      <div class="pulse"></div>
    </div>
  {:else if error}
    <div class="error">{error}</div>
  {:else if note}
    <div class="note">
      <div class="author">
        {#if profile?.image}
          <img src={profile.image} alt={profile.name || "User"} class="avatar" />
        {:else}
          <div class="avatar placeholder">{authorInitials}</div>
        {/if}
        <div class="info">
          <span class="name">{profile?.displayName || profile?.name || "Anonymous"}</span>
          <span class="date">{formattedDate}</span>
        </div>
      </div>
      <p class="content">{note.content}</p>
    </div>
  {/if}
</div>

<style>
  :host {
    display: block;
    font-family: system-ui, -apple-system, sans-serif;
  }

  .minimal-note {
    width: 100%;
    max-width: 550px;
  }

  .loading {
    padding: 40px;
    display: flex;
    justify-content: center;
  }

  .pulse {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #667eea;
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.3; transform: scale(0.8); }
    50% { opacity: 1; transform: scale(1); }
  }

  .error {
    padding: 20px;
    color: #ef4444;
    font-size: 14px;
  }

  .note {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 20px;
    transition: border-color 0.2s;
  }

  .minimal-note[data-theme="dark"] .note {
    background: #1e293b;
    border-color: #334155;
  }

  .note:hover {
    border-color: #cbd5e1;
  }

  .minimal-note[data-theme="dark"] .note:hover {
    border-color: #475569;
  }

  .author {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
  }

  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
  }

  .avatar.placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #e2e8f0;
    color: #64748b;
    font-size: 14px;
    font-weight: 600;
  }

  .minimal-note[data-theme="dark"] .avatar.placeholder {
    background: #334155;
    color: #cbd5e1;
  }

  .info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .name {
    font-size: 15px;
    font-weight: 600;
    color: #0f172a;
  }

  .minimal-note[data-theme="dark"] .name {
    color: white;
  }

  .date {
    font-size: 13px;
    color: #64748b;
  }

  .content {
    font-size: 15px;
    line-height: 1.6;
    color: #334155;
    margin: 0;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  .minimal-note[data-theme="dark"] .content {
    color: #cbd5e1;
  }
</style>
