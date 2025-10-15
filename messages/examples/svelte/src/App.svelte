<script lang="ts">
    import Login from "./components/Login.svelte";
    import MainWindow from "./components/MainWindow.svelte";
    import type { NDKSvelte } from "@nostr-dev-kit/svelte";
    import type { NDKMessenger } from "@nostr-dev-kit/messages";

    let isLoggedIn = $state(false);
    let ndk = $state<NDKSvelte | null>(null);
    let messenger = $state<NDKMessenger | null>(null);
    let isLoading = $state(false);

    function handleLogin(data: { ndk: NDKSvelte; messenger: NDKMessenger }) {
        ndk = data.ndk;
        messenger = data.messenger;
        isLoggedIn = true;
    }
</script>

{#if !isLoggedIn}
    <Login onLogin={handleLogin} bind:isLoading />
{:else if ndk && messenger}
    <MainWindow {ndk} {messenger} />
{/if}
