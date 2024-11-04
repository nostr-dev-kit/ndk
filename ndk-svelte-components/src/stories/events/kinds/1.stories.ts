import NDK from "@nostr-dev-kit/ndk";
import type { Meta, StoryObj } from "@storybook/svelte";

import Kind1Component from "../../../lib/event/content/Kind1.svelte";

/**
 * Renders a Kind 1 event content
 */

const meta = {
    title: "Event/Kinds/Kind 1 - Text note",
    component: Kind1Component,
    tags: ["autodocs"],
    argTypes: {
        ndk: {
            control: { type: null },
            type: { name: "other", value: "NDK", required: true },
            table: { type: { summary: "NDK" } },
            description:
                "The NDK instance you want to use. This should be already connected to relays.",
        },
        event: {
            control: { type: null },
            type: { name: "other", value: "NDKEvent", required: true },
            table: { type: { summary: "NDKEvent" } },
            description: "The event you want to render",
        },
    },
} satisfies Meta<Kind1Component>;

export default meta;
type Story = StoryObj<typeof meta>;

const ndk = new NDK({ explicitRelayUrls: ["wss://nos.lol"] });
await ndk.connect();

const id =
    "nevent1qqstuzqnw6czlugwszyj0z6gvffz8y27tsg4mfmnqnjqlj2vx5kac4cprpmhxue69uhhyetvv9ujumn0wd68yct5dyhxxmmdqgsx8zd7vjg70d5na8ek3m8g3lx3ghc8cp5d9sdm4epy0wd4aape6vsxrtmuk";
const event = await ndk.fetchEvent(id);

event.relay = undefined;
event.onRelays = [];

export const Kind1: Story = {
    args: {
        ndk,
        event,
    },
};
