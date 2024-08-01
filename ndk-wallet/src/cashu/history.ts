import type { NDKTag, NostrEvent } from "@nostr-dev-kit/ndk";
import type NDK from "@nostr-dev-kit/ndk";
import { NDKEvent, NDKKind } from "@nostr-dev-kit/ndk";
import createDebug from "debug";

const d = createDebug("ndk-wallet:wallet-change");

const MARKERS = {
    REDEEMED: "redeemed",
    CREATED: "created",
    DESTROYED: "destroyed",
};

export class NDKWalletChange extends NDKEvent {
    static MARKERS = MARKERS;

    static kind = NDKKind.WalletChange;
    static kinds = [NDKKind.WalletChange];

    constructor(ndk?: NDK, event?: NostrEvent | NDKEvent) {
        super(ndk, event);
        this.kind ??= NDKKind.WalletChange;
    }

    static async from(event: NDKEvent): Promise<NDKWalletChange | undefined> {
        const walletChange = new NDKWalletChange(event.ndk, event);

        const prevContent = walletChange.content;
        try {
            await walletChange.decrypt();
        } catch (e) {
            walletChange.content ??= prevContent;
        }

        try {
            const contentTags = JSON.parse(walletChange.content);
            walletChange.tags = [...contentTags, ...walletChange.tags];
        } catch (e) {
            return;
        }

        return walletChange;
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

        const user = await this.ndk!.signer!.user();

        await this.encrypt(user);

        return super.toNostrEvent(pubkey) as unknown as NostrEvent;
    }

    /**
     * Whether this entry includes a redemption of a Nutzap
     */
    get hasNutzapRedemption(): boolean {
        return this.getMatchingTags("e", MARKERS.REDEEMED).length > 0;
    }

    private shouldEncryptTag(tag: NDKTag): boolean {
        const unencryptedTagNames = ["d", "client", "a"];
        if (unencryptedTagNames.includes(tag[0])) {
            return false;
        }

        if (tag[0] === "e" && tag[3] === MARKERS.REDEEMED) {
            return false;
        }

        return true;
    }
}
