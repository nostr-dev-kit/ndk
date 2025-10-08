<svelte:options
  customElement={{
    tag: "nostr-note-card-neon",
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
    return date.toISOString().slice(0, 19).replace('T', ' ');
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

<div class="neon-note" data-theme={theme}>
  {#if loading}
    <div class="loading">
      <div class="neon-loading">⚡ LOADING ⚡</div>
    </div>
  {:else if note}
    <div class="cyber-card">
      <div class="corner top-left"></div>
      <div class="corner top-right"></div>
      <div class="corner bottom-left"></div>
      <div class="corner bottom-right"></div>

      <div class="header">
        <div class="status-bar">
          <span class="status-indicator"></span>
          <span class="status-text">TRANSMISSION RECEIVED</span>
        </div>
        <div class="author-bar">
          <span class="label">FROM:</span>
          <span class="author">{profile?.name?.toUpperCase() || "ANONYMOUS"}</span>
        </div>
        <div class="time-bar">
          <span class="label">TIME:</span>
          <span class="time">{timestamp}</span>
        </div>
      </div>

      <div class="divider"></div>

      <div class="content">
        {note.content}
      </div>

      <div class="footer">
        <div class="action-bar">
          <button class="cyber-btn">REPLY</button>
          <button class="cyber-btn">BOOST</button>
          <button class="cyber-btn">ZAP</button>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  :host {
    display: block;
    font-family: 'Courier New', monospace;
  }

  .neon-note {
    width: 100%;
    max-width: 600px;
    padding: 20px;
    background: #0a0e27;
  }

  .loading {
    text-align: center;
    padding: 40px;
  }

  .neon-loading {
    color: #0ff;
    font-size: 18px;
    font-weight: 700;
    text-shadow:
      0 0 10px #0ff,
      0 0 20px #0ff,
      0 0 30px #0ff;
    animation: flicker 2s infinite;
  }

  @keyframes flicker {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
  }

  .cyber-card {
    background: #0a0e27;
    border: 2px solid #0ff;
    box-shadow:
      0 0 20px rgba(0, 255, 255, 0.5),
      inset 0 0 20px rgba(0, 255, 255, 0.1);
    padding: 24px;
    position: relative;
  }

  .corner {
    position: absolute;
    width: 12px;
    height: 12px;
    border: 2px solid #f0f;
  }

  .top-left {
    top: -2px;
    left: -2px;
    border-right: none;
    border-bottom: none;
  }

  .top-right {
    top: -2px;
    right: -2px;
    border-left: none;
    border-bottom: none;
  }

  .bottom-left {
    bottom: -2px;
    left: -2px;
    border-right: none;
    border-top: none;
  }

  .bottom-right {
    bottom: -2px;
    right: -2px;
    border-left: none;
    border-top: none;
  }

  .header {
    margin-bottom: 16px;
  }

  .status-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }

  .status-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #0f0;
    box-shadow: 0 0 10px #0f0;
    animation: pulse-glow 2s infinite;
  }

  @keyframes pulse-glow {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .status-text {
    color: #0f0;
    font-size: 11px;
    letter-spacing: 2px;
    text-shadow: 0 0 10px #0f0;
  }

  .author-bar,
  .time-bar {
    display: flex;
    gap: 8px;
    margin-bottom: 6px;
  }

  .label {
    color: #f0f;
    font-size: 13px;
    font-weight: 700;
    text-shadow: 0 0 10px #f0f;
  }

  .author,
  .time {
    color: #0ff;
    font-size: 13px;
    text-shadow: 0 0 10px #0ff;
  }

  .divider {
    height: 1px;
    background: linear-gradient(to right,
      transparent,
      #0ff 20%,
      #f0f 50%,
      #0ff 80%,
      transparent
    );
    margin: 16px 0;
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
  }

  .content {
    color: #fff;
    font-size: 14px;
    line-height: 1.8;
    margin-bottom: 16px;
    white-space: pre-wrap;
    word-wrap: break-word;
    text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
  }

  .footer {
    border-top: 1px solid rgba(0, 255, 255, 0.3);
    padding-top: 16px;
  }

  .action-bar {
    display: flex;
    gap: 12px;
  }

  .cyber-btn {
    flex: 1;
    padding: 10px;
    background: transparent;
    border: 1px solid #0ff;
    color: #0ff;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 1px;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
  }

  .cyber-btn:hover {
    background: rgba(0, 255, 255, 0.1);
    box-shadow:
      0 0 20px rgba(0, 255, 255, 0.6),
      inset 0 0 10px rgba(0, 255, 255, 0.2);
    transform: translateY(-2px);
  }

  .cyber-btn:active {
    transform: translateY(0);
  }
</style>
