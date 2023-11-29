<script lang="ts">
    import type { NDKUser, NDKUserProfile } from "@nostr-dev-kit/ndk";
    import type NDK from "@nostr-dev-kit/ndk";
    import { prettifyNip05 } from "$lib/utils/user";
    import { truncatedBech32 } from "$lib/utils";

    /**
     * The NDK instance you want to use
     */
    export let ndk: NDK | undefined = undefined;

    /**
     * The npub of the user you want to display a name for
     */
    export let npub: string | undefined = undefined;

    /**
     * The hexpubkey of the user you want to display a name for
     */
    export let pubkey: string | undefined = undefined;

    /**
     * The user object of the user you want to display a name for
     */
    export let user: NDKUser | undefined = undefined;

    /**
     * An NDKUserProfile object for the user you want to display a name for
     */
    export let userProfile: NDKUserProfile | undefined = undefined;

    /**
     * Optionally specify the maximum length of the npub to display if a name is not available
     */
    export let npubMaxLength: number | undefined = undefined;

    if (!userProfile && !user && ndk) {
        let opts = npub ? { npub } : { hexpubkey: pubkey };
        try {
            user = ndk.getUser(opts);
            npub = user.npub;
        } catch (e) {
            console.error(`error trying to get user`, { opts }, e);
        }
    }

    const _npub = npub || user?.npub;
    const truncatedNpub = npubMaxLength ? truncatedBech32(_npub as string, npubMaxLength) : _npub;

    function chooseNameFromDisplay(profile?: NDKUserProfile) {
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
            <span class="name--error {$$props.class}" data-error={error}>
                {truncatedNpub}
            </span>
        {/await}
    {/if}
</span>
