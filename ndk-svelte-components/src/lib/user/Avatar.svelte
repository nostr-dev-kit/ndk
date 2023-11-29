<script lang="ts">
    import type { NDKUser, NDKUserProfile } from "@nostr-dev-kit/ndk";
    import type NDK from "@nostr-dev-kit/ndk";

    /**
     * The NDK instance you want to use
     */
    export let ndk: NDK | undefined = undefined;

    /**
     * The npub of the user you want to display an avatar for
     */
    export let npub: string | undefined = undefined;

    /**
     * The hexpubkey of the user you want to display an avatar for
     */
    export let pubkey: string | undefined = undefined;

    /**
     * The user object of the user you want to display an avatar for
     */
    export let user: NDKUser | undefined = undefined;

    /**
     * An NDKUserProfile object for the user you want to display an avatar for
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
            user.fetchProfile({
                closeOnEose: true,
                groupable: true,
                groupableDelay: 200,
            }).then(() => {
                userProfile = user!.profile;
                if (!userProfile) {
                    reject(`no profile`);
                } else {
                    resolve(userProfile);
                }
            }).catch(reject);
        } else {
            reject(`no user`);
        }
    });
</script>

{#await fetchProfilePromise}
    <img alt="" class="avatar avatar--loading {$$props.class}" style={$$props.style} />
{:then userProfile}
    <img
        src={userProfile?.image??""}
        alt=""
        class="avatar avatar--image {$$props.class}"
        style={$$props.style}
    />
{:catch error}
    <img
        alt=""
        class="avatar avatar--error {$$props.class}"
        data-error={error}
        style={$$props.style}
    />
{/await}

<style lang="postcss">
    .avatar {
        background-color: #ccc;
    }

    .avatar--loading {
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
        0%,
        100% {
            opacity: 1;
        }
        50% {
            opacity: 0.5;
        }
    }
</style>
