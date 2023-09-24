import NDK, { NDKList } from "@nostr-dev-kit/ndk";
import type { Meta, StoryObj } from "@storybook/svelte";

import Kind30000 from "../../../../lib/event/content/Kind30000.svelte";

/**
 * Renders a Kind 30000 (Categorized People) list.
 */

const meta = {
    title: "Event/Kinds/Lists/Kind 30000 - Categorized People",
    component: Kind30000,
    tags: ["autodocs"],
    argTypes: {
        ndk: {
            control: { type: null },
            type: { name: "other", value: "NDK", required: true },
            table: { type: { summary: "NDK" } },
            description:
                "The NDK instance you want to use. This should be already connected to relays.",
        },
        list: {
            control: { type: null },
            type: { name: "other", value: "NDKList", required: true },
            table: { type: { summary: "NDKList" } },
            description: "The kind 30001 event ID want to render",
        },
    },
} satisfies Meta<Kind30001>;

export default meta;
type Story = StoryObj<typeof meta>;

const ndk = new NDK({ explicitRelayUrls: ["wss://nos.lol"] });
await ndk.connect();

const id =
    "naddr1qq9yummnw3ezq3r9weesygqh88vn0hyvp3ehp238tpvn3sgeufwyrakygxjaxnrd8pgruvfkaupsgqqqw5cq9prfqc";
const list = NDKList.from(await ndk.fetchEvent(id));

export const Default: Story = {
    args: {
        ndk,
        list,
    },
};
