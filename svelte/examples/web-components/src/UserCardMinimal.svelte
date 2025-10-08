<svelte:options
  customElement={{
    tag: "nostr-user-card-minimal",
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

  const initials = $derived.by(() => {
    const name = profile?.displayName || profile?.name;
    if (!name) return "??";
    const words = name.split(" ");
    if (words.length > 1) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
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

<div class="minimal-card" data-theme={theme}>
  {#if loading}
    <div class="loading">
      <div class="dot"></div>
      <div class="dot"></div>
      <div class="dot"></div>
    </div>
  {:else if error}
    <div class="error">{error}</div>
  {:else if profile}
    <div class="card">
      <div class="avatar-section">
        {#if profile.image}
          <img src={profile.image} alt={profile.name || "User"} class="avatar" />
        {:else}
          <div class="avatar placeholder">{initials}</div>
        {/if}
      </div>

      <div class="info">
        <div class="name-section">
          {#if profile.displayName}
            <h3 class="display-name">{profile.displayName}</h3>
          {/if}
          {#if profile.name}
            <p class="username">@{profile.name}</p>
          {/if}
        </div>

        {#if profile.about}
          <p class="bio">{profile.about}</p>
        {/if}

        <div class="meta">
          {#if profile.nip05}
            <div class="meta-item verified">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              {profile.nip05}
            </div>
          {/if}
          {#if profile.lud16 || profile.lud06}
            <div class="meta-item">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd" />
              </svg>
              {profile.lud16 || profile.lud06}
            </div>
          {/if}
        </div>

        <div class="stats">
          <div class="stat">
            <strong>{profile.followsCount || 0}</strong>
            <span>Following</span>
          </div>
          <div class="stat">
            <strong>{profile.followersCount || 0}</strong>
            <span>Followers</span>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  :host {
    display: block;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
  }

  .minimal-card {
    width: 100%;
    max-width: 360px;
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .loading {
    display: flex;
    gap: 8px;
    padding: 40px;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #667eea;
    animation: bounce 1.4s infinite ease-in-out both;
  }

  .dot:nth-child(1) { animation-delay: -0.32s; }
  .dot:nth-child(2) { animation-delay: -0.16s; }

  @keyframes bounce {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
  }

  .error {
    padding: 20px;
    color: #ef4444;
    text-align: center;
  }

  .card {
    width: 100%;
    background: white;
    border-radius: 16px;
    padding: 32px 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: box-shadow 0.3s ease;
  }

  .minimal-card[data-theme="dark"] .card {
    background: #1e293b;
    color: white;
  }

  .card:hover {
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  }

  .avatar-section {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
  }

  .avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid #f1f5f9;
  }

  .minimal-card[data-theme="dark"] .avatar {
    border-color: #334155;
  }

  .avatar.placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-size: 28px;
    font-weight: 600;
  }

  .info {
    text-align: center;
  }

  .name-section {
    margin-bottom: 12px;
  }

  .display-name {
    font-size: 24px;
    font-weight: 700;
    margin: 0 0 4px;
    color: #0f172a;
    letter-spacing: -0.5px;
  }

  .minimal-card[data-theme="dark"] .display-name {
    color: white;
  }

  .username {
    font-size: 14px;
    color: #64748b;
    margin: 0;
  }

  .bio {
    font-size: 14px;
    line-height: 1.6;
    color: #475569;
    margin: 0 0 16px;
    max-height: 60px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  }

  .minimal-card[data-theme="dark"] .bio {
    color: #cbd5e1;
  }

  .meta {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
    font-size: 12px;
  }

  .meta-item {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    color: #64748b;
  }

  .meta-item.verified {
    color: #10b981;
    font-weight: 500;
  }

  .meta-item svg {
    width: 16px;
    height: 16px;
  }

  .stats {
    display: flex;
    justify-content: center;
    gap: 32px;
    padding-top: 16px;
    border-top: 1px solid #f1f5f9;
  }

  .minimal-card[data-theme="dark"] .stats {
    border-color: #334155;
  }

  .stat {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .stat strong {
    font-size: 20px;
    font-weight: 700;
    color: #0f172a;
  }

  .minimal-card[data-theme="dark"] .stat strong {
    color: white;
  }

  .stat span {
    font-size: 12px;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
</style>
