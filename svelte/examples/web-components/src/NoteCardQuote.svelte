<svelte:options
  customElement={{
    tag: "nostr-note-card-quote",
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

  const formattedDate = $derived.by(() => {
    if (!note?.created_at) return "";
    const date = new Date(note.created_at * 1000);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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

<div class="quote-note" data-theme={theme}>
  {#if loading}
    <div class="loading">
      <div class="loading-quote">"</div>
    </div>
  {:else if note}
    <blockquote class="quote-card">
      <div class="quote-mark open">"</div>

      <div class="quote-content">
        <p class="quote-text">{note.content}</p>
      </div>

      <div class="quote-mark close">"</div>

      <footer class="quote-footer">
        <div class="author-section">
          {#if profile?.image}
            <img src={profile.image} alt="" class="avatar" />
          {:else}
            <div class="avatar placeholder"></div>
          {/if}
          <div class="author-info">
            <cite class="author-name">{profile?.displayName || profile?.name || "Anonymous"}</cite>
            <time class="date">{formattedDate}</time>
          </div>
        </div>
      </footer>
    </blockquote>
  {/if}
</div>

<style>
  :host {
    display: block;
    font-family: 'Merriweather', Georgia, serif;
  }

  .quote-note {
    width: 100%;
    max-width: 600px;
    padding: 20px;
  }

  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 60px;
  }

  .loading-quote {
    font-size: 80px;
    color: #d1d5db;
    animation: fade 2s infinite;
  }

  @keyframes fade {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 1; }
  }

  .quote-card {
    position: relative;
    background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
    border-left: 4px solid #6366f1;
    border-radius: 8px;
    padding: 40px 32px 24px;
    margin: 0;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  }

  .quote-note[data-theme="dark"] .quote-card {
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    border-color: #818cf8;
  }

  .quote-mark {
    position: absolute;
    font-size: 120px;
    font-family: Georgia, serif;
    color: #6366f1;
    opacity: 0.15;
    line-height: 1;
    font-weight: 700;
  }

  .quote-note[data-theme="dark"] .quote-mark {
    color: #818cf8;
  }

  .quote-mark.open {
    top: 10px;
    left: 10px;
  }

  .quote-mark.close {
    bottom: -20px;
    right: 20px;
  }

  .quote-content {
    position: relative;
    z-index: 1;
    margin-bottom: 24px;
  }

  .quote-text {
    font-size: 20px;
    line-height: 1.8;
    color: #1f2937;
    margin: 0;
    font-style: italic;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  .quote-note[data-theme="dark"] .quote-text {
    color: #e5e7eb;
  }

  .quote-footer {
    position: relative;
    z-index: 1;
    padding-top: 20px;
    border-top: 2px solid #e5e7eb;
  }

  .quote-note[data-theme="dark"] .quote-footer {
    border-color: #374151;
  }

  .author-section {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #6366f1;
  }

  .quote-note[data-theme="dark"] .avatar {
    border-color: #818cf8;
  }

  .avatar.placeholder {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  }

  .author-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .author-name {
    font-size: 16px;
    font-weight: 600;
    color: #111827;
    font-style: normal;
  }

  .quote-note[data-theme="dark"] .author-name {
    color: #f9fafb;
  }

  .date {
    font-size: 13px;
    color: #6b7280;
    font-style: normal;
  }

  .quote-note[data-theme="dark"] .date {
    color: #9ca3af;
  }
</style>
