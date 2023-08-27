import UserCard from "$lib/user/UserCard.svelte";
import NDK from "@nostr-dev-kit/ndk";
import type { Meta, StoryObj } from "@storybook/svelte";

/**
 * Renders a user card with basic metadata info on the user.
 *
 * You can pass `class` or `style` props to the component to style the card itself.
 */

const meta = {
    title: "User/UserCard",
    component: UserCard,
    tags: ["autodocs"],
    argTypes: {
        ndk: {
            control: { type: null },
            type: { name: "other", value: "NDK", required: true },
            table: { type: { summary: "NDK" } },
            description:
                "The NDK instance you want to use. This should be already connected to relays.",
        },
        npub: {
            control: "text",
            type: "string",
            table: { type: { summary: "string" } },
            description: "The user's npub. Only one of `npub`, `pubkey`, or `user` is required.",
        },
        pubkey: {
            control: "text",
            type: "string",
            table: { type: { summary: "string" } },
            description:
                "The user's hex pubkey. Only one of `npub`, `pubkey`, or `user` is required.",
        },
        user: {
            control: { type: null },
            type: { name: "other", value: "NDKUser", required: false },
            table: { type: { summary: "NDKUser" } },
            description: "An NDKUser object. Only one of `npub`, `pubkey`, or `user` is required.",
        },
        class: {
            control: "text",
            type: "string",
            table: { type: { summary: "string" } },
            description: "Any classes you want applied to the `<img>` HTML element",
        },
        style: {
            control: "text",
            type: "string",
            table: { type: { summary: "string" } },
            description: "Any styles you want applied to the `<img>` HTML element",
        },
    },
} satisfies Meta<UserCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const ndk = new NDK({ explicitRelayUrls: ["wss://purplepag.es"] });
ndk.connect();

export const Default: Story = {
    args: {
        ndk: ndk,
        npub: "npub1zuuajd7u3sx8xu92yav9jwxpr839cs0kc3q6t56vd5u9q033xmhsk6c2uc",
    },
};

export const Nonexistent: Story = {
    args: {
        ndk: ndk,
        npub: "npub1vqtlp64gdfdqr64xq9g7t8qc9kyyns7nd23nnsf3mv94aqht8ensn29e34",
    },
};
