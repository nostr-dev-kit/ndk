import type { NDK } from "../../../ndk/index.js";
import { NDKRelay } from "../../../relay/index.js";
import type { NDKFilter } from "../../../subscription/index.js";
import { NDKUser } from "../../../user/index.js";
import { NDKEvent } from "../../index.js";
import type { NDKEventId, NDKTag, NostrEvent } from "../../index.js";
import { NDKKind } from "../index.js";

export type NDKListItem = NDKRelay | NDKUser | NDKEvent;

/**
 * Represents any NIP-51 list kind.
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
 * @emits change
 * @group Kind Wrapper
 */
export class NDKList extends NDKEvent {
    public _encryptedTags: NDKTag[] | undefined;

    /**
     * Stores the number of bytes the content was before decryption
     * to expire the cache when the content changes.
     */
    private encryptedTagsLength: number | undefined;

    constructor(ndk?: NDK, rawEvent?: NostrEvent | NDKEvent) {
        super(ndk, rawEvent);
        this.kind ??= NDKKind.CategorizedBookmarkList;
    }

    /**
     * Wrap a NDKEvent into a NDKList
     */
    static from(ndkEvent: NDKEvent): NDKList {
        return new NDKList(ndkEvent.ndk, ndkEvent);
    }

    /**
     * Returns the title of the list. Falls back on fetching the name tag value.
     */
    get title(): string | undefined {
        const titleTag = this.tagValue("title") || this.tagValue("name");
        if (titleTag) return titleTag;

        if (this.kind === NDKKind.Contacts) {
            return "Contacts";
        } else if (this.kind === NDKKind.MuteList) {
            return "Mute";
        } else if (this.kind === NDKKind.PinList) {
            return "Pinned Notes";
        } else if (this.kind === NDKKind.RelayList) {
            return "Relay Metadata";
        } else if (this.kind === NDKKind.BookmarkList) {
            return "Bookmarks";
        } else if (this.kind === NDKKind.CommunityList) {
            return "Communities";
        } else if (this.kind === NDKKind.PublicChatList) {
            return "Public Chats";
        } else if (this.kind === NDKKind.BlockRelayList) {
            return "Blocked Relays";
        } else if (this.kind === NDKKind.SearchRelayList) {
            return "Search Relays";
        } else if (this.kind === NDKKind.InterestList) {
            return "Interests";
        } else if (this.kind === NDKKind.EmojiList) {
            return "Emojis";
        } else {
            return this.tagValue("d");
        }
    }

    /**
     * Sets the title of the list.
     */
    set title(title: string | undefined) {
        this.removeTag(["title", "name"]);

        if (title) this.tags.push(["title", title]);
    }

    /**
     * Returns the name of the list.
     * @deprecated Please use "title" instead.
     */
    get name(): string | undefined {
        return this.title;
    }

    /**
     * Sets the name of the list.
     * @deprecated Please use "title" instead. This method will use the `title` tag instead.
     */
    set name(name: string | undefined) {
        this.title = name;
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
        this.removeTag("description");
        if (name) this.tags.push(["description", name]);
    }

    /**
     * Returns the image of the list.
     */
    get image(): string | undefined {
        return this.tagValue("image");
    }

    /**
     * Sets the image of the list.
     */
    set image(name: string | undefined) {
        this.removeTag("image");
        if (name) this.tags.push(["image", name]);
    }

    private isEncryptedTagsCacheValid(): boolean {
        return !!(this._encryptedTags && this.encryptedTagsLength === this.content.length);
    }

    /**
     * Returns the decrypted content of the list.
     */
    async encryptedTags(useCache = true): Promise<NDKTag[]> {
        if (useCache && this.isEncryptedTagsCacheValid()) return this._encryptedTags!;

        if (!this.ndk) throw new Error("NDK instance not set");
        if (!this.ndk.signer) throw new Error("NDK signer not set");

        const user = await this.ndk.signer.user();

        try {
            if (this.content.length > 0) {
                try {
                    const decryptedContent = await this.ndk.signer.decrypt(user, this.content);
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

    getItems(type: string): NDKTag[] {
        return this.tags.filter((tag) => tag[0] === type);
    }

    /**
     * Returns the unecrypted items in this list.
     */
    get items(): NDKTag[] {
        return this.tags.filter((t) => {
            return ![
                "d",
                "L",
                "l",
                "title",
                "name",
                "description",
                "published_at",
                "summary",
                "image",
                "thumb",
                "alt",
                "expiration",
                "subject",
                "client",
            ].includes(t[0]);
        });
    }

    /**
     * Adds a new item to the list.
     * @param relay Relay to add
     * @param mark Optional mark to add to the item
     * @param encrypted Whether to encrypt the item
     * @param position Where to add the item in the list (top or bottom)
     */
    async addItem(
        item: NDKListItem | NDKTag,
        mark: string | undefined = undefined,
        encrypted = false,
        position: "top" | "bottom" = "bottom"
    ): Promise<void> {
        if (!this.ndk) throw new Error("NDK instance not set");
        if (!this.ndk.signer) throw new Error("NDK signer not set");

        let tags: NDKTag[];

        if (item instanceof NDKEvent) {
            tags = [item.tagReference(mark)];
        } else if (item instanceof NDKUser) {
            tags = item.referenceTags();
        } else if (item instanceof NDKRelay) {
            tags = item.referenceTags();
        } else if (Array.isArray(item)) {
            // NDKTag
            tags = [item];
        } else {
            throw new Error("Invalid object type");
        }

        if (mark) tags[0].push(mark);

        if (encrypted) {
            const user = await this.ndk.signer.user();
            const currentList = await this.encryptedTags();

            if (position === "top") currentList.unshift(...tags);
            else currentList.push(...tags);

            this._encryptedTags = currentList;
            this.encryptedTagsLength = this.content.length;
            this.content = JSON.stringify(currentList);
            await this.encrypt(user);
        } else {
            if (position === "top") this.tags.unshift(...tags);
            else this.tags.push(...tags);
        }

        this.created_at = Math.floor(Date.now() / 1000);

        this.emit("change");
    }

    /**
     * Removes an item from the list from both the encrypted and unencrypted lists.
     * @param value value of item to remove from the list
     * @param publish whether to publish the change
     * @returns
     */
    async removeItemByValue(value: string, publish = true): Promise<Set<NDKRelay> | void> {
        if (!this.ndk) throw new Error("NDK instance not set");
        if (!this.ndk.signer) throw new Error("NDK signer not set");

        // check in unecrypted tags
        const index = this.tags.findIndex((tag) => tag[1] === value);
        if (index >= 0) {
            this.tags.splice(index, 1);
        }

        // check in encrypted tags
        const user = await this.ndk.signer.user();
        const encryptedTags = await this.encryptedTags();

        const encryptedIndex = encryptedTags.findIndex((tag) => tag[1] === value);
        if (encryptedIndex >= 0) {
            encryptedTags.splice(encryptedIndex, 1);
            this._encryptedTags = encryptedTags;
            this.encryptedTagsLength = this.content.length;
            this.content = JSON.stringify(encryptedTags);
            await this.encrypt(user);
        }

        if (publish) {
            return this.publishReplaceable();
        } else {
            this.created_at = Math.floor(Date.now() / 1000);
        }

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

    public has(item: string) {
        return this.items.some((tag) => tag[1] === item);
    }

    /**
     * Creates a filter that will result in fetching
     * the items of this list
     * @example
     * const list = new NDKList(...);
     * const filters = list.filterForItems();
     * const events = await ndk.fetchEvents(filters);
     */
    filterForItems(): NDKFilter[] {
        const ids = new Set<NDKEventId>();
        const nip33Queries = new Map<string, string[]>();
        const filters: NDKFilter[] = [];

        for (const tag of this.items) {
            if (tag[0] === "e" && tag[1]) {
                ids.add(tag[1]);
            } else if (tag[0] === "a" && tag[1]) {
                const [kind, pubkey, dTag] = tag[1].split(":");
                if (!kind || !pubkey) continue;

                const key = `${kind}:${pubkey}`;
                const item = nip33Queries.get(key) || [];
                item.push(dTag || "");
                nip33Queries.set(key, item);
            }
        }

        if (ids.size > 0) {
            filters.push({ ids: Array.from(ids) });
        }

        if (nip33Queries.size > 0) {
            for (const [key, values] of nip33Queries.entries()) {
                const [kind, pubkey] = key.split(":");
                filters.push({
                    kinds: [parseInt(kind)],
                    authors: [pubkey],
                    "#d": values,
                });
            }
        }

        return filters;
    }
}

export default NDKList;
