import NDK, { NDKList } from "@nostr-dev-kit/ndk";
import type { Meta, StoryObj } from "@storybook/svelte";

import Kind30001 from "../../../../lib/event/content/Kind30001.svelte";

/**
 * Renders a Kind 30001 (Categorized Bookmarks) list.
 */

const meta = {
    title: "Event/Kinds/Lists/Kind 30001 - Categorized Bookmarks",
    component: Kind30001,
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
    "naddr1qqv5ummnw3fks6tjwssyxatnw3hk6etjypfx2anfv4msygxv35rjalwvvahuhtq57mxksf0dcdtku40t0p4z4967uq62dgpxevpsgqqqw5cswq0n3l";
const list = NDKList.from(await ndk.fetchEvent(id));

export const Default: Story = {
    args: {
        ndk,
        list,
    },
};
