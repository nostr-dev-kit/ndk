import type { NDK } from "../../../ndk/index.js";
import { NDKEvent, type NostrEvent } from "../../index.js";
import { NDKKind } from "../index.js";

/**
 * NIP-87: Fedimint Mint Announcement (kind 38173)
 *
 * Describes a Fedimint federation, its capabilities, and network.
 */
export class NDKFedimintMint extends NDKEvent {
    static kind = NDKKind.FedimintMintAnnouncement;
    static kinds = [NDKKind.FedimintMintAnnouncement];

    constructor(ndk?: NDK, event?: NostrEvent | NDKEvent) {
        super(ndk, event);
        this.kind ??= NDKKind.FedimintMintAnnouncement;
    }

    static async from(event: NDKEvent): Promise<NDKFedimintMint | undefined> {
        const mint = new NDKFedimintMint(event.ndk, event);
        return mint;
    }

    /**
     * The federation ID
     */
    get identifier(): string | undefined {
        return this.tagValue("d");
    }

    set identifier(value: string | undefined) {
        this.removeTag("d");
        if (value) this.tags.push(["d", value]);
    }

    /**
     * Invite codes (multiple allowed)
     */
    get inviteCodes(): string[] {
        return this.getMatchingTags("u").map((t) => t[1]);
    }

    set inviteCodes(values: string[]) {
        this.removeTag("u");
        for (const value of values) {
            this.tags.push(["u", value]);
        }
    }

    /**
     * Supported modules
     */
    get modules(): string[] {
        return this.getMatchingTags("modules").map((t) => t[1]);
    }

    set modules(values: string[]) {
        this.removeTag("modules");
        for (const value of values) {
            this.tags.push(["modules", value]);
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
