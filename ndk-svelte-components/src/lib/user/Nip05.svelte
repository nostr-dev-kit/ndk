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
     * The hexpubkey of the user you want to display a NIP-05 for
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

    if (!userProfile && !user) {
        let opts = npub ? { npub } : { hexpubkey: pubkey };
        try {
            user = ndk.getUser(opts);
        } catch (e) {
            console.error(`error trying to get user`, { opts }, e);
        }
    }

    const fetchProfilePromise = new Promise<NDKUserProfile>((resolve, reject) => {
        if (userProfile) {
            resolve(userProfile);
        } else if (user) {
            user.fetchProfile()
                .then(() => {
                    userProfile = user!.profile;
                    resolve(userProfile!);
                })
                .catch(reject);
        } else {
            reject(`no user`);
        }
    });
</script>

<span class="name">
    {#await fetchProfilePromise}
    {:then userProfile}
        <span class="nip05 {$$props.class}" style={$$props.style}>
            {prettifyNip05(userProfile)}
        </span>
    {:catch error}
        <span class="nip05--error {$$props.class}" style={$$props.style}>
            Error loading user profile
        </span>
    {/await}
</span>
