import type { NDK } from "../../../ndk/index.js";
import { NDKEvent, type NostrEvent } from "../../index.js";
import { NDKKind } from "../index.js";

/**
 * NIP-87: Cashu Mint Announcement (kind 38172)
 *
 * Describes a Cashu mint, its capabilities, and network.
 */
export class NDKCashuMintAnnouncement extends NDKEvent {
    static kind = NDKKind.CashuMintAnnouncement;
    static kinds = [NDKKind.CashuMintAnnouncement];

    constructor(ndk?: NDK, event?: NostrEvent | NDKEvent) {
        super(ndk, event);
        this.kind ??= NDKKind.CashuMintAnnouncement;
    }

    static async from(event: NDKEvent): Promise<NDKCashuMintAnnouncement | undefined> {
        const mint = new NDKCashuMintAnnouncement(event.ndk, event);
        return mint;
    }

    /**
     * The mint's identifier (pubkey)
     */
    get identifier(): string | undefined {
        return this.tagValue("d");
    }

    set identifier(value: string | undefined) {
        this.removeTag("d");
        if (value) this.tags.push(["d", value]);
    }

    /**
     * The mint URL
     */
    get url(): string | undefined {
        return this.tagValue("u");
    }

    set url(value: string | undefined) {
        this.removeTag("u");
        if (value) this.tags.push(["u", value]);
    }

    /**
     * Supported NUT protocols
     */
    get nuts(): string[] {
        return this.getMatchingTags("nuts").map((t) => t[1]);
    }

    set nuts(values: string[]) {
        this.removeTag("nuts");
        for (const value of values) {
            this.tags.push(["nuts", value]);
        }
    }

    /**
     * Network (mainnet/testnet/signet/regtest)
     */
    get network(): string | undefined {
        return this.tagValue("n");
    }

    set network(value: string | undefined) {
        this.removeTag("n");
        if (value) this.tags.push(["n", value]);
    }

    /**
     * Optional metadata
     */
    get metadata(): Record<string, unknown> | undefined {
        if (!this.content) return undefined;
        try {
            return JSON.parse(this.content);
        } catch {
            return undefined;
        }
    }

    set metadata(value: Record<string, unknown> | undefined) {
        if (value) {
            this.content = JSON.stringify(value);
        } else {
            this.content = "";
        }
    }
}
