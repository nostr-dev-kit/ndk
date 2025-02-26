import { NDKEvent } from "./index.js";
import { NDKArticle } from "./kinds/article.js";
import { NDKCashuToken } from "./kinds/cashu/token.js";
import { NDKHighlight } from "./kinds/highlight.js";
import { NDKImage } from "./kinds/image.js";
import { NDKList } from "./kinds/lists/index.js";
import { NDKNutzap } from "./kinds/nutzap/index.js";
import { NDKCashuMintList } from "./kinds/nutzap/mint-list.js";
import { NDKSimpleGroupMemberList } from "./kinds/simple-group/member-list.js";
import { NDKSimpleGroupMetadata } from "./kinds/simple-group/metadata.js";
import { NDKSubscriptionTier } from "./kinds/subscriptions/tier.js";
import { NDKVideo } from "./kinds/video.js";
import { NDKWiki } from "./kinds/wiki.js";

export function wrapEvent<T extends NDKEvent>(event: NDKEvent): T | Promise<T> | NDKEvent {
    const eventWrappingMap = new Map();
    [
        NDKImage,
        NDKVideo,
        NDKCashuMintList,
        NDKArticle,
        NDKHighlight,
        NDKWiki,
        NDKNutzap,
        NDKSimpleGroupMemberList,
        NDKSimpleGroupMetadata,
        NDKSubscriptionTier,
        NDKCashuToken,
        NDKList,
    ].forEach((klass) => {
        klass.kinds.forEach((kind) => {
            eventWrappingMap.set(kind, klass);
        });
    });

    const klass = eventWrappingMap.get(event.kind);
    if (klass) return klass.from(event);
    return event;
}
