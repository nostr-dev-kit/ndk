import { NDKKind } from "../index.js";
import type { NostrEvent } from "../../index.js";
import { NDKEvent } from "../../index.js";
import type { NDK } from "../../../ndk/index.js";
import type { NDKRelaySet } from "../../../relay/sets/index.js";
import type { NDKRelay } from "../../../relay/index.js";
import type { Hexpubkey } from "../../../user/index.js";

export class NDKSimpleGroupMemberList extends NDKEvent {
    public relaySet: NDKRelaySet | undefined;
    public memberSet: Set<Hexpubkey> = new Set();

    static kind = NDKKind.GroupMembers;
    static kinds = [NDKKind.GroupMembers];

    constructor(ndk: NDK | undefined, rawEvent?: NostrEvent | NDKEvent) {
        super(ndk, rawEvent);
        this.kind ??= NDKKind.GroupMembers;

        this.memberSet = new Set(this.members);
    }

    static from(event: NDKEvent) {
        return new NDKSimpleGroupMemberList(event.ndk, event);
    }

    get members(): string[] {
        return this.getMatchingTags("p").map((tag) => tag[1]);
    }

    public hasMember(member: Hexpubkey): boolean {
        return this.memberSet.has(member);
    }

    public async publish(
        relaySet?: NDKRelaySet,
        timeoutMs?: number,
        requiredRelayCount?: number
    ): Promise<Set<NDKRelay>> {
        relaySet ??= this.relaySet;
        return super.publishReplaceable(relaySet, timeoutMs, requiredRelayCount);
    }
}
