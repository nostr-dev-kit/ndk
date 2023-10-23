import NDK from "@nostr-dev-kit/ndk-svelte";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import type { Meta, StoryObj } from "@storybook/svelte";
import NDKCacheAdapterDexie from "@nostr-dev-kit/ndk-cache-dexie";

import EventThread from "../../lib/event/EventThread.svelte";

/**
 * Render an event as a thread.
 */

const meta = {
    title: "Event/EventThread",
    component: EventThread,
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
            type: { name: "other", value: "Event", required: true },
            table: { type: { summary: "NDKEvent" } },
            description: "The root event of the thread.",
        },
        skipEvent: {
            control: { type: "boolean" },
            type: { name: "boolean", required: false },
            table: { type: { summary: "boolean" } },
            description: "Skip rendering the root event; just render the events tagging this event",
            defaultValue: false,
        }
    },
} satisfies Meta<EventThread>;

export default meta;
type Story = StoryObj<typeof meta>;

const cacheAdapter = new NDKCacheAdapterDexie({ dbName: "ndk-svelte-components-storybook" });

const ndk = new NDK({
    explicitRelayUrls: ["wss://nos.lol"],
    enableOutboxModel: true,
    cacheAdapter
});
await ndk.connect();

const event = new NDKEvent(ndk, {
    "id": "9dcccd571449f26bd8505eb88fdb9b11dbe123635db918e31304a1b5e462536f",
    "pubkey": "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52",
    "created_at": 1697028628,
    "kind": 1,
    "tags": [],
    "content": "The new note view in my new upcoming client handles threads quite nicely.",
    "sig": "afb176fb960c87ec9456e7275cadf3b444d2de3be447f1e62c5e802715120685ff464070b33dcdb264225c52cf617600280838950585db38203c59ac9bb6737c"
});

export const Thread: Story = {
    args: {
        ndk,
        event
    },
};
