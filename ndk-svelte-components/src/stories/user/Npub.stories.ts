import Npub from "$lib/user/Npub.svelte";
import NDK from "@nostr-dev-kit/ndk";
import type { Meta, StoryObj } from "@storybook/svelte";

/**
 * Renders a user's npub string.
 *
 * Displays a truncated version of a user's npub and an icon that allows user's to copy the npub.
 *
 * As with all components, you can pass `class` or `style` props to the component.
 * If no `class` or `style` prop is passed, default styles will render the name as normal text.
 */

const meta = {
    title: "User/Npub",
    component: Npub,
    tags: ["autodocs"],
    argTypes: {
        ndk: {
            control: { type: "object" },
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
    },
} satisfies Meta<Npub>;

export default meta;
type Story = StoryObj<typeof meta>;

const ndk = new NDK({ explicitRelayUrls: ["wss://purplepag.es"] });
ndk.connect();

export const Default: Story = {
    args: {
        ndk: ndk,
        npub: "npub1qny3tkh0acurzla8x3zy4nhrjz5zd8l9sy9jys09umwng00manysew95gx",
    },
};
