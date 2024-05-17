import NDK from "@nostr-dev-kit/ndk";
import { NDKArticle } from "@nostr-dev-kit/ndk";
import type { Meta, StoryObj } from "@storybook/svelte";

import Kind30023Component from "../../../lib/event/content/Kind30023.svelte";

/**
 * Renders a Kind 30023 long-form article
 */

const meta = {
    title: "Event/Kinds/Kind 30023 - Long-form articles",
    component: Kind30023Component,
    tags: ["autodocs"],
    argTypes: {
        ndk: {
            control: { type: null },
            type: { name: "other", value: "NDK", required: true },
            table: { type: { summary: "NDK" } },
            description:
                "The NDK instance you want to use. This should be already connected to relays.",
        },
        article: {
            control: { type: null },
            type: { name: "other", value: "NDKArticle", required: true },
            table: { type: { summary: "NDKArticle" } },
            description: "The article you want to render",
        },
    },
} satisfies Meta<Kind30023Component>;

export default meta;
type Story = StoryObj<typeof meta>;

const ndk = new NDK({ explicitRelayUrls: ["wss://nos.lol"] });
await ndk.connect();

const id =
    "naddr1qvzqqqr4gupzq6ksswfdrw4r7mlh49qfu2k9u4zrtpextk955kquvpna3r4rq9vyqyfhwumn8ghj7ur4wfcxcetsv9njuetn9uq32amnwvaz7tmjv4kxz7fwv3sk6atn9e5k7tcpzamhxue69uhhyetvv9ujumn0wd68ytnzv9hxgtcpz3mhxue69uhhyetvv9ukzcnvv5hx7un89uq3zamnwvaz7tmwdaehgu3wwa5kuef0qqv9yetkd9jhw6twvuk4yetkd9jhwuedd3cxjmncvv3euyg7";
// Tony 'naddr1qqz82unvwvpzql6u9d8y3g8flm9x8frtz0xmsfyf7spq8xxkpgs8p2tge25p346aqvzqqqr4gupdy396';
// Der Gigi 'naddr1qqxnzd3cxqmrzv3exgmr2wfeqgsxu35yyt0mwjjh8pcz4zprhxegz69t4wr9t74vk6zne58wzh0waycrqsqqqa28pjfdhz';
const event = await ndk.fetchEvent(id);

event.relay = undefined;

const article = NDKArticle.from(event);

export const Kind30023: Story = {
    args: {
        ndk,
        article,
    },
};
