<svelte:options
  customElement={{
    tag: "nostr-user-card-interactive",
    props: {
      npub: { type: "String" },
      relays: { type: "String" },
    }
  }}
/>

<script lang="ts">
  import NDK, { type NDKUserProfile, type NDKEvent } from "@nostr-dev-kit/ndk";
  import { onMount } from "svelte";

  interface Props {
    npub?: string;
    relays?: string;
  }

  let { npub = "", relays = "wss://relay.damus.io,wss://nos.lol" }: Props = $props();

  let ndk: NDK;
  let profile = $state<NDKUserProfile | null>(null);
  let recentNotes = $state<NDKEvent[]>([]);
  let mediaEvents = $state<NDKEvent[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let activeTab = $state<"profile" | "notes" | "media" | "zaps">("profile");

  const extractImages = (content: string): string[] => {
    const urlRegex = /(https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp))/gi;
    return content.match(urlRegex) || [];
  };

  function formatTimeAgo(timestamp: number): string {
    const seconds = Math.floor((Date.now() / 1000) - timestamp);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
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
        limit: 10,
      });

      recentNotes = Array.from(notes).sort((a, b) => (b.created_at || 0) - (a.created_at || 0));

      mediaEvents = recentNotes.filter(note => extractImages(note.content).length > 0).slice(0, 9);

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

<div class="interactive-card">
  {#if loading}
    <div class="loading">
      <div class="loading-spinner">
        <div class="spinner-segment"></div>
        <div class="spinner-segment"></div>
        <div class="spinner-segment"></div>
        <div class="spinner-segment"></div>
      </div>
      <p>Loading...</p>
    </div>
  {:else if error}
    <div class="error">{error}</div>
  {:else if profile}
    <div class="card">
      <!-- Header -->
      <div class="header">
        <div class="cover">
          {#if profile.banner}
            <img src={profile.banner} alt="Banner" />
          {:else}
            <div class="cover-gradient"></div>
          {/if}
        </div>
        <div class="header-content">
          {#if profile.image}
            <img src={profile.image} alt={profile.name || "User"} class="avatar" />
          {:else}
            <div class="avatar placeholder">
              {(profile.displayName || profile.name || "?")[0].toUpperCase()}
            </div>
          {/if}
          <div class="header-info">
            {#if profile.displayName}
              <h3>{profile.displayName}</h3>
            {/if}
            {#if profile.name}
              <p class="handle">@{profile.name}</p>
            {/if}
          </div>
          {#if profile.nip05}
            <div class="verified">✓</div>
          {/if}
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button
          class="tab"
          class:active={activeTab === "profile"}
          onclick={() => activeTab = "profile"}>
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
          </svg>
          Profile
        </button>
        <button
          class="tab"
          class:active={activeTab === "notes"}
          onclick={() => activeTab = "notes"}>
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
            <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
          </svg>
          Notes
        </button>
        <button
          class="tab"
          class:active={activeTab === "media"}
          onclick={() => activeTab = "media"}>
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
          </svg>
          Media
        </button>
        <button
          class="tab"
          class:active={activeTab === "zaps"}
          onclick={() => activeTab = "zaps"}>
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
          </svg>
          Zaps
        </button>
      </div>

      <!-- Content -->
      <div class="content">
        {#if activeTab === "profile"}
          <div class="profile-view">
            {#if profile.about}
              <div class="section">
                <h4>About</h4>
                <p>{profile.about}</p>
              </div>
            {/if}

            <div class="stats-row">
              <div class="stat-card">
                <div class="stat-icon">👥</div>
                <div class="stat-details">
                  <div class="stat-number">{profile.followersCount || 0}</div>
                  <div class="stat-label">Followers</div>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">🔗</div>
                <div class="stat-details">
                  <div class="stat-number">{profile.followsCount || 0}</div>
                  <div class="stat-label">Following</div>
                </div>
              </div>
            </div>

            {#if profile.website || profile.lud16}
              <div class="section">
                <h4>Contact</h4>
                <div class="contact-list">
                  {#if profile.website}
                    <a href={profile.website} target="_blank" class="contact-item">
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clip-rule="evenodd" />
                      </svg>
                      {profile.website}
                    </a>
                  {/if}
                  {#if profile.lud16}
                    <div class="contact-item">
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd" />
                      </svg>
                      {profile.lud16}
                    </div>
                  {/if}
                </div>
              </div>
            {/if}
          </div>
        {:else if activeTab === "notes"}
          <div class="notes-view">
            {#if recentNotes.length === 0}
              <div class="empty-state">No notes yet</div>
            {:else}
              {#each recentNotes.slice(0, 5) as note}
                <div class="note-item">
                  <div class="note-time">{formatTimeAgo(note.created_at || 0)}</div>
                  <p class="note-text">{note.content}</p>
                </div>
              {/each}
            {/if}
          </div>
        {:else if activeTab === "media"}
          <div class="media-view">
            {#if mediaEvents.length === 0}
              <div class="empty-state">No media yet</div>
            {:else}
              <div class="media-grid">
                {#each mediaEvents as event}
                  {#each extractImages(event.content) as imageUrl}
                    <div class="media-item">
                      <img src={imageUrl} alt="Media" />
                    </div>
                  {/each}
                {/each}
              </div>
            {/if}
          </div>
        {:else if activeTab === "zaps"}
          <div class="zaps-view">
            <div class="empty-state">
              <div class="empty-icon">⚡</div>
              <p>Zap activity coming soon</p>
            </div>
          </div>
        {/if}
      </div>

      <!-- Action Button -->
      <div class="action-bar">
        <button class="primary-button">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
          </svg>
          Follow
        </button>
        <button class="secondary-button">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clip-rule="evenodd" />
          </svg>
          Message
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  :host {
    display: block;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }

  .interactive-card {
    width: 100%;
    max-width: 480px;
  }

  .loading {
    padding: 80px 20px;
    text-align: center;
    color: #64748b;
  }

  .loading-spinner {
    width: 60px;
    height: 60px;
    margin: 0 auto 20px;
    position: relative;
  }

  .spinner-segment {
    position: absolute;
    width: 60px;
    height: 60px;
    border: 3px solid transparent;
    border-top-color: #667eea;
    border-radius: 50%;
    animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  }

  .spinner-segment:nth-child(1) { animation-delay: -0.45s; }
  .spinner-segment:nth-child(2) { animation-delay: -0.3s; }
  .spinner-segment:nth-child(3) { animation-delay: -0.15s; }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .error {
    padding: 20px;
    color: #ef4444;
    text-align: center;
  }

  .card {
    background: #ffffff;
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  }

  .header {
    position: relative;
  }

  .cover {
    height: 120px;
    overflow: hidden;
  }

  .cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .cover-gradient {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
    background-size: 200% 200%;
    animation: gradientMove 10s ease infinite;
  }

  @keyframes gradientMove {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }

  .header-content {
    display: flex;
    align-items: flex-end;
    gap: 12px;
    padding: 0 20px 16px;
    margin-top: -32px;
    position: relative;
  }

  .avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    border: 4px solid white;
    object-fit: cover;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    flex-shrink: 0;
  }

  .avatar.placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-size: 32px;
    font-weight: 700;
  }

  .header-info {
    flex: 1;
    padding-bottom: 4px;
  }

  .header-info h3 {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: #0f172a;
  }

  .handle {
    margin: 2px 0 0;
    font-size: 14px;
    color: #64748b;
  }

  .verified {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #10b981;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 4px;
    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
  }

  .tabs {
    display: flex;
    border-bottom: 2px solid #f1f5f9;
    padding: 0 20px;
  }

  .tab {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 12px 8px;
    background: none;
    border: none;
    border-bottom: 3px solid transparent;
    color: #94a3b8;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-bottom: -2px;
  }

  .tab svg {
    width: 20px;
    height: 20px;
  }

  .tab:hover {
    color: #667eea;
  }

  .tab.active {
    color: #667eea;
    border-bottom-color: #667eea;
  }

  .content {
    padding: 20px;
    min-height: 300px;
  }

  .profile-view {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .section h4 {
    margin: 0 0 12px;
    font-size: 14px;
    font-weight: 600;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .section p {
    margin: 0;
    font-size: 14px;
    line-height: 1.6;
    color: #334155;
  }

  .stats-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: 12px;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-radius: 16px;
    padding: 16px;
  }

  .stat-icon {
    font-size: 28px;
  }

  .stat-number {
    font-size: 24px;
    font-weight: 700;
    color: #0f172a;
  }

  .stat-label {
    font-size: 12px;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .contact-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .contact-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px;
    background: #f8fafc;
    border-radius: 12px;
    font-size: 13px;
    color: #475569;
    text-decoration: none;
    transition: background 0.2s ease;
  }

  .contact-item:hover {
    background: #f1f5f9;
  }

  .contact-item svg {
    width: 18px;
    height: 18px;
    color: #667eea;
    flex-shrink: 0;
  }

  .notes-view {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .note-item {
    background: #f8fafc;
    border-radius: 12px;
    padding: 14px;
    border-left: 3px solid #667eea;
  }

  .note-time {
    font-size: 11px;
    color: #94a3b8;
    font-weight: 600;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .note-text {
    margin: 0;
    font-size: 14px;
    line-height: 1.5;
    color: #334155;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  }

  .media-view {
    margin: -10px;
  }

  .media-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .media-item {
    aspect-ratio: 1;
    border-radius: 12px;
    overflow: hidden;
    background: #f1f5f9;
  }

  .media-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  .media-item:hover img {
    transform: scale(1.05);
  }

  .zaps-view {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 240px;
  }

  .empty-state {
    text-align: center;
    color: #94a3b8;
    padding: 40px 20px;
  }

  .empty-icon {
    font-size: 48px;
    margin-bottom: 12px;
  }

  .action-bar {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    padding: 20px;
    border-top: 2px solid #f1f5f9;
  }

  .primary-button,
  .secondary-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px 20px;
    border: none;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .primary-button {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  .primary-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
  }

  .secondary-button {
    background: #f1f5f9;
    color: #475569;
  }

  .secondary-button:hover {
    background: #e2e8f0;
  }

  .primary-button svg,
  .secondary-button svg {
    width: 18px;
    height: 18px;
  }
</style>
