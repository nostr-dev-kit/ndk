<svelte:options
  customElement={{
    tag: "nostr-note-card-chat",
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
    const date = new Date(note.created_at * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  });

  const initials = $derived.by(() => {
    const name = profile?.displayName || profile?.name;
    if (!name) return "?";
    return name[0].toUpperCase();
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

<div class="chat-note" data-theme={theme}>
  {#if loading}
    <div class="loading">
      <div class="typing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  {:else if note}
    <div class="message-container">
      <div class="message-row">
        <div class="avatar-container">
          {#if profile?.image}
            <img src={profile.image} alt="" class="avatar" />
          {:else}
            <div class="avatar placeholder">{initials}</div>
          {/if}
          <div class="online-indicator"></div>
        </div>

        <div class="message-content">
          <div class="message-header">
            <span class="name">{profile?.displayName || profile?.name || "Anonymous"}</span>
            <span class="time">{timeStr}</span>
          </div>
          <div class="message-bubble">
            <p class="text">{note.content}</p>
          </div>
          <div class="message-reactions">
            <button class="reaction-btn">👍</button>
            <button class="reaction-btn">❤️</button>
            <button class="reaction-btn">⚡</button>
            <button class="reaction-btn">➕</button>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  :host {
    display: block;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .chat-note {
    width: 100%;
    max-width: 600px;
    padding: 16px;
  }

  .chat-note[data-theme="light"] {
    background: #f0f2f5;
  }

  .chat-note[data-theme="dark"] {
    background: #18191a;
  }

  .loading {
    padding: 20px;
  }

  .typing-indicator {
    display: flex;
    gap: 4px;
    padding: 12px 16px;
    background: #e4e6eb;
    border-radius: 18px;
    width: fit-content;
  }

  .chat-note[data-theme="dark"] .typing-indicator {
    background: #3a3b3c;
  }

  .typing-indicator span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #8a8d91;
    animation: typing 1.4s infinite;
  }

  .typing-indicator span:nth-child(1) { animation-delay: 0s; }
  .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
  .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

  @keyframes typing {
    0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
    30% { opacity: 1; transform: translateY(-4px); }
  }

  .message-container {
    animation: slideIn 0.3s ease;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .message-row {
    display: flex;
    gap: 10px;
  }

  .avatar-container {
    position: relative;
    flex-shrink: 0;
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
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-size: 16px;
    font-weight: 600;
  }

  .online-indicator {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 12px;
    height: 12px;
    background: #31a24c;
    border: 2px solid #f0f2f5;
    border-radius: 50%;
  }

  .chat-note[data-theme="dark"] .online-indicator {
    border-color: #18191a;
  }

  .message-content {
    flex: 1;
    min-width: 0;
  }

  .message-header {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-bottom: 4px;
  }

  .name {
    font-size: 15px;
    font-weight: 600;
    color: #050505;
  }

  .chat-note[data-theme="dark"] .name {
    color: #e4e6eb;
  }

  .time {
    font-size: 12px;
    color: #65676b;
  }

  .chat-note[data-theme="dark"] .time {
    color: #b0b3b8;
  }

  .message-bubble {
    background: #e4e6eb;
    border-radius: 18px;
    padding: 10px 14px;
    width: fit-content;
    max-width: 100%;
  }

  .chat-note[data-theme="dark"] .message-bubble {
    background: #3a3b3c;
  }

  .text {
    font-size: 15px;
    line-height: 1.5;
    color: #050505;
    margin: 0;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  .chat-note[data-theme="dark"] .text {
    color: #e4e6eb;
  }

  .message-reactions {
    display: flex;
    gap: 4px;
    margin-top: 6px;
  }

  .reaction-btn {
    padding: 4px 8px;
    background: transparent;
    border: 1px solid #e4e6eb;
    border-radius: 12px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .chat-note[data-theme="dark"] .reaction-btn {
    border-color: #3a3b3c;
  }

  .reaction-btn:hover {
    background: #e4e6eb;
    transform: scale(1.1);
  }

  .chat-note[data-theme="dark"] .reaction-btn:hover {
    background: #3a3b3c;
  }
</style>
