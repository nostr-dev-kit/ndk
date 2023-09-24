import NDK from "@nostr-dev-kit/ndk";
import type { Meta, StoryObj } from "@storybook/svelte";

import Kind9802Component from "../../../lib/event/content/Kind9802.svelte";

/**
 * Renders a Kind 9802 highlight event
 */

const meta = {
    title: "Event/Kinds/Kind 9802 - Highlights",
    component: Kind9802Component,
    tags: ["autodocs"],
    argTypes: {
        event: {
            control: { type: null },
            type: { name: "other", value: "NDKEvent", required: true },
            description: "The event you want to render",
        },
        showMedia: {
            control: { type: "boolean" },
            type: { required: false },
            description: "Whether or not to render media inline (images, video, audio)",
        },
    },
} satisfies Meta<Kind9802Component>;

export default meta;
type Story = StoryObj<typeof meta>;

const ndk = new NDK({ explicitRelayUrls: ["wss://nos.lol"] });
await ndk.connect();

const id =
    "nevent1qqsg643qyh3anmfmuqckt7dm082uk5qtlqpuv6z8c2fa45352sh502qzyphydppzm7m554ecwq4gsgaek2qk32atse2l4t9ks57dpms4mmhfx0qhfet";
const event = await ndk.fetchEvent(id);

event.relay = undefined;

export const Kind9802: Story = {
    args: {
        ndk,
        event,
    },
};
