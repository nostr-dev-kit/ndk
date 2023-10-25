<script lang="ts">
    import type { NDKUser, NDKUserProfile } from "@nostr-dev-kit/ndk";
    import type NDK from "@nostr-dev-kit/ndk";
    import Avatar from "./Avatar.svelte";
    import Name from "./Name.svelte";
    import Nip05 from "./Nip05.svelte";
    import Npub from "./Npub.svelte";

    /**
     * The NDK instance you want to use
     */
    export let ndk: NDK;

    /**
     * The npub of the user you want to display a user card for
     */
    export let npub: string | undefined = undefined;

    /**
     * The hexpubkey of the user you want to display a user card for
     */
    export let pubkey: string | undefined = undefined;

    /**
     * The user object of the user you want to display a user card for
     */
    export let user: NDKUser | undefined = undefined;

    /**
     * An NDKUserProfile object for the user you want to display a name for
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
    <div class="userCard--loading {$$props.class}" style={$$props.style}>Loading user...</div>
{:then userProfile}
    <div class="userCard {$$props.class}" style={$$props.style}>
        <div class="userCard--avatar">
            <Avatar {ndk} {npub} {pubkey} {user} userProfile={userProfile || undefined} class="userCard--avatar-img" />
        </div>
        <div class="userCard--details">
            <Name {ndk} {npub} {pubkey} {user} userProfile={userProfile || undefined} class="userCard--name" />
            <Nip05 {ndk} {npub} {pubkey} {user} userProfile={userProfile || undefined} class="userCard--nip05" />
            <Npub {ndk} {npub} {pubkey} {user} class="userCard--npub" />
            <div class="userCard--bio">{userProfile?.bio || userProfile?.about}</div>
        </div>
    </div>
{:catch}
    <div class="userCard--error {$$props.class}" style={$$props.style}>Error fetching user</div>
{/await}

<style lang="postcss">
    .userCard {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        gap: 1rem;
        padding: 1rem;
        border: 1px solid var(--color-border);
        background-color: var(--color-bg);
        box-shadow: 0 0 0.5rem var(--color-shadow);
    }

    * > :global(.userCard--avatar img) {
        width: 96px;
        height: 96px;
        border-radius: 100%;
    }

    .userCard--details {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .userCard--bio {
        margin-top: 1rem;
    }
</style>
