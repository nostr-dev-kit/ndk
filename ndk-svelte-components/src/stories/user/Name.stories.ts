import NDK from "@nostr-dev-kit/ndk";
import type { Meta, StoryObj } from "@storybook/svelte";

import Name from "../../lib/user/Name.svelte";

/**
 * Renders a user name, falling back depending on what values are available. The order used is:
 * 1. `user.userProfile.displayName`
 * 2. `user.userProfile.name`
 * 3. `user.userProfile.nip05`
 * 4. `npub` optionally truncated with the npubMaxLength param
 *
 * As with all components, you can pass `class` or `style` props to the component.
 * If no `class` or `style` prop is passed, default styles will render the name as normal text.
 */

const meta = {
    title: "User/Name",
    component: Name,
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
            description:
                "The user's npub. Only one of `npub`, `pubkey`, `user`, or `userProfile` is required.",
        },
        pubkey: {
            control: "text",
            type: "string",
            table: { type: { summary: "string" } },
            description:
                "The user's hex pubkey. Only one of `npub`, `pubkey`, `user`, or `userProfile` is required.",
        },
        user: {
            control: { type: null },
            type: { name: "other", value: "NDKUser", required: false },
            table: { type: { summary: "NDKUser" } },
            description:
                "An NDKUser object. Only one of `npub`, `pubkey`, `user`, or `userProfile` is required.",
        },
        userProfile: {
            control: { type: null },
            type: { name: "other", value: "NDKUserProfile", required: false },
            table: { type: { summary: "NDKUserProfile" } },
            description:
                "An NDKUserProfile object. Only one of `npub`, `pubkey`, `user`, or `userProfile` is required.",
        },
        npubMaxLength: {
            control: "number",
            type: "number",
            table: { type: { summary: "number" } },
            description: "The max length of the npub",
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
} satisfies Meta<Name>;

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
