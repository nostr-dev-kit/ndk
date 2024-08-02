import type { NDKEvent } from ".";
import type { NDKSubscriptionOptions } from "../subscription";
import { getReplyTag, getRootTag } from "../thread";

export async function fetchTaggedEvent(
    this: NDKEvent,
    tag: string,
    marker?: string
): Promise<NDKEvent | null | undefined> {
    if (!this.ndk) throw new Error("NDK instance not found");

    const t = this.getMatchingTags(tag, marker);

    if (t.length === 0) return undefined;

    const [_, id, hint] = t[0];

    let relay; //= hint !== "" ? this.ndk.pool.getRelay(hint) : undefined;

    // if we have a relay, attempt to use that first
    const event = await this.ndk.fetchEvent(id, {}, relay);

    return event;
}

export async function fetchRootEvent(
    this: NDKEvent,
    subOpts?: NDKSubscriptionOptions
): Promise<NDKEvent | null | undefined> {
    if (!this.ndk) throw new Error("NDK instance not found");
    const rootTag = getRootTag(this);
    if (!rootTag) return undefined;
    return this.ndk.fetchEventFromTag(rootTag, this, subOpts);
}

export async function fetchReplyEvent(
    this: NDKEvent,
    subOpts?: NDKSubscriptionOptions
): Promise<NDKEvent | null | undefined> {
    if (!this.ndk) throw new Error("NDK instance not found");
    const replyTag = getReplyTag(this);
    if (!replyTag) return undefined;
    return this.ndk.fetchEventFromTag(replyTag, this, subOpts);
}
