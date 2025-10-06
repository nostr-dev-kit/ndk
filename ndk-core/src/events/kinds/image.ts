import type { NDK } from "../../ndk";
import { imetaTagToTag, mapImetaTag, type NDKImetaTag } from "../../utils/imeta";
import type { NostrEvent } from "..";
import { NDKEvent } from "..";
import { NDKKind } from ".";

/**
 * Represents an image.
 * @kind 20
 * @group Kind Wrapper
 */
export class NDKImage extends NDKEvent {
    static kind = NDKKind.Image;
    static kinds = [NDKKind.Image];
    private _imetas: NDKImetaTag[] | undefined;

    constructor(ndk: NDK | undefined, rawEvent?: NostrEvent) {
        super(ndk, rawEvent);
        this.kind ??= NDKKind.Image;
    }

    /**
     * Creates a NDKImage from an existing NDKEvent.
     *
     * @param event NDKEvent to create the NDKImage from.
     * @returns NDKImage
     */
    static from(event: NDKEvent) {
        return new NDKImage(event.ndk, event.rawEvent());
    }

    get isValid(): boolean {
        return this.imetas.length > 0;
    }

    get imetas(): NDKImetaTag[] {
        if (this._imetas) return this._imetas;
        this._imetas = this.tags
            .filter((tag) => tag[0] === "imeta")
            .map(mapImetaTag)
            .filter((imeta) => !!imeta.url);
        return this._imetas;
    }

    set imetas(tags: NDKImetaTag[]) {
        this._imetas = tags;

        this.tags = this.tags.filter((tag) => tag[0] !== "imeta");
        this.tags.push(...tags.map(imetaTagToTag));
    }
}
