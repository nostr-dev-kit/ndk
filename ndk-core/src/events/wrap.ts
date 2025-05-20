import type { NDKEvent } from "./index.js";
import { NDKArticle } from "./kinds/article.js";
import { NDKCashuToken } from "./kinds/cashu/token.js";
import { NDKHighlight } from "./kinds/highlight.js";
import { NDKImage } from "./kinds/image.js";
import { NDKList } from "./kinds/lists/index.js";
import { NDKNutzap } from "./kinds/nutzap/index.js";
import { NDKCashuMintList } from "./kinds/nutzap/mint-list.js";
import { NDKSimpleGroupMemberList } from "./kinds/simple-group/member-list.js";
import { NDKSimpleGroupMetadata } from "./kinds/simple-group/metadata.js";
import { NDKStory } from "./kinds/story.js";
import { NDKSubscriptionTier } from "./kinds/subscriptions/tier.js";
import { NDKVideo } from "./kinds/video.js";
import { NDKWiki } from "./kinds/wiki.js";
import { NDKBlossomList } from "./kinds/blossom-list.js";
import { NDKFollowPack } from "./kinds/follow-pack.js";
import { NDKDraft } from "src/index.js";

export function wrapEvent<T extends NDKEvent>(event: NDKEvent): T | Promise<T> | NDKEvent {
    const eventWrappingMap = new Map();
    for (const klass of [
        NDKImage,
        NDKVideo,
        NDKCashuMintList,
        NDKArticle,
        NDKHighlight,
        NDKDraft,
        NDKWiki,
        NDKNutzap,
        NDKSimpleGroupMemberList,
        NDKSimpleGroupMetadata,
        NDKSubscriptionTier,
        NDKCashuToken,
        NDKList,
        NDKStory,
        NDKBlossomList,
        NDKFollowPack,
    ]) {
        for (const kind of klass.kinds) {
            eventWrappingMap.set(kind, klass);
        }
    }

    const klass = eventWrappingMap.get(event.kind);
    if (klass) return klass.from(event);
    return event;
}
