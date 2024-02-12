import NDK from "@nostr-dev-kit/ndk";
import type { Meta, StoryObj } from "@storybook/svelte";

import RelayList from "../../lib/relay/RelayList.svelte";

const meta = {
    title: "Relay/RelayList",
    component: RelayList,
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component:
                    "Displays a list of relays the NDK instance is connected to, along with information about active subscriptions and connectivity stats.",
            },
        },
    },
} satisfies Meta<RelayList>;

export default meta;

type Story = StoryObj<typeof meta>;

const ndk = new NDK({
    explicitRelayUrls: [
        "wss://relay.f7z.io",
        "wss://nos.lol",
        "wss://relay.damus.io",
        "wss://relay.snort.social",
        "wss://filter.nostr.wine/npub1zuuajd7u3sx8xu92yav9jwxpr839cs0kc3q6t56vd5u9q033xmhsk6c2uc?broadcast=true",
    ],
});
ndk.connect();
const pablo = ndk.getUser({npub: 'npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft'})
// pablo.fetchProfile()

const sub1 = ndk.subscribe({ limit: 10 }, { closeOnEose: false });
const sub2 = ndk.subscribe({ authors: [pablo.pubkey], kinds:[1]}, { groupable: true, subId: 'pablo-kind-1s'})
const sub3 = ndk.subscribe({ authors: [pablo.pubkey], kinds:[7]}, { groupable: true, subId: 'pablo-kind-7s'})

setTimeout(() => sub1.stop(), 1000)
setTimeout(() => sub2.stop(), 2000)
setTimeout(() => sub3.stop(), 5000)

export const Default: Story = {
    args: {
        ndk: ndk,
    },
};
