<svelte:options
  customElement={{
    tag: "nostr-note-card-paper",
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
    return new Date(note.created_at * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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

<div class="paper-note" data-theme={theme}>
  {#if loading}
    <div class="loading">Loading...</div>
  {:else if note}
    <div class="paper">
      <div class="paper-header">
        <div class="decorative-line"></div>
        <h3 class="title">Nostr Note</h3>
        <div class="decorative-line"></div>
      </div>

      <div class="author-section">
        <span class="label">From:</span>
        <span class="author">{profile?.displayName || profile?.name || "Anonymous"}</span>
      </div>

      <div class="date-section">
        <span class="label">Date:</span>
        <span class="date">{formattedDate}</span>
      </div>

      <div class="divider"></div>

      <div class="content">
        {note.content}
      </div>

      <div class="signature">
        — {profile?.name || "Anonymous"}
      </div>
    </div>
  {/if}
</div>

<style>
  :host {
    display: block;
    font-family: Georgia, 'Times New Roman', serif;
  }

  .paper-note {
    width: 100%;
    max-width: 550px;
    padding: 20px;
  }

  .loading {
    text-align: center;
    color: #8b7355;
    font-style: italic;
  }

  .paper {
    background: #fefcf0;
    background-image:
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 31px,
        #e6dcc8 31px,
        #e6dcc8 32px
      );
    border: 1px solid #d4c5a9;
    box-shadow:
      0 1px 3px rgba(0,0,0,0.1),
      0 10px 20px rgba(139, 115, 85, 0.1),
      inset 0 0 100px rgba(255, 253, 235, 0.5);
    padding: 40px 32px;
    position: relative;
  }

  .paper-note[data-theme="dark"] .paper {
    background: #2d2416;
    background-image:
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 31px,
        #3d341e 31px,
        #3d341e 32px
      );
    border-color: #5d4a2e;
  }

  .paper::before {
    content: '';
    position: absolute;
    left: 32px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: #f4a582;
    opacity: 0.3;
  }

  .paper-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
  }

  .decorative-line {
    flex: 1;
    height: 1px;
    background: linear-gradient(to right, transparent, #8b7355, transparent);
  }

  .title {
    font-size: 18px;
    font-weight: 400;
    color: #5d4a37;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 2px;
  }

  .paper-note[data-theme="dark"] .title {
    color: #d4c5a9;
  }

  .author-section,
  .date-section {
    margin-bottom: 8px;
    font-size: 14px;
  }

  .label {
    color: #8b7355;
    font-weight: 600;
    margin-right: 8px;
  }

  .author,
  .date {
    color: #5d4a37;
  }

  .paper-note[data-theme="dark"] .author,
  .paper-note[data-theme="dark"] .date {
    color: #d4c5a9;
  }

  .divider {
    height: 1px;
    background: linear-gradient(to right, transparent, #8b7355 50%, transparent);
    margin: 20px 0;
  }

  .content {
    font-size: 16px;
    line-height: 32px;
    color: #2d2416;
    text-align: justify;
    margin-bottom: 24px;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  .paper-note[data-theme="dark"] .content {
    color: #e6dcc8;
  }

  .signature {
    font-size: 18px;
    font-style: italic;
    color: #5d4a37;
    text-align: right;
    font-family: 'Brush Script MT', cursive, serif;
  }

  .paper-note[data-theme="dark"] .signature {
    color: #d4c5a9;
  }
</style>
