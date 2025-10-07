<script lang="ts">
    import { ndk } from '$lib/stores/ndk.svelte';
    import { NDKPrivateKeySigner } from '@nostr-dev-kit/ndk';
    import { Avatar } from '@nostr-dev-kit/svelte';
    import Button from './ui/button.svelte';
    import Card from './ui/card.svelte';
    import Input from './ui/input.svelte';
    import Badge from './ui/badge.svelte';

    type Props = {
        onclose: () => void;
    };

    let { onclose }: Props = $props();

    let privateKey = $state('');
    let loginError = $state('');
    let loginMode = $state<'nip07' | 'nsec'>('nip07');

    async function handleNIP07Login() {
        try {
            loginError = '';
            await ndk.$sessions.login();
            onclose();
        } catch (e) {
            loginError = e instanceof Error ? e.message : 'Failed to login with NIP-07';
        }
    }

    async function handlePrivateKeyLogin() {
        try {
            loginError = '';
            const signer = new NDKPrivateKeySigner(privateKey);
            await ndk.$sessions.login(signer);
            privateKey = '';
            onclose();
        } catch (e) {
            loginError = e instanceof Error ? e.message : 'Failed to login with private key';
        }
    }
</script>

<!-- Backdrop with centered modal -->
<div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    onclick={onclose}
    role="button"
    tabindex="0"
>
    <!-- Modal -->
    <div class="w-full max-w-lg animate-in zoom-in-95 fade-in duration-200" onclick={(e) => e.stopPropagation()}>
        <Card class="border-2 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <div class="border-b bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 px-8 py-6 flex-shrink-0">
            <div class="flex items-center justify-between">
                <div>
                    <h2 class="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Account Management
                    </h2>
                    <p class="mt-1 text-sm text-muted-foreground">
                        Manage your Nostr identities
                    </p>
                </div>
                <button
                    onclick={onclose}
                    class="rounded-lg p-2 hover:bg-background/80 transition-colors"
                >
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>

        <div class="flex-1 overflow-y-auto p-8 space-y-6">
            {#if ndk.$sessions.all && ndk.$sessions.all.length > 0}
                <div>
                    <h3 class="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Your Accounts
                    </h3>
                    <div class="space-y-3">
                        {#each ndk.$sessions.all as session}
                            <div class="group relative overflow-hidden rounded-xl border-2 bg-gradient-to-r from-background to-secondary/20 p-4 transition-all hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-700">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-3">
                                        <Avatar {ndk} pubkey={session.pubkey} size={40} />
                                        <div>
                                            <div class="font-medium">{session.profile?.name || session.profile?.displayName || session.pubkey.substring(0, 16)}</div>
                                            {#if ndk.$sessions.current?.pubkey === session.pubkey}
                                                <Badge variant="default" class="mt-1">Active</Badge>
                                            {/if}
                                        </div>
                                    </div>
                                    <div class="flex gap-2">
                                        {#if ndk.$sessions.current?.pubkey !== session.pubkey}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                class="group-hover:border-purple-500 transition-colors"
                                                onclick={() => ndk.$sessions.switch(session.pubkey)}
                                            >
                                                Switch
                                            </Button>
                                        {/if}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            class="hover:bg-destructive/10 hover:text-destructive"
                                            onclick={() => ndk.$sessions.logout(session.pubkey)}
                                        >
                                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>

                <div class="border-t pt-6">
                    <h3 class="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Add New Account
                    </h3>
                </div>
            {/if}

            <div class="flex gap-2 p-1 rounded-lg bg-secondary/50">
                <Button
                    variant={loginMode === 'nip07' ? 'default' : 'ghost'}
                    class={loginMode === 'nip07' ? 'flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700' : 'flex-1'}
                    onclick={() => loginMode = 'nip07'}
                >
                    <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Extension
                </Button>
                <Button
                    variant={loginMode === 'nsec' ? 'default' : 'ghost'}
                    class={loginMode === 'nsec' ? 'flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700' : 'flex-1'}
                    onclick={() => loginMode = 'nsec'}
                >
                    <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    Private Key
                </Button>
            </div>

            {#if loginMode === 'nip07'}
                <div class="space-y-4">
                    <div class="rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 p-4">
                        <div class="flex gap-3">
                            <svg class="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p class="text-sm text-purple-900 dark:text-purple-100">
                                Login using a NIP-07 compatible browser extension like <strong>Alby</strong>, <strong>nos2x</strong>, or <strong>Flamingo</strong>.
                            </p>
                        </div>
                    </div>
                    <Button
                        class="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all"
                        onclick={handleNIP07Login}
                    >
                        <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        Connect Extension
                    </Button>
                </div>
            {:else}
                <div class="space-y-4">
                    <div class="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-4">
                        <div class="flex gap-3">
                            <svg class="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <p class="text-sm text-amber-900 dark:text-amber-100">
                                <strong>Warning:</strong> Only enter your private key if you trust this device. Consider using an extension instead.
                            </p>
                        </div>
                    </div>
                    <Input
                        type="password"
                        placeholder="nsec1... or hex private key"
                        class="h-12 text-base"
                        bind:value={privateKey}
                    />
                    <Button
                        class="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                        onclick={handlePrivateKeyLogin}
                        disabled={!privateKey}
                    >
                        <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        Login with Private Key
                    </Button>
                </div>
            {/if}

            {#if loginError}
                <div class="rounded-lg bg-destructive/10 border border-destructive/20 p-4">
                    <div class="flex gap-3">
                        <svg class="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p class="text-sm text-destructive font-medium">{loginError}</p>
                    </div>
                </div>
            {/if}
        </div>
    </Card>
    </div>
</div>
