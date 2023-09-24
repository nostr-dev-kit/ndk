import NDK from "@nostr-dev-kit/ndk";
import type { Meta, StoryObj } from "@storybook/svelte";

import EventCard from "../../lib/event/EventCard.svelte";

/**
 * Renders an event's card
 */

const meta = {
    title: "Event/EventCard",
    component: EventCard,
    tags: ["autodocs"],
    argTypes: {
        ndk: {
            control: { type: null },
            type: { name: "other", value: "NDK", required: true },
            table: { type: { summary: "NDK" } },
            description:
                "The NDK instance you want to use. This should be already connected to relays.",
        },
        id: {
            control: { type: null },
            type: { name: "other", value: "Event", required: true },
            table: { type: { summary: "string" } },
            description: "The event ID you want to render in hex or bech32 format",
        },
    },
} satisfies Meta<EventCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const ndk = new NDK({ explicitRelayUrls: ["wss://nos.lol"] });
await ndk.connect();

const id = "note194n247lecqgcskk5rmmfgrapt4jx7ppq64xec0eca3s4ta3hwkrsex7pxa";

const withEmbeddedNoteId =
    "nevent1qqsrjpqwtmwy2aw0t745d6vdj6k267wjv5xjklek7ucr2pv65p2ydgspz9mhxue69uhkummnw3ezuamfdejj7qmsa3q";

const withImage = "note1np37t0mgh0ucuujf7lm7wawz42d8krcwc95cng9090yglcltpk7sgat8rs";

export const Kind1Event: Story = {
    args: {
        ndk,
        id,
    },
};

export const Kind1EventWithEmbeddedNote: Story = {
    args: {
        ndk,
        id: withEmbeddedNoteId,
    },
};

export const Kind1EventWithImage: Story = {
    args: {
        ndk,
        id: withImage,
    },
};
