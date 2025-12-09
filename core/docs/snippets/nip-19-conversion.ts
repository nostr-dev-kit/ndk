import { nip19 } from "@nostr-dev-kit/ndk";

// Convert hex pubkey to npub
function hexToNpub(hexPubkey: string): string {
    return nip19.npubEncode(hexPubkey);
}

// Extract pubkey from any NIP-19 identifier
function extractPubkey(nip19String: string): string | undefined {
    const decoded = nip19.decode(nip19String);

    switch (decoded.type) {
        case "npub":
            return decoded.data;
        case "nprofile":
            return decoded.data.pubkey;
        case "naddr":
            return decoded.data.pubkey;
        case "nevent":
            return decoded.data.author;
        default:
            return undefined;
    }
}
