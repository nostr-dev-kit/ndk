<svelte:options
  customElement={{
    tag: "nostr-user-card",
    props: {
      npub: { type: "String" },
      relays: { type: "String" },
      theme: { type: "String" },
    }
  }}
/>

<script lang="ts">
  import NDK, { type NDKUserProfile } from "@nostr-dev-kit/ndk";
  import { onMount } from "svelte";

  interface Props {
    npub?: string;
    relays?: string;
    theme?: "light" | "dark";
  }

  let { npub = "", relays = "wss://relay.damus.io,wss://nos.lol", theme = "dark" }: Props = $props();

  let ndk: NDK;
  let profile = $state<NDKUserProfile | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);

  const pubkey = $derived.by(() => {
    if (!npub) return null;
    try {
      return ndk?.getUser(npub)?.pubkey || null;
    } catch (e) {
      return null;
    }
  });

  const initials = $derived.by(() => {
    const name = profile?.name || profile?.displayName;
    if (!name) return npub?.slice(0, 2).toUpperCase() || "??";
    const words = name.split(" ");
    if (words.length > 1) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  });

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

<div class="nostr-user-card" data-theme={theme}>
  {#if loading}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Loading profile...</p>
    </div>
  {:else if error}
    <div class="error-state">
      <div class="error-icon">⚠️</div>
      <p>{error}</p>
    </div>
  {:else if profile}
    <div class="card-content">
      <!-- Banner Background -->
      {#if profile.banner}
        <div class="banner" style="background-image: url({profile.banner})"></div>
      {:else}
        <div class="banner gradient-banner"></div>
      {/if}

      <!-- Avatar -->
      <div class="avatar-container">
        {#if profile.image}
          <img src={profile.image} alt={profile.name || "User"} class="avatar" />
        {:else}
          <div class="avatar placeholder">
            {initials}
          </div>
        {/if}
        {#if profile.nip05}
          <div class="verified-badge" title="NIP-05 Verified">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        {/if}
      </div>

      <!-- Profile Info -->
      <div class="profile-info">
        {#if profile.displayName}
          <h2 class="display-name">{profile.displayName}</h2>
        {/if}
        {#if profile.name}
          <p class="username">@{profile.name}</p>
        {/if}
        {#if profile.nip05}
          <p class="nip05">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {profile.nip05}
          </p>
        {/if}
        {#if profile.about}
          <p class="bio">{profile.about}</p>
        {/if}
      </div>

      <!-- Stats -->
      <div class="stats">
        <div class="stat">
          <div class="stat-value">
            {profile.followsCount || 0}
          </div>
          <div class="stat-label">Following</div>
        </div>
        <div class="stat">
          <div class="stat-value">
            {profile.followersCount || 0}
          </div>
          <div class="stat-label">Followers</div>
        </div>
      </div>

      <!-- Action Button -->
      <button class="follow-button">
        Follow
      </button>
    </div>
  {/if}
</div>

<style>
  :host {
    display: block;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
  }

  .nostr-user-card {
    width: 100%;
    max-width: 400px;
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    position: relative;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .nostr-user-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 24px 72px rgba(0, 0, 0, 0.4);
  }

  .nostr-user-card[data-theme="light"] {
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  }

  .loading-state,
  .error-state {
    padding: 80px 40px;
    text-align: center;
    color: white;
  }

  .nostr-user-card[data-theme="light"] .loading-state,
  .nostr-user-card[data-theme="light"] .error-state {
    color: #334155;
  }

  .spinner {
    width: 48px;
    height: 48px;
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 16px;
  }

  .nostr-user-card[data-theme="light"] .spinner {
    border-color: rgba(51, 65, 85, 0.3);
    border-top-color: #334155;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .error-icon {
    font-size: 48px;
    margin-bottom: 12px;
  }

  .card-content {
    position: relative;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    border-radius: 24px;
    overflow: hidden;
  }

  .nostr-user-card[data-theme="light"] .card-content {
    background: rgba(255, 255, 255, 0.7);
  }

  .banner {
    width: 100%;
    height: 120px;
    background-size: cover;
    background-position: center;
    position: relative;
  }

  .gradient-banner {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
    animation: gradientShift 8s ease infinite;
    background-size: 200% 200%;
  }

  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  .avatar-container {
    position: relative;
    width: 96px;
    height: 96px;
    margin: -48px auto 0;
    z-index: 10;
  }

  .avatar {
    width: 96px;
    height: 96px;
    border-radius: 50%;
    border: 4px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.1);
    object-fit: cover;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }

  .avatar.placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-size: 32px;
    font-weight: bold;
  }

  .verified-badge {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 28px;
    height: 28px;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    border-radius: 50%;
    border: 3px solid rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
  }

  .verified-badge svg {
    width: 16px;
    height: 16px;
    color: white;
  }

  .profile-info {
    padding: 20px 24px 16px;
    text-align: center;
  }

  .display-name {
    font-size: 24px;
    font-weight: 700;
    margin: 0 0 4px;
    color: white;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .nostr-user-card[data-theme="light"] .display-name {
    color: #1e293b;
    text-shadow: none;
  }

  .username {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
    margin: 0 0 8px;
  }

  .nostr-user-card[data-theme="light"] .username {
    color: #64748b;
  }

  .nip05 {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    margin: 0 0 12px;
  }

  .nostr-user-card[data-theme="light"] .nip05 {
    color: #64748b;
  }

  .nip05 svg {
    width: 14px;
    height: 14px;
    color: #10b981;
  }

  .bio {
    font-size: 14px;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.85);
    margin: 0;
    max-height: 80px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
  }

  .nostr-user-card[data-theme="light"] .bio {
    color: #475569;
  }

  .stats {
    display: flex;
    justify-content: space-around;
    padding: 16px 24px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .nostr-user-card[data-theme="light"] .stats {
    border-color: rgba(0, 0, 0, 0.1);
  }

  .stat {
    text-align: center;
  }

  .stat-value {
    font-size: 20px;
    font-weight: 700;
    color: white;
    margin-bottom: 4px;
  }

  .nostr-user-card[data-theme="light"] .stat-value {
    color: #1e293b;
  }

  .stat-label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .nostr-user-card[data-theme="light"] .stat-label {
    color: #64748b;
  }

  .follow-button {
    width: calc(100% - 48px);
    margin: 20px 24px 24px;
    padding: 14px 28px;
    border: none;
    border-radius: 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
  }

  .nostr-user-card[data-theme="light"] .follow-button {
    background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
    box-shadow: 0 4px 16px rgba(30, 41, 59, 0.3);
  }

  .follow-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
  }

  .nostr-user-card[data-theme="light"] .follow-button:hover {
    box-shadow: 0 6px 20px rgba(30, 41, 59, 0.4);
  }

  .follow-button:active {
    transform: translateY(0);
  }
</style>
