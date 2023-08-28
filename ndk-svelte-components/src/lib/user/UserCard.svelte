<script lang="ts">
    import type { NDKUser } from "@nostr-dev-kit/ndk";
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

    if (!user) {
        let opts = npub ? { npub } : { hexpubkey: pubkey };
        try {
            user = ndk.getUser(opts);
        } catch (e) {
            console.error(`error trying to get user`, { opts }, e);
        }
    }
</script>

{#await user?.fetchProfile()}
    <div class="userCard--loading {$$props.class}" style={$$props.style}>Loading user...</div>
{:then value}
    <div class="userCard {$$props.class}" style={$$props.style}>
        <div class="userCard--avatar">
            <Avatar {ndk} userProfile={user?.profile} class="userCard--avatar-img" />
        </div>
        <div class="userCard--details">
            <Name {ndk} userProfile={user?.profile} class="userCard--name" />
            <Nip05 {ndk} userProfile={user?.profile} class="userCard--nip05" />
            <Npub {ndk} {npub} {pubkey} {user} class="userCard--npub" />
            <div class="userCard--bio">{user?.profile?.bio || user?.profile?.about}</div>
        </div>
    </div>
{:catch error}
    <div class="userCard--error {$$props.class}" style={$$props.style}>Error fetching user</div>
{/await}

<style lang="postcss">
    .userCard {
        display: flex;
        flex-direction: row;
        align-items: start;
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
