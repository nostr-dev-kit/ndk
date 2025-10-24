import type { NDKEvent } from "./index.js";
import { NDKArticle } from "./kinds/article.js";
import { NDKBlossomList } from "./kinds/blossom-list.js";
import { NDKFedimintMint } from "./kinds/cashu/fedimint.js";
import { NDKCashuMintAnnouncement } from "./kinds/cashu/mint.js";
import { NDKMintRecommendation } from "./kinds/cashu/mint-recommendation.js";
import { NDKClassified } from "./kinds/classified.js";
import { NDKDraft } from "./kinds/drafts.js";
import { NDKDVMJobFeedback } from "./kinds/dvm/feedback.js";
import { NDKFollowPack } from "./kinds/follow-pack.js";
import { NDKHighlight } from "./kinds/highlight.js";
import { NDKImage } from "./kinds/image.js";
import { NDKList } from "./kinds/lists/index.js";
import { NDKAppHandlerEvent } from "./kinds/nip89/app-handler.js";
import { NDKNutzap } from "./kinds/nutzap/index.js";
import { NDKCashuMintList } from "./kinds/nutzap/mint-list.js";
import { NDKProject } from "./kinds/project.js";
import { NDKProjectTemplate } from "./kinds/project-template.js";
import { NDKRelayList } from "./kinds/relay-list.js";
import { NDKRelayFeedList } from "./kinds/relay-feed-list.js";
import { NDKRepost } from "./kinds/repost.js";
import { NDKSimpleGroupMemberList } from "./kinds/simple-group/member-list.js";
import { NDKSimpleGroupMetadata } from "./kinds/simple-group/metadata.js";
import { NDKStory } from "./kinds/story.js";
import { NDKSubscriptionReceipt } from "./kinds/subscriptions/receipt.js";
import { NDKSubscriptionStart } from "./kinds/subscriptions/subscription-start.js";
import { NDKSubscriptionTier } from "./kinds/subscriptions/tier.js";
import { NDKTask } from "./kinds/task.js";
import { NDKThread } from "./kinds/thread.js";
import { NDKVideo } from "./kinds/video.js";
import { NDKWiki, NDKWikiMergeRequest } from "./kinds/wiki.js";

type NDKEventClass = {
    kinds: number[];
    from(event: NDKEvent): NDKEvent;
};

const registeredEventClasses = new Set<NDKEventClass>();

/**
 * Register a custom event class that can be used with wrapEvent().
 * The class must have a static 'kinds' property (array of numbers) and a static 'from' method.
 *
 * @param eventClass - The event class to register
 * @example
 * ```typescript
 * class MyCustomEvent extends NDKEvent {
 *     static kinds = [12345];
 *     static from(event: NDKEvent) {
 *         return new MyCustomEvent(event.ndk, event);
 *     }
 * }
 * registerEventClass(MyCustomEvent);
 * ```
 */
export function registerEventClass(eventClass: NDKEventClass): void {
    registeredEventClasses.add(eventClass);
}

/**
 * Unregister a previously registered event class.
 *
 * @param eventClass - The event class to unregister
 */
export function unregisterEventClass(eventClass: NDKEventClass): void {
    registeredEventClasses.delete(eventClass);
}

/**
 * Get all registered event classes.
 *
 * @returns Set of registered event classes
 */
export function getRegisteredEventClasses(): Set<NDKEventClass> {
    return new Set(registeredEventClasses);
}

export function wrapEvent<T extends NDKEvent>(event: NDKEvent): T | Promise<T> | NDKEvent {
    const eventWrappingMap = new Map();

    // Built-in event classes
    const builtInClasses = [
        NDKImage,
        NDKVideo,
        NDKCashuMintList,
        NDKArticle,
        NDKHighlight,
        NDKDraft,
        NDKWiki,
        NDKWikiMergeRequest,
        NDKNutzap,
        NDKProject,
        NDKTask,
        NDKProjectTemplate,
        NDKSimpleGroupMemberList,
        NDKSimpleGroupMetadata,
        NDKSubscriptionTier,
        NDKSubscriptionStart,
        NDKSubscriptionReceipt,
        NDKList,
        NDKRelayList,
        NDKRelayFeedList,
        NDKStory,
        NDKBlossomList,
        NDKFollowPack,
        NDKThread,
        NDKRepost,
        NDKClassified,
        NDKAppHandlerEvent,
        NDKDVMJobFeedback,
        NDKCashuMintAnnouncement,
        NDKFedimintMint,
        NDKMintRecommendation,
    ];

    // Combine built-in and registered classes
    const allClasses = [...builtInClasses, ...registeredEventClasses];

    for (const klass of allClasses) {
        for (const kind of klass.kinds) {
            eventWrappingMap.set(kind, klass);
        }
    }

    const klass = eventWrappingMap.get(event.kind);
    if (klass) return klass.from(event);
    return event;
}
