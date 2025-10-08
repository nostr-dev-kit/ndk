<svelte:options
  customElement={{
    tag: "nostr-note-card-timeline",
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

  const timeInfo = $derived.by(() => {
    if (!note?.created_at) return { time: "", date: "" };
    const d = new Date(note.created_at * 1000);
    return {
      time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
  });

  const initials = $derived.by(() => {
    const name = profile?.displayName || profile?.name;
    if (!name) return "?";
    const words = name.split(" ");
    if (words.length > 1) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
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

<div class="timeline-note" data-theme={theme}>
  {#if loading}
    <div class="timeline-item">
      <div class="timeline-marker">
        <div class="timeline-dot loading"></div>
        <div class="timeline-line"></div>
      </div>
      <div class="timeline-content">
        <div class="loading-text">Loading event...</div>
      </div>
    </div>
  {:else if note}
    <div class="timeline-item">
      <div class="timeline-marker">
        <div class="timeline-dot">
          {#if profile?.image}
            <img src={profile.image} alt="" class="dot-avatar" />
          {:else}
            <div class="dot-avatar placeholder">{initials}</div>
          {/if}
        </div>
        <div class="timeline-line"></div>
      </div>

      <div class="timeline-content">
        <div class="event-card">
          <div class="event-header">
            <div class="event-info">
              <h4 class="author">{profile?.displayName || profile?.name || "Anonymous"}</h4>
              {#if profile?.nip05}
                <span class="verified-badge">✓</span>
              {/if}
            </div>
            <div class="event-time">
              <div class="time">{timeInfo.time}</div>
              <div class="date">{timeInfo.date}</div>
            </div>
          </div>

          <div class="event-body">
            <p class="event-text">{note.content}</p>
          </div>

          <div class="event-actions">
            <button class="action-icon" title="Reply">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </button>
            <button class="action-icon" title="Repost">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
            </button>
            <button class="action-icon" title="Like">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
              </svg>
            </button>
            <button class="action-icon" title="Zap">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" />
              </svg>
            </button>
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

  .timeline-note {
    width: 100%;
    max-width: 650px;
    padding: 0 20px;
  }

  .timeline-item {
    display: flex;
    gap: 20px;
  }

  .timeline-marker {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
  }

  .timeline-dot {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    border: 3px solid white;
    box-shadow: 0 0 0 2px #3b82f6;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 1;
  }

  .timeline-note[data-theme="dark"] .timeline-dot {
    border-color: #0f172a;
  }

  .timeline-dot.loading {
    animation: pulse-ring 2s infinite;
  }

  @keyframes pulse-ring {
    0% { box-shadow: 0 0 0 2px #3b82f6; }
    50% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.3); }
    100% { box-shadow: 0 0 0 2px #3b82f6; }
  }

  .dot-avatar {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }

  .dot-avatar.placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 16px;
    font-weight: 700;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  }

  .timeline-line {
    width: 2px;
    flex: 1;
    background: linear-gradient(to bottom,
      #3b82f6,
      #93c5fd
    );
    min-height: 40px;
  }

  .timeline-note[data-theme="dark"] .timeline-line {
    background: linear-gradient(to bottom,
      #3b82f6,
      #1e293b
    );
  }

  .timeline-content {
    flex: 1;
    padding-bottom: 32px;
  }

  .loading-text {
    padding: 20px;
    color: #94a3b8;
    font-style: italic;
  }

  .event-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
  }

  .timeline-note[data-theme="dark"] .event-card {
    background: #1e293b;
    border-color: #334155;
  }

  .event-card:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    transform: translateX(4px);
  }

  .event-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
  }

  .event-info {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .author {
    font-size: 16px;
    font-weight: 600;
    color: #111827;
    margin: 0;
  }

  .timeline-note[data-theme="dark"] .author {
    color: #f9fafb;
  }

  .verified-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    background: #3b82f6;
    color: white;
    border-radius: 50%;
    font-size: 12px;
  }

  .event-time {
    text-align: right;
  }

  .time {
    font-size: 14px;
    font-weight: 600;
    color: #3b82f6;
  }

  .date {
    font-size: 12px;
    color: #6b7280;
  }

  .timeline-note[data-theme="dark"] .date {
    color: #9ca3af;
  }

  .event-body {
    margin-bottom: 16px;
  }

  .event-text {
    font-size: 15px;
    line-height: 1.6;
    color: #374151;
    margin: 0;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  .timeline-note[data-theme="dark"] .event-text {
    color: #d1d5db;
  }

  .event-actions {
    display: flex;
    gap: 12px;
    padding-top: 12px;
    border-top: 1px solid #f3f4f6;
  }

  .timeline-note[data-theme="dark"] .event-actions {
    border-color: #374151;
  }

  .action-icon {
    padding: 8px;
    background: transparent;
    border: none;
    color: #9ca3af;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.2s;
  }

  .action-icon:hover {
    background: #f3f4f6;
    color: #3b82f6;
  }

  .timeline-note[data-theme="dark"] .action-icon:hover {
    background: #334155;
  }

  .action-icon svg {
    width: 18px;
    height: 18px;
  }
</style>
