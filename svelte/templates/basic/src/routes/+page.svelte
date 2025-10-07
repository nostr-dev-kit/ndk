<script lang="ts">
    import { ndk } from '$lib/stores/ndk.svelte';
    import { Avatar, EventContent } from '@nostr-dev-kit/svelte';
    import Card from '$lib/components/ui/card.svelte';
    import Button from '$lib/components/ui/button.svelte';
    import { NDKEvent, NDKKind } from '@nostr-dev-kit/ndk';

    let showFeed = $state(false);
    let noteContent = $state('');

    const feed = $derived(showFeed ? ndk.$subscribe([{
        kinds: [NDKKind.Text],
        limit: 20
    }]) : undefined);

    function loadFeed() {
        showFeed = true;
    }

    async function publishNote() {
        if (!ndk.$sessions.current || !noteContent.trim()) return;

        try {
            const event = new NDKEvent(ndk);
            event.kind = NDKKind.Text;
            event.content = noteContent;
            await event.publish();
            noteContent = '';
        } catch (e) {
            console.error('Failed to publish note:', e);
        }
    }

    function formatDate(timestamp?: number) {
        if (!timestamp) return '';
        return new Date(timestamp * 1000).toLocaleString();
    }
</script>

<svelte:head>
    <title>NDK Template - Modern Nostr Development</title>
</svelte:head>

<div class="min-h-[calc(100vh-5rem)]">
    <!-- Hero Section -->
    <div class="relative overflow-hidden bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
        <div class="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.05))]"></div>
        <div class="container relative mx-auto px-4 py-24">
            <div class="mx-auto max-w-4xl text-center">
                <div class="mb-6 inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700 dark:border-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                    <svg class="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" />
                    </svg>
                    Powered by NDK & Svelte 5
                </div>

                <h1 class="mb-6 text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
                    <span class="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Build on Nostr
                    </span>
                    <br />
                    <span class="text-gray-900 dark:text-white">with modern tools</span>
                </h1>

                <p class="mx-auto mb-10 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
                    A beautiful, production-ready Svelte 5 template featuring multi-account support,
                    relay management, and elegant user profiles. Start building your decentralized app today.
                </p>

                <div class="flex flex-wrap items-center justify-center gap-4">
                    {#if ndk.$sessions.current}
                        <Button
                            size="lg"
                            class="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-xl hover:shadow-2xl transition-all text-base px-8 py-6"
                            onclick={loadFeed}
                            disabled={showFeed}
                        >
                            <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Load Global Feed
                        </Button>
                    {:else}
                        <Button
                            size="lg"
                            class="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-xl hover:shadow-2xl transition-all text-base px-8 py-6"
                            onclick={() => {/* handled by header */}}
                        >
                            <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                            Get Started - Login
                        </Button>
                    {/if}

                    <Button
                        size="lg"
                        variant="outline"
                        class="border-2 text-base px-8 py-6"
                    >
                        <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        View Docs
                    </Button>
                </div>
            </div>
        </div>
    </div>

    <!-- Features Section -->
    <div class="container mx-auto px-4 py-20">
        <div class="mx-auto max-w-6xl">
            <div class="grid gap-8 md:grid-cols-3">
                <Card class="group relative overflow-hidden border-2 p-8 transition-all hover:shadow-2xl hover:scale-105">
                    <div class="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-lg">
                        <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                    <h3 class="mb-3 text-2xl font-bold">Multi-Account</h3>
                    <p class="text-muted-foreground">
                        Seamlessly switch between multiple Nostr identities with support for NIP-07 extensions and private keys.
                    </p>
                </Card>

                <Card class="group relative overflow-hidden border-2 p-8 transition-all hover:shadow-2xl hover:scale-105">
                    <div class="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg">
                        <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                        </svg>
                    </div>
                    <h3 class="mb-3 text-2xl font-bold">Relay Manager</h3>
                    <p class="text-muted-foreground">
                        Full control over your relay connections with real-time status monitoring and easy management.
                    </p>
                </Card>

                <Card class="group relative overflow-hidden border-2 p-8 transition-all hover:shadow-2xl hover:scale-105">
                    <div class="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-lg">
                        <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <h3 class="mb-3 text-2xl font-bold">Profile Pages</h3>
                    <p class="text-muted-foreground">
                        Beautiful profile views supporting npub, nprofile, NIP-05, and hex formats with modern design.
                    </p>
                </Card>
            </div>
        </div>
    </div>

    <!-- Publisher Section -->
    {#if ndk.$sessions.current}
        <div class="container mx-auto px-4 py-12">
            <div class="mx-auto max-w-3xl">
                <Card class="border-2 p-8 shadow-xl">
                    <h2 class="mb-6 text-3xl font-bold">Publish a Note</h2>
                    <div class="space-y-4">
                        <textarea
                            class="w-full min-h-[160px] rounded-xl border-2 bg-background px-4 py-3 text-base transition-all focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20"
                            placeholder="What's on your mind?"
                            bind:value={noteContent}
                        ></textarea>
                        <div class="flex justify-end">
                            <Button
                                class="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all"
                                onclick={publishNote}
                                disabled={!noteContent.trim()}
                            >
                                <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                                Publish Note
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    {/if}

    <!-- Feed Section -->
    {#if feed?.events.length}
        <div class="container mx-auto px-4 py-12">
            <div class="mx-auto max-w-3xl">
                <h2 class="mb-8 text-4xl font-bold">Global Feed</h2>
                <div class="space-y-4">
                    {#each feed.events as event}
                        <Card class="border-2 p-6 transition-all hover:shadow-xl">
                            <div class="mb-4 flex items-center justify-between">
                                <a
                                    href="/p/{event.author.npub}"
                                    class="flex items-center gap-3 group"
                                >
                                    <Avatar {ndk} pubkey={event.author.pubkey} size={48} />
                                    <div>
                                        <div class="font-semibold group-hover:text-purple-600 transition-colors">
                                            {event.author.profile?.name || event.author.profile?.displayName || event.author.npub.substring(0, 12)}
                                        </div>
                                        {#if event.author.profile?.nip05}
                                            <div class="text-sm text-muted-foreground">
                                                {event.author.profile.nip05}
                                            </div>
                                        {/if}
                                    </div>
                                </a>
                                <span class="text-sm text-muted-foreground">
                                    {formatDate(event.created_at)}
                                </span>
                            </div>
                            <EventContent
                                {ndk}
                                content={event.content}
                                emojiTags={event.tags.filter(t => t[0] === 'emoji')}
                                class="text-base leading-relaxed"
                            />
                        </Card>
                    {/each}
                </div>
            </div>
        </div>
    {/if}
</div>
