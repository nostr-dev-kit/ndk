import type { NostrEvent } from "../../index.js";
import type { NDK } from "../../ndk/index.js";
import { NDKPrivateKeySigner } from "../../signers/private-key/index.js";
import { NDKEvent } from "../index.js";
import { NDKKind } from "./index.js";

/**
 * Represents a project event in Nostr (kind 31933).
 * Projects are a special type of article event used by TENEX and other project management tools.
 */
export class NDKProject extends NDKEvent {
    static kind = NDKKind.Project;
    static kinds = [NDKKind.Project];
    private _signer: NDKPrivateKeySigner | undefined;

    constructor(ndk?: NDK, rawEvent?: NostrEvent) {
        super(ndk, rawEvent);
        this.kind = NDKKind.Project;
    }

    static from(event: NDKEvent): NDKProject {
        return new NDKProject(event.ndk, event.rawEvent());
    }

    set repo(value: string | undefined) {
        this.removeTag("repo");
        if (value) this.tags.push(["repo", value]);
    }

    set hashtags(values: string[]) {
        this.removeTag("hashtags");
        if (values.filter((t) => t.length > 0).length) this.tags.push(["hashtags", ...values]);
    }

    get hashtags(): string[] {
        const tag = this.tags.find((tag) => tag[0] === "hashtags");
        return tag ? tag.slice(1) : [];
    }

    get repo(): string | undefined {
        return this.tagValue("repo");
    }

    get title(): string | undefined {
        return this.tagValue("title");
    }

    set title(value: string | undefined) {
        this.removeTag("title");
        if (value) this.tags.push(["title", value]);
    }

    get picture(): string | undefined {
        return this.tagValue("picture");
    }

    set picture(value: string | undefined) {
        this.removeTag("picture");
        if (value) this.tags.push(["picture", value]);
    }

    set description(value: string) {
        this.content = value;
    }

    get description(): string {
        return this.content;
    }

    /**
     * The project slug, derived from the 'd' tag.
     */
    get slug(): string {
        return this.dTag ?? "empty-dtag";
    }

    public async getSigner(): Promise<NDKPrivateKeySigner> {
        if (this._signer) return this._signer;

        const encryptedKey = this.tagValue("key");
        if (!encryptedKey) {
            this._signer = NDKPrivateKeySigner.generate();
            await this.encryptAndSaveNsec();
        } else {
            const decryptedKey = await this.ndk?.signer?.decrypt(this.ndk.activeUser!, encryptedKey);
            if (!decryptedKey) {
                throw new Error("Failed to decrypt project key or missing signer context.");
            }
            this._signer = new NDKPrivateKeySigner(decryptedKey);
        }

        return this._signer;
    }

    public async getNsec(): Promise<string> {
        const signer = await this.getSigner();
        return signer.privateKey!;
    }

    public async setNsec(value: string) {
        this._signer = new NDKPrivateKeySigner(value);
        await this.encryptAndSaveNsec();
    }

    private async encryptAndSaveNsec() {
        if (!this._signer) throw new Error("Signer is not set.");
        const key = this._signer.privateKey!;
        const encryptedKey = await this.ndk?.signer?.encrypt(this.ndk.activeUser!, key);
        if (encryptedKey) {
            this.removeTag("key");
            this.tags.push(["key", encryptedKey]);
        }
    }
}
