import NDK, { NDKKind, NDKRelay, NDKUser } from "../../../index.js";
import NDKEvent from "../../index.js";
import { NDKTag, NostrEvent } from "../../index.js";

export type NDKListItem = NDKRelay | NDKUser | NDKEvent;

/**
 * Represents any NIP-33 list kind.
 *
 * This class provides some helper methods to manage the list, particularly
 * a CRUD interface to list items.
 *
 * List items can be encrypted or not. Encrypted items are JSON-encoded and
 * self-signed by the user's key.
 *
 * @example Adding an event to the list.
 * const event1 = new NDKEvent(...);
 * const list = new NDKList();
 * list.addItem(event1);
 *
 * @example Adding an encrypted `p` tag to the list with a "person" mark.
 * const secretFollow = new NDKUser(...);
 * list.addItem(secretFollow, 'person', true);
 *
 * @emits NDKList#change
 */
export class NDKList extends NDKEvent {
    public _encryptedTags: NDKTag[] | undefined;

    /**
     * Stores the number of bytes the content was before decryption
     * to expire the cache when the content changes.
     */
    private encryptedTagsLength: number | undefined;

    constructor(ndk?: NDK, rawEvent?: NostrEvent) {
        super(ndk, rawEvent);
        if (!this.kind) this.kind = NDKKind.CategorizedBookmarkList;
    }

    /**
     * Wrap a NDKEvent into a NDKList
     */
    static from(ndkEvent: NDKEvent): NDKList {
        return new NDKList(ndkEvent.ndk, ndkEvent.rawEvent());
    }

    /**
     * Returns the name of the list.
     */
    get name(): string | undefined {
        const nameTag = this.tagValue("name");
        if (this.kind === NDKKind.MuteList && !nameTag) {
            return "Mute";
        } else if (this.kind === NDKKind.PinList && !nameTag) {
            return "Pin";
        } else {
            return nameTag ?? this.tagValue("d");
        }
    }

    /**
     * Sets the name of the list.
     */
    set name(name: string | undefined) {
        this.removeTag("name");

        if (name) {
            this.tags.push(["name", name]);
        } else {
            throw new Error("Name cannot be empty");
        }
    }

    /**
     * Returns the description of the list.
     */
    get description(): string | undefined {
        return this.tagValue("description");
    }

    /**
     * Sets the description of the list.
     */
    set description(name: string | undefined) {
        if (name) {
            this.tags.push(["description", name]);
        } else {
            this.removeTag("description");
        }
    }

    private isEncryptedTagsCacheValid(): boolean {
        return !!(
            this._encryptedTags &&
            this.encryptedTagsLength === this.content.length
        );
    }

    /**
     * Returns the decrypted content of the list.
     */
    async encryptedTags(useCache = true): Promise<NDKTag[]> {
        if (useCache && this.isEncryptedTagsCacheValid())
            return this._encryptedTags!;

        if (!this.ndk) throw new Error("NDK instance not set");
        if (!this.ndk.signer) throw new Error("NDK signer not set");

        const user = await this.ndk.signer.user();

        try {
            if (this.content.length > 0) {
                try {
                    const decryptedContent = await this.ndk.signer.decrypt(
                        user,
                        this.content
                    );
                    const a = JSON.parse(decryptedContent);
                    if (a && a[0]) {
                        this.encryptedTagsLength = this.content.length;
                        return (this._encryptedTags = a);
                    }
                    this.encryptedTagsLength = this.content.length;
                    return (this._encryptedTags = []);
                } catch (e) {
                    console.log(`error decrypting ${this.content}`);
                }
            }
        } catch (e) {
            // console.trace(e);
            // throw e;
        }

        return [];
    }

    /**
     * This method can be overriden to validate that a tag is valid for this list.
     *
     * (i.e. the NDKPersonList can validate that items are NDKUser instances)
     */
    public validateTag(tagValue: string): boolean | string {
        return true;
    }

    /**
     * Returns the unecrypted items in this list.
     */
    get items(): NDKTag[] {
        return this.tags.filter((t) => {
            return !["d", "name", "description"].includes(t[0]);
        });
    }

    /**
     * Adds a new item to the list.
     * @param relay Relay to add
     * @param mark Optional mark to add to the item
     * @param encrypted Whether to encrypt the item
     */
    async addItem(
        item: NDKListItem | NDKTag,
        mark: string | undefined = undefined,
        encrypted = false
    ): Promise<void> {
        if (!this.ndk) throw new Error("NDK instance not set");
        if (!this.ndk.signer) throw new Error("NDK signer not set");

        let tag;

        if (item instanceof NDKEvent) {
            tag = item.tagReference();
        } else if (item instanceof NDKUser) {
            tag = item.tagReference();
        } else if (item instanceof NDKRelay) {
            tag = item.tagReference();
        } else if (Array.isArray(item)) {
            // NDKTag
            tag = item;
        } else {
            throw new Error("Invalid object type");
        }

        if (mark) tag.push(mark);

        if (encrypted) {
            const user = await this.ndk.signer.user();
            const currentList = await this.encryptedTags();

            currentList.push(tag);

            this._encryptedTags = currentList;
            this.encryptedTagsLength = this.content.length;
            this.content = JSON.stringify(currentList);
            await this.encrypt(user);
        } else {
            this.tags.push(tag);
        }

        this.created_at = Math.floor(Date.now() / 1000);

        this.emit("change");
    }

    /**
     * Removes an item from the list.
     *
     * @param index The index of the item to remove.
     * @param encrypted Whether to remove from the encrypted list or not.
     */
    async removeItem(index: number, encrypted: boolean): Promise<NDKList> {
        if (!this.ndk) throw new Error("NDK instance not set");
        if (!this.ndk.signer) throw new Error("NDK signer not set");

        if (encrypted) {
            const user = await this.ndk.signer.user();
            const currentList = await this.encryptedTags();

            currentList.splice(index, 1);
            this._encryptedTags = currentList;
            this.encryptedTagsLength = this.content.length;
            this.content = JSON.stringify(currentList);
            await this.encrypt(user);
        } else {
            this.tags.splice(index, 1);
        }

        this.created_at = Math.floor(Date.now() / 1000);

        this.emit("change");

        return this;
    }
}

export default NDKList;
