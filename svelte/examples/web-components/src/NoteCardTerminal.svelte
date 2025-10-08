<svelte:options
  customElement={{
    tag: "nostr-note-card-terminal",
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

  const timestamp = $derived.by(() => {
    if (!note?.created_at) return "";
    const date = new Date(note.created_at * 1000);
    return `[${date.toISOString()}]`;
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

<div class="terminal-note" data-theme={theme}>
  {#if loading}
    <div class="terminal">
      <div class="terminal-header">
        <span class="terminal-title">nostr-cli</span>
        <div class="terminal-controls">
          <span class="dot yellow"></span>
          <span class="dot green"></span>
          <span class="dot red"></span>
        </div>
      </div>
      <div class="terminal-body">
        <p class="line">$ nostr fetch-note {noteId?.slice(0, 20)}...</p>
        <p class="line"><span class="cursor">▊</span></p>
      </div>
    </div>
  {:else if note}
    <div class="terminal">
      <div class="terminal-header">
        <span class="terminal-title">nostr-cli</span>
        <div class="terminal-controls">
          <span class="dot yellow"></span>
          <span class="dot green"></span>
          <span class="dot red"></span>
        </div>
      </div>
      <div class="terminal-body">
        <p class="line">$ nostr fetch-note {noteId?.slice(0, 20)}...</p>
        <p class="line success">✓ Connected to relays</p>
        <p class="line success">✓ Note retrieved</p>
        <p class="line">─────────────────────────────────────</p>
        <p class="line"><span class="prompt">author:</span> <span class="value">{profile?.name || "anonymous"}</span></p>
        <p class="line"><span class="prompt">timestamp:</span> <span class="value">{timestamp}</span></p>
        <p class="line"><span class="prompt">kind:</span> <span class="value">1</span></p>
        <p class="line">─────────────────────────────────────</p>
        <pre class="content">{note.content}</pre>
        <p class="line">─────────────────────────────────────</p>
        <p class="line">$ <span class="cursor">▊</span></p>
      </div>
    </div>
  {/if}
</div>

<style>
  :host {
    display: block;
    font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
  }

  .terminal-note {
    width: 100%;
    max-width: 700px;
  }

  .terminal {
    background: #1e1e1e;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  }

  .terminal-note[data-theme="light"] .terminal {
    background: #f5f5f5;
  }

  .terminal-header {
    background: #323232;
    padding: 12px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #444;
  }

  .terminal-note[data-theme="light"] .terminal-header {
    background: #e0e0e0;
    border-color: #ccc;
  }

  .terminal-title {
    font-size: 13px;
    color: #ccc;
  }

  .terminal-note[data-theme="light"] .terminal-title {
    color: #666;
  }

  .terminal-controls {
    display: flex;
    gap: 8px;
  }

  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }

  .dot.red { background: #ff5f56; }
  .dot.yellow { background: #ffbd2e; }
  .dot.green { background: #27c93f; }

  .terminal-body {
    padding: 20px;
    min-height: 200px;
  }

  .line {
    margin: 0 0 6px;
    font-size: 13px;
    color: #d4d4d4;
    line-height: 1.6;
  }

  .terminal-note[data-theme="light"] .line {
    color: #333;
  }

  .success {
    color: #4ec9b0;
  }

  .terminal-note[data-theme="light"] .success {
    color: #0e7c5f;
  }

  .prompt {
    color: #569cd6;
    font-weight: 600;
  }

  .terminal-note[data-theme="light"] .prompt {
    color: #0066cc;
  }

  .value {
    color: #ce9178;
  }

  .terminal-note[data-theme="light"] .value {
    color: #a31515;
  }

  .content {
    margin: 12px 0;
    padding: 12px;
    background: #2d2d2d;
    border-left: 3px solid #569cd6;
    color: #d4d4d4;
    font-size: 13px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  .terminal-note[data-theme="light"] .content {
    background: #fff;
    color: #333;
    border-color: #0066cc;
  }

  .cursor {
    color: #4ec9b0;
    animation: blink 1s step-end infinite;
  }

  .terminal-note[data-theme="light"] .cursor {
    color: #0e7c5f;
  }

  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }
</style>
