import NDKEvent from "./index.js";

export enum NDKKind {
    Metadata = 0,
    Text = 1,
    RecommendRelay = 2,
    Contacts = 3,
    EncryptedDirectMessage = 4,
    EventDeletion = 5,
    Repost = 6,
    Reaction = 7,
    BadgeAward = 8,
    ChannelCreation = 40,
    ChannelMetadata = 41,
    ChannelMessage = 42,
    ChannelHideMessage = 43,
    ChannelMuteUser = 44,
    Report = 1984,
    ZapRequest = 9734,
    Zap = 9735,
    MuteList = 10000,
    PinList = 10001,
    RelayList = 10002,
    ClientAuth = 22242,
    NostrConnect = 24133,
    CategorizedPeopleList = 30000,
    CategorizedBookmarkList = 30001,
    ProfileBadge = 30008,
    BadgeDefinition = 30009,
    Article = 30023,
    AppSpecificData = 30078
}

export function isReplaceable(this: NDKEvent): boolean {
    if (this.kind === undefined) throw new Error("Kind not set");
    return this.kind >= 10000 && this.kind < 20000;
}

export function isEphemeral(this: NDKEvent): boolean {
    if (this.kind === undefined) throw new Error("Kind not set");
    return this.kind >= 20000 && this.kind < 30000;
}

export function isParamReplaceable(this: NDKEvent): boolean {
    if (this.kind === undefined) throw new Error("Kind not set");
    return this.kind >= 30000 && this.kind < 40000;
}
