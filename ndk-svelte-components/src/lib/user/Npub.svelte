<script lang="ts">
import { copyToClipboard, truncatedBech32 } from "$lib/utils";
import type { NDKUser } from "@nostr-dev-kit/ndk";
import type NDK from "@nostr-dev-kit/ndk";
import { Check, Copy } from "lucide-svelte";
import { fade } from "svelte/transition";

/**
 * The NDK instance you want to use
 */
export let ndk: NDK;

/**
 * The npub of the user you want to display an avatar for
 */
export let npub: string | undefined = undefined;

/**
 * The hexpubkey of the user you want to display an avatar for
 */
export const pubkey: string | undefined = undefined;

/**
 * The user object of the user you want to display an avatar for
 */
export let user: NDKUser | undefined = undefined;

/**
 * Optionally specify the maximum length of the npub to display
 */
export const npubMaxLength: number | undefined = undefined;

if (!user) {
    const opts = npub ? { npub } : { pubkey };
    user = ndk.getUser(opts);
    npub = user.npub;
}

let _checkVisible = false;

function copyNpub() {
    copyToClipboard(npub);
    showCheck();
}

function showCheck() {
    _checkVisible = true;
    setTimeout(() => {
        _checkVisible = false;
    }, 1000);
}
</script>

<span class="name">
    {#if user && user.npub}
        <span class="npub {$$props.class}" style={$$props.style}>
            {npubMaxLength ? truncatedBech32(user.npub, npubMaxLength) : user.npub}
            <button on:click|preventDefault={copyNpub} class="npub--copyButton">
                <Copy size="16" />
            </button>
            {#if checkVisible}
                <span in:fade={{ duration: 100 }} out:fade>
                    <Check size="16" />
                </span>
            {/if}
        </span>
    {:else}
        <span class="npub--error {$$props.class}" style={$$props.style}> Error loading user </span>
    {/if}
</span>

<style lang="postcss">
    .npub {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 0.5rem;
    }

    .npub--copyButton {
        border: none;
        padding: 0.25rem;
        background-color: var(--color-bg);
        cursor: pointer;
    }
</style>
