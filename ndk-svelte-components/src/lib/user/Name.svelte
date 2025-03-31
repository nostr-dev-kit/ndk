<script lang="ts">
import { truncatedBech32 } from "$lib/utils";
import { prettifyNip05 } from "$lib/utils/user";
import type { NDKUser, NDKUserProfile } from "@nostr-dev-kit/ndk";
import type NDK from "@nostr-dev-kit/ndk";

/**
 * The NDK instance you want to use
 */
export const ndk: NDK | undefined = undefined;

/**
 * The npub of the user you want to display a name for
 */
export let npub: string | undefined = undefined;

/**
 * The hexpubkey of the user you want to display a name for
 */
export const pubkey: string | undefined = undefined;

/**
 * The user object of the user you want to display a name for
 */
export let user: NDKUser | undefined = undefined;

/**
 * An NDKUserProfile object for the user you want to display a name for
 */
export const userProfile: NDKUserProfile | undefined = undefined;

/**
 * Optionally specify the maximum length of the npub to display if a name is not available
 */
export const npubMaxLength: number | undefined = undefined;

/**
 * Optionally specify the attribute to use for the name
 * @default 'display_name'
 */
export const attribute: "display_name" | "name" | string = "display_name";

if (!userProfile && !user && ndk) {
    const opts = npub ? { npub } : { pubkey };
    try {
        user = ndk?.getUser(opts);
        npub = user.npub;
    } catch (e) {
        console.error("error trying to get user", { opts }, e);
    }
}

const _npub = npub || user?.npub;
const truncatedNpub =
    npubMaxLength && _npub ? truncatedBech32(_npub as string, npubMaxLength) : _npub;

function chooseNameFromDisplay(profile?: NDKUserProfile) {
    if (profile?.[attribute]) return profile[attribute];

    return (
        profile?.displayName ||
        profile?.name ||
        (profile?.nip05 && prettifyNip05(profile.nip05, undefined)) ||
        truncatedNpub
    );
}
</script>

<span class="name {$$props.class}" style={$$props.style}>
    {#if userProfile}
        {chooseNameFromDisplay(userProfile)}
    {:else if user}
        {#await user.fetchProfile({ closeOnEose: true, groupable: true, groupableDelay: 200 })}
            {chooseNameFromDisplay()}
        {:then}
            {chooseNameFromDisplay(user.profile)}
        {:catch error}
            <span class="name--error {$$props.class}" data-error={error} title={_npub}>
                {truncatedNpub}
            </span>
        {/await}
    {/if}
</span>
