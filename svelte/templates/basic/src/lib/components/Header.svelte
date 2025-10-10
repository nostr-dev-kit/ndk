<script lang="ts">
    import { ndk } from '$lib/stores/ndk.svelte';
    import Button from './ui/button.svelte';
    import Badge from './ui/badge.svelte';
    import AccountSwitcher from './AccountSwitcher.svelte';
    import { RelayManager, Avatar } from '@nostr-dev-kit/svelte';

    let showRelayManager = $state(false);
    let showAccountSwitcher = $state(false);
</script>

<header class="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div class="container mx-auto flex h-20 max-w-screen-2xl items-center justify-between px-6">
        <div class="flex items-center gap-8">
            <a href="/" class="flex items-center space-x-2 transition-opacity hover:opacity-80">
                <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 text-white font-bold text-lg shadow-lg">
                    N
                </div>
                <span class="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    NDK Template
                </span>
            </a>
            <div class="hidden md:flex items-center gap-2">
                {#if ndk.$pool.connectedCount > 0}
                    <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                        <div class="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span class="text-sm font-medium text-green-700 dark:text-green-300">Connected</span>
                    </div>
                {:else}
                    <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                        <div class="h-2 w-2 rounded-full bg-red-500"></div>
                        <span class="text-sm font-medium text-red-700 dark:text-red-300">Disconnected</span>
                    </div>
                {/if}
                <div class="px-3 py-1.5 rounded-full bg-secondary/50 border border-border">
                    <span class="text-sm font-medium">{ndk.$pool.connectedCount} relays</span>
                </div>
            </div>
        </div>

        <div class="flex items-center gap-3">
            <Button
                variant="ghost"
                size="sm"
                class="hidden sm:flex"
                onclick={() => showRelayManager = !showRelayManager}
            >
                <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
                Relays
            </Button>

            {#if ndk.$sessions.current}
                <Button
                    variant="outline"
                    size="sm"
                    class="gap-2"
                    onclick={() => showAccountSwitcher = !showAccountSwitcher}
                >
                    <Avatar {ndk} pubkey={ndk.$sessions.current.pubkey} size={24} />
                    <span class="hidden sm:inline">{ndk.$sessions.profile?.name || ndk.$sessions.profile?.displayName || ndk.$sessions.activePubkey?.substring(0, 8)}</span>
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onclick={() => ndk.$sessions.logout()}
                >
                    Logout
                </Button>
            {:else}
                <Button
                    size="sm"
                    class="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all"
                    onclick={() => showAccountSwitcher = !showAccountSwitcher}
                >
                    <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Login
                </Button>
            {/if}
        </div>
    </div>
</header>

{#if showRelayManager}
    <!-- Backdrop -->
    <div
        class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onclick={() => showRelayManager = false}
        role="button"
        tabindex="0"
    ></div>

    <!-- Modal -->
    <div class="fixed left-1/2 top-1/2 z-50 w-full max-w-5xl -translate-x-1/2 -translate-y-1/2 max-h-[90vh] overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        <div class="relative">
            <button
                onclick={() => showRelayManager = false}
                class="absolute right-4 top-4 z-10 rounded-lg p-2 bg-background/80 hover:bg-background transition-colors"
            >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            <RelayManager {ndk} />
        </div>
    </div>
{/if}

{#if showAccountSwitcher}
    <AccountSwitcher onclose={() => showAccountSwitcher = false} />
{/if}
