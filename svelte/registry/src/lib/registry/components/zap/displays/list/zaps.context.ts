import type { ProcessedZap } from "@nostr-dev-kit/svelte";
import { getContext, setContext } from "svelte";

export interface ZapsStats {
    count: number;
    total: number;
    uniqueZappers: number;
}

export interface ZapsContext {
    zaps: ProcessedZap[];
    stats: ZapsStats;
}

const ZAPS_CONTEXT_KEY = Symbol.for("zaps");

export function setZapsContext(context: ZapsContext) {
    setContext(ZAPS_CONTEXT_KEY, context);
}

export function getZapsContext(): ZapsContext | undefined {
    return getContext<ZapsContext>(ZAPS_CONTEXT_KEY);
}
