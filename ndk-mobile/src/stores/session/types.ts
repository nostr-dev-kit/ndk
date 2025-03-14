import NDK, {
    NDKEvent,
    NDKKind,
    Hexpubkey,
    NDKUser,
    NDKList,
    NDKFilter,
    NDKSubscriptionOptions,
    NDKEventId,
} from "@nostr-dev-kit/ndk";
import { NDKEventWithFrom } from "../../hooks/subscribe.js";
import { SettingsStore } from "../../types.js";

export interface SessionInitCallbacks {
    onReady?: () => void;
    onWotReady?: () => void;
}

export type FollowOpts = { kinds: NDKKind[] };

export interface SessionInitOpts {
    /**
     * Whether to fetch the user's follows.
     *
     * This parameter can also be an object with per-kind follows to fetch.
     * This will fetch kind:967 with `k` tags for the given kinds.
     */
    follows?: boolean | FollowOpts;

    /**
     * Whether to fetch the user's mute list.
     */
    muteList?: boolean;

    /**
     * Number to use to compute the user's WoT.
     * @param false - Do not compute WoT.
     * @default 3
     */
    wot?: number | false;

    /**
     * Extra-kinds to fetch as part of the session initialization.
     */
    kinds?: Map<NDKKind, { wrapper?: NDKEventWithFrom<any> }>;

    /**
     * Extra filters to fetch as part of the session initialization.
     */
    filters?: (user: NDKUser) => NDKFilter[];

    /**
     * Extra options to pass to the subscription.
     */
    subOpts?: NDKSubscriptionOptions;
}

export interface SessionState {
    follows: string[] | undefined;
    muteListEvent: NDKList | undefined;
    mutedPubkeys: Set<Hexpubkey>;
    mutedHashtags: Set<string>;
    mutedWords: Set<string>;
    mutedEventIds: Set<NDKEventId>;
    events: Map<NDKKind, NDKEvent[]>;
    wot: Map<Hexpubkey, number>;
    ndk: NDK | undefined;

    init(
        ndk: NDK,
        user: NDKUser,
        settingsStore: SettingsStore,
        opts: SessionInitOpts,
        on: SessionInitCallbacks
    ): void;
    setMuteList: (muteList: NDKEvent) => void;
    setEvents: (kind: NDKKind, events: NDKEvent[]) => void;
    mute: (
        pubkey: Hexpubkey | string | NDKEvent,
        type?: "pubkey" | "hashtag" | "word" | "thread"
    ) => void;
    addEvent: (event: NDKEvent, onAdded?: () => Partial<SessionState>) => void;
}
