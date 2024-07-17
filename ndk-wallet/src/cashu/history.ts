import NDK, { NDKEvent, NDKKind, NDKTag, NostrEvent } from "@nostr-dev-kit/ndk";

const MARKERS = {
    REDEEMED: "redeemed",
    CREATED: "created",
    DESTROYED: "destroyed",
}

export class NDKWalletChange extends NDKEvent {
    static MARKERS = MARKERS;

    static kind = NDKKind.WalletChange;
    static kinds = [ NDKKind.WalletChange ];
    
    constructor(ndk?: NDK, event?: NostrEvent) {
        super(ndk, event);
        this.kind ??= NDKKind.WalletChange;
    }

    static async from(event: NDKEvent) {
        const walletChange = new NDKWalletChange(event.ndk, event.rawEvent() as NostrEvent);

        const prevContent = walletChange.content;
        try {
            await walletChange.decrypt();
            console.log(event.content);
        } catch (e) {
            console.error(e);
        }
        walletChange.content ??= prevContent;

        const contentTags = JSON.parse(walletChange.content);
        walletChange.tags = [...contentTags, ...walletChange.tags];
        
        return walletChange;
    }

    public addRedeemedNutzap(event: NDKEvent) {
        this.tag(event, MARKERS.REDEEMED);
    }

    async toNostrEvent(pubkey?: string): Promise<NostrEvent> {
        const encryptedTags: NDKTag[] = [];
        const unencryptedTags: NDKTag[] = [];

        for (const tag of this.tags) {
            if (!this.shouldEncrypt(tag)) { unencryptedTags.push(tag); }
            else { encryptedTags.push(tag); }
        }

        this.tags = unencryptedTags.filter(t => t[0] !== "client");
        this.content = JSON.stringify(encryptedTags);

        const user = await this.ndk!.signer!.user();

        await this.encrypt(user);
        
        return super.toNostrEvent(pubkey) as unknown as NostrEvent;
    }

    private shouldEncrypt(tag: NDKTag): boolean {
        const unencryptedTagNames = [ "d", "client", "a" ];
        if (unencryptedTagNames.includes(tag[0])) { return false; }

        if (tag[0] === "e" && tag[3] === MARKERS.REDEEMED) { return false; }
        
        return true;
    }
}