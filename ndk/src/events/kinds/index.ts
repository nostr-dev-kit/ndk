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
    GenericRepost = 16,
    ChannelCreation = 40,
    ChannelMetadata = 41,
    ChannelMessage = 42,
    ChannelHideMessage = 43,
    ChannelMuteUser = 44,
    Report = 1984,
    Label = 1985,

    // NIP-90: Data Vending Machines
    // Text: 5000-5099
    DVMReqTextExtraction = 5000,
    DVMReqTextSummarization = 5001,
    DVMReqTextTranslation = 5002,
    DVMReqTextGeneration = 5050,

    // Image: 5100-5199
    DVMReqImageGeneration = 5100,

    // Discovery
    DVMReqDiscoveryNostrContent = 5300,
    DVMReqDiscoveryNostrPeople = 5301,

    // Event Timestamping
    DVMReqTimestamping = 5900,

    // Feedback
    DVMJobFeedback = 7000,

    ZapRequest = 9734,
    Zap = 9735,
    Highlight = 9802,
    MuteList = 10000,
    PinList = 10001,
    RelayList = 10002,
    ClientAuth = 22242,
    NostrConnect = 24133,
    CategorizedPeopleList = 30000,
    CategorizedBookmarkList = 30001,
    ProfileBadge = 30008,
    BadgeDefinition = 30009,
    InterestsList = 30015,
    MarketStall = 30017,
    MarketProduct = 30018,
    CategorizedRelayList = 30002,
    Article = 30023,
    AppSpecificData = 30078,
    Classified = 30402,

    // NIP-89: App Metadata
    AppRecommendation = 31989,
    AppHandler = 31990,

    CategorizedHighlightList = 39802,
}

export const NDKListKinds = [
    NDKKind.CategorizedPeopleList,
    NDKKind.CategorizedBookmarkList,
    NDKKind.CategorizedHighlightList,
    NDKKind.CategorizedRelayList,
    NDKKind.InterestsList,
];
