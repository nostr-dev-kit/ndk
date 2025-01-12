import NDK, { NDKArticle, type NDKEvent } from "@nostr-dev-kit/ndk";
import type { Meta, StoryObj } from "@storybook/svelte";

import EventContent from "../../lib/event/content/EventContent.svelte";

/**
 * Renders an event's content
 */

const meta: Meta<typeof EventContent> = {
    title: "Event/EventContent",
    component: EventContent,
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
            description: "The event you want to render.",
        },
    },
} satisfies Meta<EventContent>;

export default meta;
type Story = StoryObj<typeof meta>;

const ndk = new NDK({ explicitRelayUrls: ["wss://relay.nostr.band"] });
ndk.connect();

let event: NDKEvent;
let article: NDKEvent;

ndk.fetchEvent("note194n247lecqgcskk5rmmfgrapt4jx7ppq64xec0eca3s4ta3hwkrsex7pxa").then(
    (e) => (event = e!)
);

article = await ndk.fetchEvent("naddr1qqxnzdejxyurxveexymnxwfeqgsg3nqnfvdxta2w7j9vc80nvegx85l2ghcya2u273jxu4sutt5eq7grqsqqqa286jzgn2")
// article = await ndk.fetchEvent("naddr1qvzqqqr4gupzqkcpsw4kc03j906dg8rt8thes432z3yy0d6fj4phylz48xs3g437qy88wumn8ghj7mn0wvhxcmmv9uqq6vfhxg6rjd33x5cnvd33xcvvu6c4")
article.relay = undefined;

export const Kind1Event: Story = {
    args: {
        ndk,
        event,
    },
};

export const Kind30023Event: Story = {
    args: {
        ndk,
        event: article,
    },
};
