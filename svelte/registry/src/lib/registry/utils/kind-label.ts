/**
 * Map of known Nostr event kinds to their human-readable labels
 * Based on NIPs and common conventions
 */
const KIND_LABELS: Record<number, { singular: string; plural: string }> = {
	// NIP-01: Basic protocol
	0: { singular: 'Metadata', plural: 'Metadata' },
	1: { singular: 'Note', plural: 'Notes' },
	2: { singular: 'Relay Recommendation', plural: 'Relay Recommendations' },
	3: { singular: 'Follows', plural: 'Follows' },
	4: { singular: 'Encrypted Direct Message', plural: 'Encrypted Direct Messages' },
	5: { singular: 'Event Deletion', plural: 'Event Deletions' },
	6: { singular: 'Repost', plural: 'Reposts' },
	7: { singular: 'Reaction', plural: 'Reactions' },
	8: { singular: 'Badge Award', plural: 'Badge Awards' },
	9: { singular: 'Group Chat Message', plural: 'Group Chat Messages' },
	10: { singular: 'Group Chat Threaded Reply', plural: 'Group Chat Threaded Replies' },
	11: { singular: 'Thread', plural: 'Threads' },
	12: { singular: 'Group Thread Reply', plural: 'Group Thread Replies' },
	13: { singular: 'Seal', plural: 'Seals' },
	14: { singular: 'Direct Message', plural: 'Direct Messages' },
	15: { singular: 'File Message', plural: 'File Messages' },
	16: { singular: 'Generic Repost', plural: 'Generic Reposts' },
	17: { singular: 'Reaction to Website', plural: 'Reactions to Websites' },
	20: { singular: 'Picture', plural: 'Pictures' },
	21: { singular: 'Video', plural: 'Videos' },
	22: { singular: 'Short-form Portrait Video', plural: 'Short-form Portrait Videos' },

	// NIP-28: Public Chat
	40: { singular: 'Channel Creation', plural: 'Channel Creations' },
	41: { singular: 'Channel Metadata', plural: 'Channel Metadata' },
	42: { singular: 'Channel Message', plural: 'Channel Messages' },
	43: { singular: 'Channel Hide Message', plural: 'Channel Hide Messages' },
	44: { singular: 'Channel Mute User', plural: 'Channel Mute Users' },

	// Other kinds
	62: { singular: 'Request to Vanish', plural: 'Requests to Vanish' },
	64: { singular: 'Chess (PGN)', plural: 'Chess (PGN)' },
	818: { singular: 'Merge Request', plural: 'Merge Requests' },
	1018: { singular: 'Poll Response', plural: 'Poll Responses' },
	1021: { singular: 'Bid', plural: 'Bids' },
	1022: { singular: 'Bid Confirmation', plural: 'Bid Confirmations' },
	1040: { singular: 'OpenTimestamps', plural: 'OpenTimestamps' },
	1059: { singular: 'Gift Wrap', plural: 'Gift Wraps' },
	1063: { singular: 'File Metadata', plural: 'File Metadata' },
	1068: { singular: 'Poll', plural: 'Polls' },
	1111: { singular: 'Comment', plural: 'Comments' },
	1222: { singular: 'Voice Message', plural: 'Voice Messages' },
	1244: { singular: 'Voice Message Comment', plural: 'Voice Message Comments' },
	1311: { singular: 'Live Chat Message', plural: 'Live Chat Messages' },
	1337: { singular: 'Code Snippet', plural: 'Code Snippets' },
	1617: { singular: 'Git Patch', plural: 'Git Patches' },
	1621: { singular: 'Git Issue', plural: 'Git Issues' },
	1622: { singular: 'Git Reply', plural: 'Git Replies' },
	1630: { singular: 'General Status', plural: 'General Statuses' },
	1631: { singular: 'Music Status', plural: 'Music Statuses' },
	1632: { singular: 'Podcast Status', plural: 'Podcast Statuses' },
	1633: { singular: 'Video Status', plural: 'Video Statuses' },
	1971: { singular: 'Problem Tracker', plural: 'Problem Trackers' },
	1984: { singular: 'Report', plural: 'Reports' },
	1985: { singular: 'Label', plural: 'Labels' },
	1986: { singular: 'Relay Review', plural: 'Relay Reviews' },
	1987: { singular: 'AI Embedding', plural: 'AI Embeddings' },
	2003: { singular: 'Torrent', plural: 'Torrents' },
	2004: { singular: 'Torrent Comment', plural: 'Torrent Comments' },
	2022: { singular: 'Coinjoin Pool', plural: 'Coinjoin Pools' },
	4550: { singular: 'Community Post Approval', plural: 'Community Post Approvals' },
	7374: { singular: 'Cashu Wallet Event', plural: 'Cashu Wallet Events' },
	9041: { singular: 'Zap Goal', plural: 'Zap Goals' },
	9321: { singular: 'Nutzap', plural: 'Nutzaps' },
	9734: { singular: 'Zap Request', plural: 'Zap Requests' },
	9735: { singular: 'Zap', plural: 'Zaps' },
	9802: { singular: 'Highlight', plural: 'Highlights' },
	13194: { singular: 'Wallet Info', plural: 'Wallet Info' },
	17375: { singular: 'Cashu Wallet Event', plural: 'Cashu Wallet Events' },
	21000: { singular: 'Lightning Pub RPC', plural: 'Lightning Pub RPC' },
	22242: { singular: 'Client Authentication', plural: 'Client Authentications' },
	23194: { singular: 'Wallet Request', plural: 'Wallet Requests' },
	23195: { singular: 'Wallet Response', plural: 'Wallet Responses' },
	24133: { singular: 'Nostr Connect', plural: 'Nostr Connect' },
	24242: { singular: 'Blob', plural: 'Blobs' },
	27235: { singular: 'HTTP Auth', plural: 'HTTP Auth' },
	30388: { singular: 'Slide Set', plural: 'Slide Sets' },

	// NIP-23: Long-form Content
	30023: { singular: 'Article', plural: 'Articles' },

	// NIP-51: Lists
	10000: { singular: 'Mute List', plural: 'Mute Lists' },
	10001: { singular: 'Pin List', plural: 'Pin Lists' },
	10002: { singular: 'Relay List', plural: 'Relay Lists' },
	10003: { singular: 'Bookmark List', plural: 'Bookmark Lists' },
	10004: { singular: 'Communities List', plural: 'Communities Lists' },
	10005: { singular: 'Public Chats List', plural: 'Public Chats Lists' },
	10006: { singular: 'Blocked Relays List', plural: 'Blocked Relays Lists' },
	10007: { singular: 'Search Relays List', plural: 'Search Relays Lists' },
	10015: { singular: 'Interests List', plural: 'Interests Lists' },
	10030: { singular: 'Emoji List', plural: 'Emoji Lists' },

	// NIP-51: Categorized Lists
	30000: { singular: 'Categorized People List', plural: 'Categorized People Lists' },
	30001: { singular: 'Categorized Bookmarks List', plural: 'Categorized Bookmarks Lists' },
	30002: { singular: 'Relay Set', plural: 'Relay Sets' },
	30003: { singular: 'Bookmark Set', plural: 'Bookmark Sets' },
	30004: { singular: 'Curation Set', plural: 'Curation Sets' },
	30008: { singular: 'Profile Badge', plural: 'Profile Badges' },
	30009: { singular: 'Badge Definition', plural: 'Badge Definitions' },
	30015: { singular: 'Interest Set', plural: 'Interest Sets' },
	30017: { singular: 'Stall', plural: 'Stalls' },
	30018: { singular: 'Product', plural: 'Products' },
	30019: { singular: 'Marketplace UI', plural: 'Marketplace UIs' },
	30020: { singular: 'Product Sold as Auction', plural: 'Products Sold as Auctions' },
	30030: { singular: 'Emoji Set', plural: 'Emoji Sets' },
	30063: { singular: 'Release Artifact Set', plural: 'Release Artifact Sets' },
	30078: { singular: 'App-specific Data', plural: 'App-specific Data' },
	30311: { singular: 'Live Event', plural: 'Live Events' },
	30315: { singular: 'User Status', plural: 'User Statuses' },

	// NIP-90: Data Vending Machines
	5000: { singular: 'Job Request', plural: 'Job Requests' },
	6000: { singular: 'Job Result', plural: 'Job Results' },
	7000: { singular: 'Job Feedback', plural: 'Job Feedback' },

	// NIP-99: Classified Listings
	30402: { singular: 'Classified Listing', plural: 'Classified Listings' },
	30403: { singular: 'Draft Classified Listing', plural: 'Draft Classified Listings' },

	// Git & Wiki
	30617: { singular: 'Repository Announcement', plural: 'Repository Announcements' },
	30618: { singular: 'Repository State Announcement', plural: 'Repository State Announcements' },
	30818: { singular: 'Wiki Article', plural: 'Wiki Articles' },
	30819: { singular: 'Wiki Article Redirect', plural: 'Wiki Article Redirects' },

	// Other addressable kinds
	31234: { singular: 'Draft Event', plural: 'Draft Events' },
	31388: { singular: 'Link Set', plural: 'Link Sets' },
	31890: { singular: 'Feed', plural: 'Feeds' },
	31922: { singular: 'Date-based Calendar Event', plural: 'Date-based Calendar Events' },
	31923: { singular: 'Time-based Calendar Event', plural: 'Time-based Calendar Events' },
	31924: { singular: 'Calendar', plural: 'Calendars' },
	31925: { singular: 'Calendar Event RSVP', plural: 'Calendar Event RSVPs' },
	31989: { singular: 'App Handler Recommendation', plural: 'App Handler Recommendations' },
	31990: { singular: 'App Handler Information', plural: 'App Handler Information' },
	32267: { singular: 'Software Application', plural: 'Software Applications' },
	34550: { singular: 'Community Definition', plural: 'Community Definitions' },
	37516: { singular: 'Geocache', plural: 'Geocaches' },
	38172: { singular: 'Cashu Mint Announcement', plural: 'Cashu Mint Announcements' },
	38173: { singular: 'Cashu Proof', plural: 'Cashu Proofs' },
	38383: { singular: 'Peer-to-peer Order', plural: 'Peer-to-peer Orders' },
	39000: { singular: 'Group Metadata', plural: 'Group Metadata' },
	39001: { singular: 'Group Admin', plural: 'Group Admins' },
	39002: { singular: 'Group Member', plural: 'Group Members' },
	39003: { singular: 'Group Join Request', plural: 'Group Join Requests' },
	39004: { singular: 'Group Leave Request', plural: 'Group Leave Requests' },
	39005: { singular: 'Group Invite', plural: 'Group Invites' },
	39006: { singular: 'Group Kick', plural: 'Group Kicks' },
	39007: { singular: 'Group Ban', plural: 'Group Bans' },
	39008: { singular: 'Group Delete', plural: 'Group Deletes' },
	39009: { singular: 'Group Roles', plural: 'Group Roles' },
	39089: { singular: 'Starter Pack', plural: 'Starter Packs' },
	39092: { singular: 'Media Starter Pack', plural: 'Media Starter Packs' },
	39701: { singular: 'Web Bookmark', plural: 'Web Bookmarks' },
};

/**
 * Returns a human-readable label for a Nostr event kind
 *
 * @param kind - The Nostr event kind number
 * @param count - Optional count for pluralization (if > 1, returns plural form)
 * @returns Human-readable label for the kind, or the kind number as a string if not found
 *
 * @example
 * ```ts
 * kindLabel(30023) // => "Article"
 * kindLabel(30023, 1) // => "Article"
 * kindLabel(30023, 5) // => "Articles"
 * kindLabel(1) // => "Note"
 * kindLabel(1, 3) // => "Notes"
 * kindLabel(99999) // => "99999"
 * ```
 */
export function kindLabel(kind: number, count?: number): string {
	const label = KIND_LABELS[kind];

	if (!label) {
		return kind.toString();
	}

	// If count is provided and > 1, return plural form
	if (count !== undefined && count > 1) {
		return label.plural;
	}

	return label.singular;
}
