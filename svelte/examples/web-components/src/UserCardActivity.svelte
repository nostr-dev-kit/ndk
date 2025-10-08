<svelte:options
  customElement={{
    tag: "nostr-user-card-activity",
    props: {
      npub: { type: "String" },
      relays: { type: "String" },
      theme: { type: "String" },
    }
  }}
/>

<script lang="ts">
  import NDK, { type NDKUserProfile, type NDKEvent } from "@nostr-dev-kit/ndk";
  import { onMount } from "svelte";

  interface Props {
    npub?: string;
    relays?: string;
    theme?: "light" | "dark";
  }

  let { npub = "", relays = "wss://relay.damus.io,wss://nos.lol", theme = "dark" }: Props = $props();

  let ndk: NDK;
  let profile = $state<NDKUserProfile | null>(null);
  let recentNotes = $state<NDKEvent[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);

  function formatTimeAgo(timestamp: number): string {
    const seconds = Math.floor((Date.now() / 1000) - timestamp);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  }

  async function loadProfile() {
    if (!npub) {
      error = "No npub provided";
      loading = false;
      return;
    }

    try {
      const relayList = relays.split(",").map((r) => r.trim());
      ndk = new NDK({ explicitRelayUrls: relayList });
      await ndk.connect();

      const user = ndk.getUser(npub);
      await user.fetchProfile();
      profile = user.profile || null;

      const notes = await ndk.fetchEvents({
        kinds: [1],
        authors: [user.pubkey],
        limit: 3,
      });

      recentNotes = Array.from(notes).sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
      loading = false;
    } catch (e) {
      error = e instanceof Error ? e.message : "Failed to load profile";
      loading = false;
    }
  }

  onMount(() => {
    loadProfile();
  });
</script>

<div class="activity-card" data-theme={theme}>
  {#if loading}
    <div class="loading">
      <div class="pulse"></div>
      <p>Loading activity...</p>
    </div>
  {:else if error}
    <div class="error">{error}</div>
  {:else if profile}
    <div class="card">
      <div class="header">
        <div class="user-info">
          {#if profile.image}
            <img src={profile.image} alt={profile.name || "User"} class="avatar" />
          {:else}
            <div class="avatar placeholder">
              {(profile.displayName || profile.name || "?")[0].toUpperCase()}
            </div>
          {/if}
          <div class="names">
            {#if profile.displayName}
              <h3>{profile.displayName}</h3>
            {/if}
            {#if profile.name}
              <p class="handle">@{profile.name}</p>
            {/if}
          </div>
        </div>
        {#if profile.nip05}
          <div class="verified-badge" title="Verified">✓</div>
        {/if}
      </div>

      {#if profile.about}
        <p class="bio">{profile.about}</p>
      {/if}

      <div class="activity-header">
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
        </svg>
        <span>Recent Activity</span>
      </div>

      <div class="notes">
        {#if recentNotes.length === 0}
          <div class="no-notes">No recent notes</div>
        {:else}
          {#each recentNotes as note}
            <div class="note">
              <div class="note-header">
                <span class="time">{formatTimeAgo(note.created_at || 0)}</span>
              </div>
              <p class="note-content">{note.content}</p>
              <div class="note-footer">
                <button class="action">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                </button>
                <button class="action">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                    <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                  </svg>
                </button>
                <button class="action">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              </div>
            </div>
          {/each}
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  :host {
    display: block;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }

  .activity-card {
    width: 100%;
    max-width: 400px;
  }

  .loading {
    padding: 60px 20px;
    text-align: center;
    color: #64748b;
  }

  .pulse {
    width: 48px;
    height: 48px;
    margin: 0 auto 16px;
    border-radius: 50%;
    background: #667eea;
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.9); }
  }

  .error {
    padding: 20px;
    color: #ef4444;
    text-align: center;
  }

  .card {
    background: white;
    border-radius: 20px;
    padding: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }

  .activity-card[data-theme="dark"] .card {
    background: #1e293b;
    color: white;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
  }

  .user-info {
    display: flex;
    gap: 12px;
  }

  .avatar {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }

  .avatar.placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
    color: white;
    font-size: 24px;
    font-weight: 600;
  }

  .names h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: #0f172a;
  }

  .activity-card[data-theme="dark"] .names h3 {
    color: white;
  }

  .handle {
    margin: 2px 0 0;
    font-size: 14px;
    color: #64748b;
  }

  .verified-badge {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #10b981;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: bold;
    flex-shrink: 0;
  }

  .bio {
    font-size: 14px;
    line-height: 1.5;
    color: #475569;
    margin: 0 0 20px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .activity-card[data-theme="dark"] .bio {
    color: #cbd5e1;
  }

  .activity-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    color: #475569;
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 2px solid #f1f5f9;
  }

  .activity-card[data-theme="dark"] .activity-header {
    color: #cbd5e1;
    border-color: #334155;
  }

  .activity-header svg {
    width: 16px;
    height: 16px;
  }

  .notes {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .no-notes {
    text-align: center;
    padding: 32px;
    color: #94a3b8;
    font-size: 14px;
  }

  .note {
    background: #f8fafc;
    border-radius: 12px;
    padding: 12px;
    transition: background 0.2s ease;
  }

  .activity-card[data-theme="dark"] .note {
    background: #0f172a;
  }

  .note:hover {
    background: #f1f5f9;
  }

  .activity-card[data-theme="dark"] .note:hover {
    background: #1e293b;
  }

  .note-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .time {
    font-size: 12px;
    color: #94a3b8;
    font-weight: 500;
  }

  .note-content {
    font-size: 14px;
    line-height: 1.5;
    color: #334155;
    margin: 0 0 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  }

  .activity-card[data-theme="dark"] .note-content {
    color: #e2e8f0;
  }

  .note-footer {
    display: flex;
    gap: 16px;
  }

  .action {
    background: none;
    border: none;
    padding: 4px;
    cursor: pointer;
    color: #94a3b8;
    transition: color 0.2s ease;
  }

  .action:hover {
    color: #667eea;
  }

  .action svg {
    width: 16px;
    height: 16px;
  }
</style>
