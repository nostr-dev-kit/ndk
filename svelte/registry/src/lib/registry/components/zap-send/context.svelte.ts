import type { NDKEvent, NDKUser } from "@nostr-dev-kit/ndk";
import type { NDKSvelte } from "@nostr-dev-kit/svelte";
import { getContext, setContext } from "svelte";

export interface ZapSendConfig {
    ndk: NDKSvelte;
    recipient: NDKEvent | NDKUser;
    splits?: Array<{ pubkey: string; amount: number }>;
}

const ZAP_SEND_CONTEXT_KEY = Symbol.for("zap-send");

export function setZapSendContext(config: ZapSendConfig) {
    setContext(ZAP_SEND_CONTEXT_KEY, config);
}

export function getZapSendContext(): ZapSendConfig {
    const ctx = getContext<ZapSendConfig>(ZAP_SEND_CONTEXT_KEY);
    if (!ctx) {
        throw new Error("ZapSend context not found. Make sure component is inside ZapSend.Root");
    }
    return ctx;
}
