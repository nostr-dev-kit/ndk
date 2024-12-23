import NDK, { NDKEvent, NDKKind, Hexpubkey, NDKUser, NDKList } from '@nostr-dev-kit/ndk';
import { NDKEventWithFrom } from '../../hooks/subscribe';
import { SettingsStore } from '../../types';

export interface SessionInitCallbacks {
    onReady?: () => void;
    onWotReady?: () => void;
}

export interface SessionInitOpts {
    /**
     * Whether to fetch the user's follows.
     */
    follows?: boolean;
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
}

export interface SessionState {
    follows: string[] | undefined;
    muteListEvent: NDKList | undefined;
    muteList: Set<Hexpubkey>;
    events: Map<NDKKind, NDKEvent[]>;
    wot: Map<Hexpubkey, number>;
    randomId: string;
    ndk: NDK | undefined;

    init(ndk: NDK, user: NDKUser, settingsStore: SettingsStore, opts: SessionInitOpts, on: SessionInitCallbacks): void;
    setMuteList: (muteList: NDKEvent) => void;
    setEvents: (kind: NDKKind, events: NDKEvent[]) => void;
    mutePubkey: (pubkey: Hexpubkey) => void;
    addEvent: (event: NDKEvent, onAdded?: () => Partial<SessionState>) => void;
} 