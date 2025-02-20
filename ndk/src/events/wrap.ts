import { NDKEvent } from ".";
import { NDKArticle } from "./kinds/article";
import { NDKCashuToken } from "./kinds/cashu/token";
import { NDKHighlight } from "./kinds/highlight";
import { NDKImage } from "./kinds/image";
import { NDKList } from "./kinds/lists";
import { NDKNutzap } from "./kinds/nutzap";
import { NDKCashuMintList } from "./kinds/nutzap/mint-list";
import { NDKSimpleGroupMemberList } from "./kinds/simple-group/member-list";
import { NDKSimpleGroupMetadata } from "./kinds/simple-group/metadata";
import { NDKSubscriptionTier } from "./kinds/subscriptions/tier";
import { NDKVideo } from "./kinds/video";
import { NDKWiki } from "./kinds/wiki";

export const eventWrappingMap = new Map();

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

export function wrapEvent<T extends NDKEvent>(event: NDKEvent): T | Promise<T> | NDKEvent {
    const klass = eventWrappingMap.get(event.kind);
    if (klass) return klass.from(event);
    return event;
}