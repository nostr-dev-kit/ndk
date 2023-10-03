<script lang="ts">
    import type { NDKUser, NDKUserProfile } from "@nostr-dev-kit/ndk";
    import type NDK from "@nostr-dev-kit/ndk";
    import { prettifyNip05 } from "$lib/utils/user";

    /**
     * The NDK instance you want to use
     */
    export let ndk: NDK;

    /**
     * The npub of the user you want to display a NIP-05 for
     */
    export let npub: string | undefined = undefined;

    /**
     * The hexpubkey of the user you want to display a NIP-05 for, required in order to validate nip-05.
     */
    export let pubkey: string | undefined = undefined;

    /**
     * The user object of the user you want to display a NIP-05 for
     */
    export let user: NDKUser | undefined = undefined;

    /**
     * An NDKUserProfile object for the user you want to display a NIP-05 for
     */
    export let userProfile: NDKUserProfile | undefined = undefined;

    /**
     * Optionally specify the maximum length of the nip-05 to display
     */
    export let nip05MaxLength: number | undefined = undefined;

    if (!user) {
        let opts = npub ? { npub } : { hexpubkey: pubkey };
        try {
            user = ndk.getUser(opts);
        } catch (e) {
            console.error(`error trying to get user`, { opts }, e);
        }
    }

    interface validationResponse {
        valid: boolean | null,
        userProfile: NDKUserProfile | null
    }

    async function fetchAndValidate(): Promise<validationResponse> {
        // If we have a user profile and a NIP-05 value, validate.
        if(userProfile && userProfile.nip05) {
            return {
                valid: await user!.validateNip05(userProfile.nip05), 
                userProfile
            }
        // If we have a user, got get a profile and try to validate.
        } else if(user) {
            const profile = await user.fetchProfile();
            if(profile && profile.nip05) {
                return {
                    valid: await user!.validateNip05(profile.nip05), 
                    userProfile: profile
                }
            } else {
                return {
                    valid: null,
                    userProfile: profile
                }
            }
        // Otherwise fail gracefully
        } else {
            return {
                valid: null,
                userProfile: null
            }
        }
    }
</script>

<span class="name">
    {#await fetchAndValidate()}
        <span class="nip05 {$$props.class}" style={$$props.style}>
            <slot name="badge" nip05Valid={null} />
        </span>
    {:then validationResponse}
        <span class="nip05 {$$props.class}" style={$$props.style}>
            <slot name="badge" nip05Valid={validationResponse.valid} />
            <span class="truncate">
                {validationResponse.userProfile?.nip05 ? prettifyNip05(validationResponse.userProfile.nip05, nip05MaxLength) : ""}
            </span>
        </span>
    {:catch}
        <span class="nip05--error {$$props.class}" style={$$props.style}>
            <slot name="badge" nip05Valid={null} />
            <span class="truncate">Error loading user profile</span>
        </span>
    {/await}
</span>
