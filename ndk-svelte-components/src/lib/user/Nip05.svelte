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

    let nip05Valid: boolean | undefined = undefined;

    if (!userProfile && !user) {
        let opts = npub ? { npub } : { hexpubkey: pubkey };
        try {
            user = ndk.getUser(opts);
        } catch (e) {
            console.error(`error trying to get user`, { opts }, e);
        }
    }

    async function validNip05(pubkey: string | undefined, nip05: string | undefined): Promise<boolean | undefined> {
        // Return undefined if we can't validate
        if(!pubkey || !nip05) return undefined;

        let name: string | undefined = undefined;
        let domain: string | undefined = undefined;

        if (nip05.match(/@/)) {
            name = nip05.split("@")[0];
            domain = nip05.split("@")[1];
        } else if (
            nip05.match(
                /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
            )
        ) {
            name = "_";
            domain = nip05;
        }
        // Return undefined if we can't parse the value
        if (!domain) return undefined;

        const validOrNot = fetch(`https://${domain}/.well-known/nostr.json?name=${name}`)
            .then(async (response) => {
                if (response.status === 200) {
                    const wellKnown = await response.json();
                    // True if valid, false if exists but is invalid.
                    return wellKnown.names[name as string] === pubkey;
                }
                // Return undefined because bad responses don't necessarily mean invalid nip-05
                return undefined;
            })
            .catch((err) => {
                console.log("Error validating NIP-05", err);
                // Return undefined because bad responses don't necessarily mean invalid nip-05
                return undefined;
            });
        return validOrNot;
    }

    const fetchProfilePromise = new Promise<NDKUserProfile>(async (resolve, reject) => {
        if (userProfile) {
            nip05Valid = await validNip05(pubkey, userProfile.nip05);
            resolve(userProfile);
        } else if (user) {
            user.fetchProfile()
                .then(async () => {
                    userProfile = user!.profile;
                    nip05Valid = await validNip05(pubkey, userProfile?.nip05);
                    resolve(userProfile!);
                })
                .catch(() => {
                    reject
                });
        } else {
            reject(`no user`);
        }
    });
</script>

<span class="name">
    {#await fetchProfilePromise}
        <span class="nip05 {$$props.class}" style={$$props.style}>
            <slot name="badge" nip05Valid={nip05Valid} />
        </span>
    {:then userProfile}
        <span class="nip05 {$$props.class}" style={$$props.style}>
            <slot name="badge" nip05Valid={nip05Valid} />
            {userProfile.nip05 ? prettifyNip05(userProfile.nip05) : ""}
        </span>
    {:catch error}
        <span class="nip05--error {$$props.class}" style={$$props.style}>
            <slot name="badge" nip05Valid={nip05Valid} />
            Error loading user profile
        </span>
    {/await}
</span>
