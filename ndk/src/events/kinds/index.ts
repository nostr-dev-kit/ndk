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

    // NIP-29
    GroupChat = 9,
    GroupNote = 11,
    GroupReply = 12,

    GenericRepost = 16,
    ChannelCreation = 40,
    ChannelMetadata = 41,
    ChannelMessage = 42,
    ChannelHideMessage = 43,
    ChannelMuteUser = 44,
    Media = 1063,
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

    // Recurring payments
    SubscriptionStart = 7001,
    SubscriptionStop = 7002,

    // NIP-29
    GroupAdminAddUser = 9000,
    GroupAdminRemoveUser = 9001,

    // Lists and Sets
    MuteList = 10000,
    PinList = 10001,
    RelayList = 10002,
    BookmarkList = 10003,
    CommunityList = 10004,
    PublicChatList = 10005,
    BlockRelayList = 10006,
    SearchRelayList = 10007,
    InterestList = 10015,
    EmojiList = 10030,
    TierList = 17000,
    SuperFollowList = 17001,

    FollowSet = 30000,
    CategorizedPeopleList = NDKKind.FollowSet, // Deprecated but left for backwards compatibility
    CategorizedBookmarkList = 30001, // Deprecated but left for backwards compatibility
    RelaySet = 30002,
    CategorizedRelayList = NDKKind.RelaySet, // Deprecated but left for backwards compatibility
    BookmarkSet = 30003,
    CurationSet = 30004,
    InterestSet = 30015,
    InterestsList = NDKKind.InterestSet, // Deprecated but left for backwards compatibility
    EmojiSet = 30030,
    HighlightSet = 39802,
    SubscriptionTier = 37001,
    CategorizedHighlightList = NDKKind.HighlightSet, // Deprecated but left for backwards compatibility

    ZapRequest = 9734,
    Zap = 9735,
    Highlight = 9802,
    ClientAuth = 22242,
    NostrConnect = 24133,
    NostrConnectAdmin = 24134,

    HttpAuth = 27235,

    ProfileBadge = 30008,
    BadgeDefinition = 30009,
    MarketStall = 30017,
    MarketProduct = 30018,
    Article = 30023,
    AppSpecificData = 30078,
    Classified = 30402,
    HorizontalVideo = 34235,

    GroupMembers = 39002, // NIP-29

    // NIP-89: App Metadata
    AppRecommendation = 31989,
    AppHandler = 31990,
}

export const NDKListKinds = [
    NDKKind.MuteList,
    NDKKind.PinList,
    NDKKind.RelayList,
    NDKKind.BookmarkList,
    NDKKind.CommunityList,
    NDKKind.PublicChatList,
    NDKKind.BlockRelayList,
    NDKKind.SearchRelayList,
    NDKKind.InterestList,
    NDKKind.EmojiList,
    NDKKind.FollowSet,
    NDKKind.BookmarkSet,
    NDKKind.CategorizedBookmarkList, // Backwards compatibility
    NDKKind.RelaySet,
    NDKKind.CurationSet,
    NDKKind.InterestSet,
    NDKKind.EmojiSet,
    NDKKind.HighlightSet,
];
