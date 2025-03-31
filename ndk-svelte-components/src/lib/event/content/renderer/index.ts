import markedFootnote from "marked-footnote";
import Hashtag from "./hashtag.svelte";
import Link from "./link.svelte";
import Mention from "./mention.svelte";
import NostrEvent from "./nostr-event.svelte";

export default {
    link: Link,
    hashtag: Hashtag,
    mention: Mention,
    nostrEvent: NostrEvent,
};
