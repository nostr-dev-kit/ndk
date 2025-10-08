<svelte:options
  customElement={{
    tag: "nostr-note-card-polaroid",
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
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear().toString().slice(-2)}`;
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

<div class="polaroid-note" data-theme={theme}>
  {#if loading}
    <div class="polaroid">
      <div class="photo loading-photo"></div>
      <div class="caption">Developing...</div>
    </div>
  {:else if note}
    <div class="polaroid">
      <div class="photo">
        <div class="photo-content">
          <p class="note-text">{note.content}</p>
        </div>
      </div>
      <div class="caption">
        <div class="author-line">
          <span class="author-name">{profile?.displayName || profile?.name || "Anonymous"}</span>
        </div>
        <div class="date-line">{formattedDate}</div>
      </div>
    </div>
  {/if}
</div>

<style>
  :host {
    display: block;
    font-family: 'Kalam', 'Comic Sans MS', cursive;
  }

  .polaroid-note {
    width: 100%;
    max-width: 400px;
    padding: 20px;
    display: flex;
    justify-content: center;
  }

  .polaroid {
    background: #fff;
    padding: 16px 16px 60px;
    box-shadow:
      0 4px 8px rgba(0, 0, 0, 0.2),
      0 8px 20px rgba(0, 0, 0, 0.15);
    transform: rotate(-2deg);
    transition: transform 0.3s ease;
  }

  .polaroid:hover {
    transform: rotate(0deg) translateY(-4px);
    box-shadow:
      0 8px 16px rgba(0, 0, 0, 0.25),
      0 12px 30px rgba(0, 0, 0, 0.2);
  }

  .polaroid-note[data-theme="dark"] .polaroid {
    background: #1a1a1a;
  }

  .photo {
    width: 100%;
    aspect-ratio: 1;
    background: #f8f8f8;
    position: relative;
    overflow: hidden;
  }

  .polaroid-note[data-theme="dark"] .photo {
    background: #2a2a2a;
  }

  .loading-photo {
    background: linear-gradient(
      45deg,
      #e0e0e0 25%,
      #f0f0f0 25%,
      #f0f0f0 50%,
      #e0e0e0 50%,
      #e0e0e0 75%,
      #f0f0f0 75%
    );
    background-size: 20px 20px;
    animation: slide 1s linear infinite;
  }

  @keyframes slide {
    0% { background-position: 0 0; }
    100% { background-position: 20px 20px; }
  }

  .photo-content {
    width: 100%;
    height: 100%;
    padding: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);
  }

  .polaroid-note[data-theme="dark"] .photo-content {
    background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
  }

  .note-text {
    font-size: 16px;
    line-height: 1.6;
    color: #2d3436;
    text-align: center;
    margin: 0;
    white-space: pre-wrap;
    word-wrap: break-word;
    max-height: 100%;
    overflow-y: auto;
    font-family: 'Permanent Marker', 'Comic Sans MS', cursive;
  }

  .polaroid-note[data-theme="dark"] .note-text {
    color: #e2e8f0;
  }

  .caption {
    padding: 16px 8px 0;
    text-align: center;
  }

  .author-line {
    margin-bottom: 6px;
  }

  .author-name {
    font-size: 18px;
    color: #2c3e50;
    font-family: 'Permanent Marker', cursive;
  }

  .polaroid-note[data-theme="dark"] .author-name {
    color: #cbd5e1;
  }

  .date-line {
    font-size: 14px;
    color: #636e72;
    font-family: 'Courier New', monospace;
  }

  .polaroid-note[data-theme="dark"] .date-line {
    color: #94a3b8;
  }
</style>
