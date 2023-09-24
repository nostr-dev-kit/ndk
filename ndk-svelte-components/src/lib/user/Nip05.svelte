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

    let nip05Valid: boolean | null = null;

    if (!user) {
        let opts = npub ? { npub } : { hexpubkey: pubkey };
        try {
            user = ndk.getUser(opts);
        } catch (e) {
            console.error(`error trying to get user`, { opts }, e);
        }
    }
    
    // eslint-disable-next-line no-async-promise-executor
    const fetchProfilePromise = new Promise<NDKUserProfile>(async (resolve, reject) => {
        if (userProfile && userProfile.nip05) {
            nip05Valid = await user!.validateNip05(userProfile.nip05);
            resolve(userProfile);
        } else if (user) {
            user.fetchProfile()
                .then(async () => {
                    userProfile = user!.profile;
                    if (!userProfile?.nip05) reject;
                    nip05Valid = await user!.validateNip05(userProfile?.nip05!);
                    resolve(userProfile!);
                })
                .catch(() => {
                    reject;
                });
        } else {
            reject(`no user`);
        }
    });
</script>

<span class="name">
    {#await fetchProfilePromise}
        <span class="nip05 {$$props.class}" style={$$props.style}>
            <slot name="badge" {nip05Valid} />
        </span>
    {:then userProfile}
        <span class="nip05 {$$props.class}" style={$$props.style}>
            <slot name="badge" {nip05Valid} />
            {userProfile.nip05 ? prettifyNip05(userProfile.nip05, nip05MaxLength) : ""}
        </span>
    {:catch}
        <span class="nip05--error {$$props.class}" style={$$props.style}>
            <slot name="badge" {nip05Valid} />
            Error loading user profile
        </span>
    {/await}
</span>
