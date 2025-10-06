/**
 * NIP-11: Relay Information Document
 * https://github.com/nostr-protocol/nips/blob/master/11.md
 */

export interface NDKRelayInformation {
    name?: string;
    description?: string;
    banner?: string;
    icon?: string;
    pubkey?: string;
    contact?: string;
    supported_nips?: number[];
    software?: string;
    version?: string;
    privacy_policy?: string;
    terms_of_service?: string;
    limitation?: {
        max_message_length?: number;
        max_subscriptions?: number;
        max_subid_length?: number;
        max_limit?: number;
        max_event_tags?: number;
        max_content_length?: number;
        min_pow_difficulty?: number;
        auth_required?: boolean;
        payment_required?: boolean;
        restricted_writes?: boolean;
        created_at_lower_limit?: number;
        created_at_upper_limit?: number;
        default_limit?: number;
    };
    retention?: Array<{
        kinds?: Array<number | [number, number]>;
        time?: number | null;
        count?: number;
    }>;
    relay_countries?: string[];
    language_tags?: string[];
    tags?: string[];
    posting_policy?: string;
    payments_url?: string;
    fees?: {
        admission?: Array<{
            amount: number;
            unit: string;
        }>;
        subscription?: Array<{
            amount: number;
            unit: string;
            period: number;
        }>;
        publication?: Array<{
            kinds?: number[];
            amount: number;
            unit: string;
        }>;
    };
    [key: string]: unknown;
}

/**
 * Fetches NIP-11 relay information document from a relay.
 *
 * @param relayUrl The WebSocket URL of the relay (e.g., "wss://relay.example.com")
 * @returns The relay information document
 * @throws Error if the fetch fails or returns invalid JSON
 */
export async function fetchRelayInformation(relayUrl: string): Promise<NDKRelayInformation> {
    // Convert wss:// to https:// and ws:// to http://
    const httpUrl = relayUrl.replace(/^wss:\/\//, "https://").replace(/^ws:\/\//, "http://");

    const response = await fetch(httpUrl, {
        headers: {
            Accept: "application/nostr+json",
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch relay information: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data as NDKRelayInformation;
}
