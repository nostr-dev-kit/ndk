<svelte:options
  customElement={{
    tag: "nostr-note-card-newspaper",
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
      weekday: 'long',
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

<div class="newspaper-note" data-theme={theme}>
  {#if loading}
    <div class="loading">Loading article...</div>
  {:else if note}
    <article class="article">
      <header class="article-header">
        <div class="masthead">
          <div class="ornament">❦</div>
          <h1 class="publication">The Nostr Times</h1>
          <div class="ornament">❦</div>
        </div>
        <div class="date-bar">{formattedDate}</div>
      </header>

      <div class="article-body">
        <div class="byline">
          By <span class="author">{profile?.displayName || profile?.name || "Anonymous Correspondent"}</span>
        </div>

        <div class="article-content">
          <p class="lead">{note.content}</p>
        </div>

        <div class="article-footer">
          <div class="line"></div>
          <div class="footer-ornament">✦</div>
        </div>
      </div>
    </article>
  {/if}
</div>

<style>
  :host {
    display: block;
    font-family: 'Playfair Display', Georgia, serif;
  }

  .newspaper-note {
    width: 100%;
    max-width: 650px;
    padding: 20px;
  }

  .loading {
    text-align: center;
    font-style: italic;
    color: #666;
    padding: 40px;
  }

  .article {
    background: #faf9f5;
    border: 2px solid #333;
    padding: 32px 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .newspaper-note[data-theme="dark"] .article {
    background: #1a1816;
    border-color: #d4c5a9;
  }

  .article-header {
    border-bottom: 4px double #333;
    padding-bottom: 16px;
    margin-bottom: 24px;
  }

  .newspaper-note[data-theme="dark"] .article-header {
    border-color: #d4c5a9;
  }

  .masthead {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin-bottom: 8px;
  }

  .ornament {
    font-size: 20px;
    color: #8b7355;
  }

  .newspaper-note[data-theme="dark"] .ornament {
    color: #d4c5a9;
  }

  .publication {
    font-size: 36px;
    font-weight: 900;
    margin: 0;
    color: #1a1a1a;
    text-transform: uppercase;
    letter-spacing: 2px;
    font-family: 'Playfair Display', serif;
  }

  .newspaper-note[data-theme="dark"] .publication {
    color: #faf9f5;
  }

  .date-bar {
    text-align: center;
    font-size: 13px;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-family: 'Courier New', monospace;
  }

  .newspaper-note[data-theme="dark"] .date-bar {
    color: #a69988;
  }

  .article-body {
    column-count: 1;
  }

  .byline {
    font-size: 14px;
    font-style: italic;
    color: #666;
    margin-bottom: 16px;
    text-align: left;
    border-left: 3px solid #8b7355;
    padding-left: 12px;
  }

  .newspaper-note[data-theme="dark"] .byline {
    color: #a69988;
    border-color: #d4c5a9;
  }

  .author {
    font-weight: 600;
    color: #333;
  }

  .newspaper-note[data-theme="dark"] .author {
    color: #d4c5a9;
  }

  .article-content {
    margin-bottom: 24px;
  }

  .lead {
    font-size: 17px;
    line-height: 1.8;
    color: #2a2a2a;
    text-align: justify;
    text-indent: 2em;
    margin: 0;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  .newspaper-note[data-theme="dark"] .lead {
    color: #e6dcc8;
  }

  .article-footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .line {
    width: 100%;
    height: 1px;
    background: linear-gradient(to right,
      transparent,
      #333 20%,
      #333 80%,
      transparent
    );
  }

  .newspaper-note[data-theme="dark"] .line {
    background: linear-gradient(to right,
      transparent,
      #d4c5a9 20%,
      #d4c5a9 80%,
      transparent
    );
  }

  .footer-ornament {
    font-size: 16px;
    color: #8b7355;
  }

  .newspaper-note[data-theme="dark"] .footer-ornament {
    color: #d4c5a9;
  }
</style>
