import type { NDK } from "../../../ndk/index.js";
import { NDKRelay } from "../../../relay/index.js";
import type { NDKFilter } from "../../../subscription/index.js";
import { NDKUser } from "../../../user/index.js";
import { NDKEvent } from "../../index.js";
import type { NDKEventId, NDKTag, NostrEvent } from "../../index.js";
import { NDKKind } from "../index.js";

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
 * @emits change
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
        this.kind ??= NDKKind.CategorizedBookmarkList;
    }

    /**
     * Wrap a NDKEvent into a NDKList
     */
    static from(ndkEvent: NDKEvent): NDKList {
        return new NDKList(ndkEvent.ndk, ndkEvent.rawEvent());
    }

    /**
     * Returns the title of the list. Falls back on fetching the name tag value.
     */
    get title(): string | undefined {
        const titleTag = this.tagValue("title") || this.tagValue("name");
        if (this.kind === NDKKind.Contacts && !titleTag) {
            return "Contacts";
        } else if (this.kind === NDKKind.MuteList && !titleTag) {
            return "Mute";
        } else if (this.kind === NDKKind.PinList && !titleTag) {
            return "Pinned Notes";
        } else if (this.kind === NDKKind.RelayList && !titleTag) {
            return "Relay Metadata";
        } else if (this.kind === NDKKind.BookmarkList && !titleTag) {
            return "Bookmarks";
        } else if (this.kind === NDKKind.CommunityList && !titleTag) {
            return "Communities";
        } else if (this.kind === NDKKind.PublicChatList && !titleTag) {
            return "Public Chats";
        } else if (this.kind === NDKKind.BlockRelayList && !titleTag) {
            return "Blocked Relays";
        } else if (this.kind === NDKKind.SearchRelayList && !titleTag) {
            return "Search Relays";
        } else if (this.kind === NDKKind.InterestList && !titleTag) {
            return "Interests";
        } else if (this.kind === NDKKind.EmojiList && !titleTag) {
            return "Emojis";
        } else {
            return titleTag ?? this.tagValue("d");
        }
    }

    /**
     * Sets the title of the list.
     */
    set title(title: string | undefined) {
        this.removeTag("title");
        this.removeTag("name");

        if (title) {
            this.tags.push(["title", title]);
        } else {
            throw new Error("Title cannot be empty");
        }
    }

    /**
     * Returns the name of the list.
     * @deprecated Please use "title" instead.
     */
    get name(): string | undefined {
        const nameTag = this.tagValue("name");
        if (this.kind === NDKKind.Contacts && !nameTag) {
            return "Contacts";
        } else if (this.kind === NDKKind.MuteList && !nameTag) {
            return "Mute";
        } else if (this.kind === NDKKind.PinList && !nameTag) {
            return "Pinned Notes";
        } else if (this.kind === NDKKind.RelayList && !nameTag) {
            return "Relay Metadata";
        } else if (this.kind === NDKKind.BookmarkList && !nameTag) {
            return "Bookmarks";
        } else if (this.kind === NDKKind.CommunityList && !nameTag) {
            return "Communities";
        } else if (this.kind === NDKKind.PublicChatList && !nameTag) {
            return "Public Chats";
        } else if (this.kind === NDKKind.BlockRelayList && !nameTag) {
            return "Blocked Relays";
        } else if (this.kind === NDKKind.SearchRelayList && !nameTag) {
            return "Search Relays";
        } else if (this.kind === NDKKind.InterestList && !nameTag) {
            return "Interests";
        } else if (this.kind === NDKKind.EmojiList && !nameTag) {
            return "Emojis";
        } else {
            return nameTag ?? this.tagValue("d");
        }
    }

    /**
     * Sets the name of the list.
     * @deprecated Please use "title" instead. This method will use the `title` tag instead.
     */
    set name(name: string | undefined) {
        this.removeTag("name");

        if (name) {
            this.tags.push(["title", name]);
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
     */
    async addItem(
        item: NDKListItem | NDKTag,
        mark: string | undefined = undefined,
        encrypted = false
    ): Promise<void> {
        if (!this.ndk) throw new Error("NDK instance not set");
        if (!this.ndk.signer) throw new Error("NDK signer not set");

        let tags: NDKTag[];

        if (item instanceof NDKEvent) {
            tags = item.referenceTags();
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

            currentList.push(...tags);

            this._encryptedTags = currentList;
            this.encryptedTagsLength = this.content.length;
            this.content = JSON.stringify(currentList);
            await this.encrypt(user);
        } else {
            this.tags.push(...tags);
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
