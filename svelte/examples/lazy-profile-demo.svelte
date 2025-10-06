<!--
Example demonstrating separate user and profile fetching
-->
<script lang="ts">
  import { useUser, useProfile } from '@nostr-dev-kit/svelte';
  import { NDKSubscriptionCacheUsage } from '@nostr-dev-kit/ndk';

  // User 1: Basic example - profile fetched automatically
  const user1 = useUser(ndk, 'npub1...');
  const profile1 = useProfile(ndk, user1.user?.pubkey);

  // User 2: Example with custom subscription options
  const user2 = useUser(ndk, 'npub2...');
  const profile2 = useProfile(ndk, user2.user?.pubkey, {
    cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY,
    closeOnEose: true
  });

  // User 3: Conditional profile fetching
  let shouldFetchProfile3 = $state(false);
  const user3 = useUser(ndk, 'npub3...');
  const profile3 = useProfile(ndk, shouldFetchProfile3 ? user3.user?.pubkey : undefined);
</script>

<div>
  <h2>User 1 - Basic Usage</h2>
  {#if user1.user}
    <p>Npub: {user1.user.npub}</p>
    <p>Pubkey: {user1.user.pubkey}</p>

    {#if profile1.fetching}
      <p>Loading profile...</p>
    {:else if profile1.profile}
      <p>Name: {profile1.profile.name || 'No name'}</p>
      <p>About: {profile1.profile.about || 'No bio'}</p>
    {:else}
      <p>No profile available</p>
    {/if}
  {/if}

  <h2>User 2 - With Custom Options (Skip Cache)</h2>
  {#if user2.user}
    <p>Npub: {user2.user.npub}</p>

    {#if profile2.fetching}
      <p>Loading profile from relay...</p>
    {:else if profile2.profile}
      <p>Name: {profile2.profile.name || 'No name'}</p>
      <p>About: {profile2.profile.about || 'No bio'}</p>
    {/if}
  {/if}

  <h2>User 3 - Conditional Profile Fetching</h2>
  {#if user3.user}
    <p>Npub: {user3.user.npub}</p>

    <button onclick={() => shouldFetchProfile3 = !shouldFetchProfile3}>
      {shouldFetchProfile3 ? 'Stop' : 'Start'} Fetching Profile
    </button>

    {#if shouldFetchProfile3}
      {#if profile3.fetching}
        <p>Loading profile...</p>
      {:else if profile3.profile}
        <p>Name: {profile3.profile.name || 'No name'}</p>
        <p>About: {profile3.profile.about || 'No bio'}</p>
      {:else}
        <p>No profile available</p>
      {/if}
    {/if}
  {/if}
</div>

<style>
  button {
    margin: 10px 0;
    padding: 5px 10px;
    cursor: pointer;
  }
</style>