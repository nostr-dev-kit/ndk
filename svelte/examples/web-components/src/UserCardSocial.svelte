<svelte:options
  customElement={{
    tag: "nostr-user-card-social",
    props: {
      npub: { type: "String" },
      relays: { type: "String" },
      viewerNpub: { type: "String" },
    }
  }}
/>

<script lang="ts">
  import NDK, { type NDKUserProfile, NDKUser } from "@nostr-dev-kit/ndk";
  import { onMount } from "svelte";

  interface Props {
    npub?: string;
    relays?: string;
    viewerNpub?: string;
  }

  let { npub = "", relays = "wss://relay.damus.io,wss://nos.lol", viewerNpub = "" }: Props = $props();

  let ndk: NDK;
  let profile = $state<NDKUserProfile | null>(null);
  let mutualFollows = $state<NDKUser[]>([]);
  let recentFollows = $state<NDKUser[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);

  const badges = $derived.by(() => {
    const items = [];
    if (profile?.nip05) items.push({ icon: "✓", label: "Verified", color: "#10b981" });
    if (profile?.lud16 || profile?.lud06) items.push({ icon: "⚡", label: "Lightning", color: "#f59e0b" });
    if ((profile?.followersCount || 0) > 1000) items.push({ icon: "🌟", label: "Popular", color: "#8b5cf6" });
    if ((profile?.followsCount || 0) > 500) items.push({ icon: "🔗", label: "Well Connected", color: "#3b82f6" });
    return items;
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

      const followsSet = await ndk.fetchEvents({
        kinds: [3],
        authors: [user.pubkey],
        limit: 1,
      });

      if (followsSet.size > 0) {
        const followEvent = Array.from(followsSet)[0];
        const followPubkeys = followEvent.tags
          .filter(tag => tag[0] === "p")
          .map(tag => tag[1])
          .slice(0, 6);

        recentFollows = followPubkeys.map(pubkey => {
          const u = new NDKUser({ pubkey });
          u.ndk = ndk;
          u.fetchProfile();
          return u;
        });

        if (viewerNpub) {
          const viewer = ndk.getUser(viewerNpub);
          const viewerFollowsSet = await ndk.fetchEvents({
            kinds: [3],
            authors: [viewer.pubkey],
            limit: 1,
          });

          if (viewerFollowsSet.size > 0) {
            const viewerFollowEvent = Array.from(viewerFollowsSet)[0];
            const viewerFollowPubkeys = new Set(
              viewerFollowEvent.tags
                .filter(tag => tag[0] === "p")
                .map(tag => tag[1])
            );

            const mutualPubkeys = followPubkeys
              .filter(pubkey => viewerFollowPubkeys.has(pubkey))
              .slice(0, 3);

            mutualFollows = mutualPubkeys.map(pubkey => {
              const u = new NDKUser({ pubkey });
              u.ndk = ndk;
              u.fetchProfile();
              return u;
            });
          }
        }
      }

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

<div class="social-card">
  {#if loading}
    <div class="loading">
      <div class="spinner-ring"></div>
      <p>Analyzing social graph...</p>
    </div>
  {:else if error}
    <div class="error">{error}</div>
  {:else if profile}
    <div class="card">
      <div class="profile-section">
        <div class="avatar-wrapper">
          {#if profile.image}
            <img src={profile.image} alt={profile.name || "User"} class="avatar" />
          {:else}
            <div class="avatar placeholder">
              {(profile.displayName || profile.name || "?")[0].toUpperCase()}
            </div>
          {/if}
          <div class="status-indicator"></div>
        </div>

        <div class="profile-info">
          {#if profile.displayName}
            <h3>{profile.displayName}</h3>
          {/if}
          {#if profile.name}
            <p class="username">@{profile.name}</p>
          {/if}
          {#if profile.about}
            <p class="bio">{profile.about}</p>
          {/if}
        </div>
      </div>

      {#if badges.length > 0}
        <div class="badges-section">
          <h4>Achievements</h4>
          <div class="badges">
            {#each badges as badge}
              <div class="badge" style="border-color: {badge.color};">
                <span class="badge-icon" style="color: {badge.color};">{badge.icon}</span>
                <span class="badge-label">{badge.label}</span>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <div class="stats-grid">
        <div class="stat-box">
          <div class="stat-value">{profile.followersCount || 0}</div>
          <div class="stat-label">Followers</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">{profile.followsCount || 0}</div>
          <div class="stat-label">Following</div>
        </div>
      </div>

      {#if mutualFollows.length > 0}
        <div class="connections-section">
          <h4>
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            Mutual Connections
          </h4>
          <div class="mutual-list">
            {#each mutualFollows as mutual}
              <div class="mutual-user">
                {#if mutual.profile?.image}
                  <img src={mutual.profile.image} alt="" class="mutual-avatar" />
                {:else}
                  <div class="mutual-avatar placeholder">
                    {(mutual.profile?.name || "?")[0].toUpperCase()}
                  </div>
                {/if}
                <div class="mutual-info">
                  <p class="mutual-name">{mutual.profile?.displayName || mutual.profile?.name || "Loading..."}</p>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      {#if recentFollows.length > 0}
        <div class="network-section">
          <h4>
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clip-rule="evenodd" />
            </svg>
            Network Activity
          </h4>
          <div class="network-grid">
            {#each recentFollows.slice(0, 6) as follow}
              <div class="network-node">
                {#if follow.profile?.image}
                  <img src={follow.profile.image} alt="" />
                {:else}
                  <div class="node-placeholder">
                    {(follow.profile?.name || "?")[0].toUpperCase()}
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  :host {
    display: block;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }

  .social-card {
    width: 100%;
    max-width: 420px;
  }

  .loading {
    padding: 60px 20px;
    text-align: center;
    color: #64748b;
  }

  .spinner-ring {
    width: 56px;
    height: 56px;
    margin: 0 auto 16px;
    border: 4px solid #f1f5f9;
    border-top-color: #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .error {
    padding: 20px;
    color: #ef4444;
    text-align: center;
  }

  .card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 24px;
    padding: 24px;
    color: white;
    box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
  }

  .profile-section {
    text-align: center;
    margin-bottom: 24px;
  }

  .avatar-wrapper {
    position: relative;
    display: inline-block;
    margin-bottom: 16px;
  }

  .avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }

  .avatar.placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.2);
    font-size: 32px;
    font-weight: 700;
  }

  .status-indicator {
    position: absolute;
    bottom: 4px;
    right: 4px;
    width: 16px;
    height: 16px;
    background: #10b981;
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .profile-info h3 {
    margin: 0 0 4px;
    font-size: 24px;
    font-weight: 700;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .username {
    margin: 0 0 12px;
    font-size: 14px;
    opacity: 0.9;
  }

  .bio {
    margin: 0;
    font-size: 14px;
    line-height: 1.5;
    opacity: 0.85;
    max-height: 60px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  }

  .badges-section {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 16px;
  }

  .badges-section h4 {
    margin: 0 0 12px;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    opacity: 0.8;
  }

  .badges {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .badge {
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    border: 2px solid;
  }

  .badge-icon {
    font-size: 14px;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 16px;
  }

  .stat-box {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 16px;
    text-align: center;
  }

  .stat-value {
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 4px;
  }

  .stat-label {
    font-size: 12px;
    opacity: 0.8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .connections-section,
  .network-section {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 16px;
  }

  .connections-section:last-child,
  .network-section:last-child {
    margin-bottom: 0;
  }

  h4 {
    margin: 0 0 12px;
    font-size: 14px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  h4 svg {
    width: 16px;
    height: 16px;
    opacity: 0.8;
  }

  .mutual-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .mutual-user {
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(255, 255, 255, 0.1);
    padding: 8px;
    border-radius: 12px;
  }

  .mutual-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }

  .mutual-avatar.placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.2);
    font-size: 14px;
    font-weight: 600;
  }

  .mutual-info {
    flex: 1;
    min-width: 0;
  }

  .mutual-name {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .network-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 8px;
  }

  .network-node {
    aspect-ratio: 1;
    border-radius: 12px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.1);
  }

  .network-node img,
  .node-placeholder {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .node-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.2);
    font-size: 16px;
    font-weight: 600;
  }
</style>
