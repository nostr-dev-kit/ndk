import { nip19 } from "@nostr-dev-kit/ndk";

function isValidNip19(str: string): boolean {
    try {
        nip19.decode(str);
        return true;
    } catch {
        return false;
    }
}

function isNpub(str: string): boolean {
    try {
        const decoded = nip19.decode(str);
        return decoded.type === "npub";
    } catch {
        return false;
    }
}
