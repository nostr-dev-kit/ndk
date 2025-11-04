/**
 * Map of known Nostr event kinds to their human-readable labels
 * Based on NIPs and common conventions
 */
const KIND_LABELS: Record<number, { singular: string; plural: string }> = {
	// NIP-01: Basic protocol
	0: { singular: 'Metadata', plural: 'Metadata' },
	1: { singular: 'Note', plural: 'Notes' },
	2: { singular: 'Relay Recommendation', plural: 'Relay Recommendations' },
	3: { singular: 'Contact List', plural: 'Contact Lists' },
	4: { singular: 'Encrypted Message', plural: 'Encrypted Messages' },
	5: { singular: 'Event Deletion', plural: 'Event Deletions' },
	6: { singular: 'Repost', plural: 'Reposts' },
	7: { singular: 'Reaction', plural: 'Reactions' },
	8: { singular: 'Badge Award', plural: 'Badge Awards' },

	// NIP-09: Event Deletion
	9: { singular: 'Generic Repost', plural: 'Generic Reposts' },

	// NIP-25: Reactions
	10: { singular: 'Generic Repost', plural: 'Generic Reposts' },

	// NIP-28: Public Chat
	40: { singular: 'Channel Creation', plural: 'Channel Creations' },
	41: { singular: 'Channel Metadata', plural: 'Channel Metadata' },
	42: { singular: 'Channel Message', plural: 'Channel Messages' },
	43: { singular: 'Channel Hide Message', plural: 'Channel Hide Messages' },
	44: { singular: 'Channel Mute User', plural: 'Channel Mute Users' },

	// NIP-57: Lightning Zaps
	9734: { singular: 'Zap Request', plural: 'Zap Requests' },
	9735: { singular: 'Zap Receipt', plural: 'Zap Receipts' },

	// NIP-58: Badges
	30008: { singular: 'Profile Badge', plural: 'Profile Badges' },
	30009: { singular: 'Badge Definition', plural: 'Badge Definitions' },

	// NIP-89: App Metadata
	31989: { singular: 'App Handler Recommendation', plural: 'App Handler Recommendations' },
	31990: { singular: 'App Handler Information', plural: 'App Handler Information' },

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
	30002: { singular: 'Relay Sets', plural: 'Relay Sets' },
	30003: { singular: 'Bookmark Sets', plural: 'Bookmark Sets' },
	30004: { singular: 'Curation Sets', plural: 'Curation Sets' },
	30015: { singular: 'Interest Sets', plural: 'Interest Sets' },
	30030: { singular: 'Emoji Sets', plural: 'Emoji Sets' },

	// NIP-90: Data Vending Machines
	5000: { singular: 'Job Request', plural: 'Job Requests' },
	6000: { singular: 'Job Result', plural: 'Job Results' },
	6001: { singular: 'Job Feedback', plural: 'Job Feedback' },
	7000: { singular: 'Job Feedback', plural: 'Job Feedback' },

	// NIP-94: File Metadata
	1063: { singular: 'File Metadata', plural: 'File Metadata' },

	// NIP-99: Classified Listings
	30402: { singular: 'Classified Listing', plural: 'Classified Listings' },

	// Other common kinds
	1984: { singular: 'Report', plural: 'Reports' },
	1985: { singular: 'Label', plural: 'Labels' },
	4550: { singular: 'Community Post Approval', plural: 'Community Post Approvals' },
	9041: { singular: 'Zap Goal', plural: 'Zap Goals' },
	34550: { singular: 'Community Definition', plural: 'Community Definitions' },
};

/**
 * Returns a human-readable label for a Nostr event kind
 *
 * @param kind - The Nostr event kind number
 * @param count - Optional count for pluralization (if > 1, returns plural form)
 * @returns Human-readable label for the kind, or "Unknown Event" if not found
 *
 * @example
 * ```ts
 * kindLabel(30023) // => "Article"
 * kindLabel(30023, 1) // => "Article"
 * kindLabel(30023, 5) // => "Articles"
 * kindLabel(1) // => "Note"
 * kindLabel(1, 3) // => "Notes"
 * kindLabel(99999) // => "Unknown Event"
 * ```
 */
export function kindLabel(kind: number, count?: number): string {
	const label = KIND_LABELS[kind];

	if (!label) {
		return 'Unknown Event';
	}

	// If count is provided and > 1, return plural form
	if (count !== undefined && count > 1) {
		return label.plural;
	}

	return label.singular;
}
