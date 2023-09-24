import NDK from "@nostr-dev-kit/ndk";
import type { Meta, StoryObj } from "@storybook/svelte";

import Kind1063Component from "../../../lib/event/content/Kind1063.svelte";

/**
 * Renders a Kind 1063 metadata event
 */

const meta = {
    title: "Event/Kinds/Kind 1063 - File metadata",
    component: Kind1063Component,
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
} satisfies Meta<Kind1063Component>;

export default meta;
type Story = StoryObj<typeof meta>;

const ndk = new NDK({ explicitRelayUrls: ["wss://nos.lol"] });
await ndk.connect();

const id = "nevent1qqs2vrx4ffqyq42yge95v3rfyr5gqr9z3pqpe7j7dymlk4lv3pwse6qfcjqkn";
const event = await ndk.fetchEvent(id);

event.relay = undefined;

export const Kind1063: Story = {
    args: {
        event,
    },
};
