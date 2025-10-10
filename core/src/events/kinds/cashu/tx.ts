import type { NDK } from "../../../ndk/index.js";
import { NDKEvent, type NDKEventId, type NDKTag, type NostrEvent } from "../../index.js";
import { NDKKind } from "../index.js";
import type { NDKCashuToken } from "./token.js";

const MARKERS = {
    REDEEMED: "redeemed",
    CREATED: "created",
    DESTROYED: "destroyed",
    RESERVED: "reserved",
} as const;

export type DIRECTIONS = "in" | "out";

/**
 * This class represents a balance change in the wallet, whether money being added or removed.
 */
export class NDKCashuWalletTx extends NDKEvent {
    static MARKERS = MARKERS;

    static kind = NDKKind.CashuWalletTx;
    static kinds = [NDKKind.CashuWalletTx];

    constructor(ndk?: NDK, event?: NostrEvent | NDKEvent) {
        super(ndk, event);
        this.kind ??= NDKKind.CashuWalletTx;
    }

    static async from(event: NDKEvent): Promise<NDKCashuWalletTx | undefined> {
        const walletChange = new NDKCashuWalletTx(event.ndk, event);

        const prevContent = walletChange.content;
        try {
            await walletChange.decrypt();
        } catch (_e) {
            walletChange.content ??= prevContent;
        }

        try {
            const contentTags = JSON.parse(walletChange.content);
            walletChange.tags = [...contentTags, ...walletChange.tags];
        } catch (_e) {
            return;
        }

        return walletChange;
    }

    set direction(direction: DIRECTIONS | undefined) {
        this.removeTag("direction");
        if (direction) this.tags.push(["direction", direction]);
    }

    get direction(): DIRECTIONS | undefined {
        return this.tagValue("direction") as DIRECTIONS | undefined;
    }

    set amount(amount: number) {
        this.removeTag("amount");
        this.tags.push(["amount", amount.toString()]);
    }

    get amount(): number | undefined {
        const val = this.tagValue("amount");
        if (val === undefined) return undefined;
        return Number(val);
    }

    set fee(fee: number) {
        this.removeTag("fee");
        this.tags.push(["fee", fee.toString()]);
    }

    get fee(): number | undefined {
        const val = this.tagValue("fee");
        if (val === undefined) return undefined;
        return Number(val);
    }

    set unit(unit: string | undefined) {
        this.removeTag("unit");
        if (unit) this.tags.push(["unit", unit.toString()]);
    }

    get unit(): string | undefined {
        return this.tagValue("unit");
    }

    set description(description: string | undefined) {
        this.removeTag("description");
        if (description) this.tags.push(["description", description.toString()]);
    }

    get description(): string | undefined {
        return this.tagValue("description");
    }

    set mint(mint: string | undefined) {
        this.removeTag("mint");
        if (mint) this.tags.push(["mint", mint.toString()]);
    }

    get mint(): string | undefined {
        return this.tagValue("mint");
    }

    /**
     * Tags tokens that were created in this history event
     */
    set destroyedTokens(events: NDKCashuToken[]) {
        for (const event of events) {
            this.tags.push(event.tagReference(MARKERS.DESTROYED));
        }
    }

    set destroyedTokenIds(ids: NDKEventId[]) {
        for (const id of ids) {
            this.tags.push(["e", id, "", MARKERS.DESTROYED]);
        }
    }

    /**
     * Tags tokens that were created in this history event
     */
    set createdTokens(events: NDKCashuToken[]) {
        for (const event of events) {
            this.tags.push(event.tagReference(MARKERS.CREATED));
        }
    }

    set reservedTokens(events: NDKCashuToken[]) {
        for (const event of events) {
            this.tags.push(event.tagReference(MARKERS.RESERVED));
        }
    }

    public addRedeemedNutzap(event: NDKEvent) {
        this.tag(event, MARKERS.REDEEMED);
    }

    async toNostrEvent(pubkey?: string): Promise<NostrEvent> {
        const encryptedTags: NDKTag[] = [];
        const unencryptedTags: NDKTag[] = [];

        for (const tag of this.tags) {
            if (!this.shouldEncryptTag(tag)) {
                unencryptedTags.push(tag);
            } else {
                encryptedTags.push(tag);
            }
        }

        this.tags = unencryptedTags.filter((t) => t[0] !== "client");
        this.content = JSON.stringify(encryptedTags);

        const user = await this.ndk?.signer?.user();

        if (user) {
            const ownPubkey = user.pubkey;
            // do not p-tag the owner
            this.tags = this.tags.filter((t) => t[0] !== "p" || t[1] !== ownPubkey);
        }

        await this.encrypt(user, undefined, "nip44");

        return super.toNostrEvent(pubkey) as unknown as NostrEvent;
    }

    /**
     * Whether this entry includes a redemption of a Nutzap
     */
    get hasNutzapRedemption(): boolean {
        return this.getMatchingTags("e", MARKERS.REDEEMED).length > 0;
    }

    private shouldEncryptTag(tag: NDKTag): boolean {
        const unencryptedTagNames = ["client"];
        if (unencryptedTagNames.includes(tag[0])) {
            return false;
        }

        if (tag[0] === "e" && tag[3] === MARKERS.REDEEMED) {
            return false;
        }

        if (tag[0] === "p") return false;

        return true;
    }
}
