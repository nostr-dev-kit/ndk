<script lang="ts">
    import { page } from '$app/stores';
    import { ndk } from '$lib/stores/ndk.svelte';
    import Card from '$lib/components/ui/card.svelte';
    import Badge from '$lib/components/ui/badge.svelte';
    import Button from '$lib/components/ui/button.svelte';
    import { useUser, useProfile, EventContent } from '@nostr-dev-kit/svelte';
    import { NDKKind } from '@nostr-dev-kit/ndk';

    const identifier = $derived($page.params.id);
    const userStore = useUser(ndk, identifier);
    const profileStore = $derived(userStore.user ? useProfile(ndk, userStore.user.pubkey) : undefined);

    const events = $derived(
        userStore.user
            ? ndk.$subscribe([{
                kinds: [NDKKind.Text],
                authors: [userStore.user.pubkey],
                limit: 50
            }])
            : undefined
    );

    let followersCount = $state(0);
    let followingCount = $state(0);

    $effect(() => {
        if (!userStore.user) return;

        (async () => {
            const followers = await ndk.fetchEvents({
                kinds: [3],
                '#p': [userStore.user!.pubkey],
                limit: 1000
            });
            followersCount = followers.size;

            const following = await ndk.fetchEvents({
                kinds: [3],
                authors: [userStore.user!.pubkey],
                limit: 1
            });
            if (following.size > 0) {
                const contactList = Array.from(following)[0];
                followingCount = contactList.tags.filter(t => t[0] === 'p').length;
            }
        })();
    });

    function formatDate(timestamp?: number) {
        if (!timestamp) return '';
        return new Date(timestamp * 1000).toLocaleString();
    }
</script>

<svelte:head>
    <title>{profileStore?.profile?.displayName || profileStore?.profile?.name || 'Profile'} | NDK Template</title>
</svelte:head>

{#if userStore?.fetching || profileStore?.fetching}
    <div class="flex justify-center py-12">
        <p class="text-muted-foreground">Loading profile...</p>
    </div>
{:else if userStore?.user && profileStore?.profile}
    <div class="max-w-4xl mx-auto space-y-6">
        <!-- Profile Header -->
        <Card class="overflow-hidden">
            {#if profileStore.profile.banner}
                <div class="h-48 bg-gradient-to-r from-primary to-secondary">
                    <img src={profileStore.profile.banner} alt="Banner" class="w-full h-full object-cover" />
                </div>
            {:else}
                <div class="h-48 bg-gradient-to-r from-primary to-secondary"></div>
            {/if}

            <div class="p-6 -mt-16">
                <div class="flex items-end justify-between mb-4">
                    <div class="flex items-end gap-4">
                        {#if profileStore.profile.image}
                            <img
                                src={profileStore.profile.image}
                                alt={profileStore.profile.displayName || profileStore.profile.name}
                                class="w-32 h-32 rounded-full border-4 border-background object-cover"
                            />
                        {:else}
                            <div class="w-32 h-32 rounded-full border-4 border-background bg-muted flex items-center justify-center">
                                <span class="text-4xl font-bold">
                                    {(profileStore.profile.displayName || profileStore.profile.name || userStore.user.pubkey.substring(0, 2)).substring(0, 2).toUpperCase()}
                                </span>
                            </div>
                        {/if}
                    </div>

                    <Button variant="outline">Follow</Button>
                </div>

                <div class="space-y-4">
                    <div>
                        <h1 class="text-3xl font-bold">
                            {profileStore.profile.displayName || profileStore.profile.name || 'Anonymous'}
                        </h1>
                        {#if profileStore.profile.nip05}
                            <p class="text-sm text-muted-foreground flex items-center gap-1">
                                {profileStore.profile.nip05}
                                <Badge variant="secondary" class="text-xs">Verified</Badge>
                            </p>
                        {/if}
                    </div>

                    {#if profileStore.profile.about}
                        <p class="text-muted-foreground">{profileStore.profile.about}</p>
                    {/if}

                    <div class="flex gap-6 text-sm">
                        <div>
                            <span class="font-bold">{followingCount}</span>
                            <span class="text-muted-foreground ml-1">Following</span>
                        </div>
                        <div>
                            <span class="font-bold">{followersCount}</span>
                            <span class="text-muted-foreground ml-1">Followers</span>
                        </div>
                    </div>

                    {#if profileStore.profile.website}
                        <a
                            href={profileStore.profile.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="text-sm text-primary hover:underline"
                        >
                            {profileStore.profile.website}
                        </a>
                    {/if}

                    <div class="text-xs text-muted-foreground font-mono">
                        {userStore.user.pubkey}
                    </div>
                </div>
            </div>
        </Card>

        <!-- User Notes -->
        <div class="space-y-4">
            <h2 class="text-2xl font-bold">Notes</h2>

            {#if events?.events.length > 0}
                {#each events.events as event}
                    <Card class="p-4">
                        <div class="mb-2 flex items-center justify-between">
                            <span class="text-xs text-muted-foreground">
                                {formatDate(event.created_at)}
                            </span>
                        </div>
                        <EventContent
                            {ndk}
                            content={event.content}
                            emojiTags={event.tags.filter(t => t[0] === 'emoji')}
                            class="text-sm"
                        />
                    </Card>
                {/each}
            {:else}
                <Card class="p-8 text-center">
                    <p class="text-muted-foreground">No notes yet</p>
                </Card>
            {/if}
        </div>
    </div>
{:else}
    <Card class="p-8 text-center max-w-md mx-auto">
        <h2 class="text-2xl font-bold mb-2">Profile Not Found</h2>
        <p class="text-muted-foreground">
            Could not load profile for {$page.params.id}
        </p>
        <Button class="mt-4" href="/">Go Home</Button>
    </Card>
{/if}
