import { getEventHash } from "nostr-tools";
import type { NDKSigner } from "../signers/index.js";
import { NDKPrivateKeySigner } from "../signers/private-key";
import type { NDKEncryptionScheme } from "../types.js";
import { NDKUser } from "../user/index.js";
import { NDKEvent, type NDKRawEvent, type NostrEvent } from "./index.js";
import { NDKKind } from "./kinds/index.js";

export type GiftWrapParams = {
    scheme?: NDKEncryptionScheme;
    rumorKind?: number;
    wrapTags?: string[][];
};

/**
 * Instantiate a new (Nip59 gift wrapped) NDKEvent from any NDKEvent
 *
 * NIP-17 AI Guardrails - Common Mistakes to Avoid:
 * ❌ DON'T sign the rumor event before passing it to giftWrap (it should be unsigned)
 * ❌ DON'T use the wrapper's created_at for display - use the rumor's created_at
 * ❌ DON'T forget to publish to BOTH sender and recipient relays (per NIP-17)
 *
 * @param event - The rumor event to wrap (will auto-set pubkey if missing)
 * @param recipient - The recipient's NDKUser
 * @param signer - The signer (defaults to event.ndk.signer)
 * @param params - Optional parameters (scheme, rumorKind, wrapTags)
 * @returns The gift-wrapped event (kind 1059)
 */
export async function giftWrap(
    event: NDKEvent,
    recipient: NDKUser,
    signer?: NDKSigner,
    params: GiftWrapParams = {},
): Promise<NDKEvent> {
    let _signer = signer;
    params.scheme ??= "nip44";
    if (!_signer) {
        if (!event.ndk) throw new Error("no signer available for giftWrap");
        _signer = event.ndk.signer;
    }
    if (!_signer) throw new Error("no signer");
    if (!_signer.encryptionEnabled || !_signer.encryptionEnabled(params.scheme))
        throw new Error("signer is not able to giftWrap");

    // Auto-set pubkey if not present
    if (!event.pubkey) {
        const sender = await _signer.user();
        event.pubkey = sender.pubkey;
    }

    // AI Guardrail: Warn if the rumor is already signed
    if (event.sig) {
        console.warn(
            "⚠️ NIP-17 Warning: Rumor event should not be signed. The signature will be removed during gift wrapping.",
        );
    }

    const rumor = getRumorEvent(event, params?.rumorKind);
    const seal = await getSealEvent(rumor, recipient, _signer, params.scheme);
    const wrap = await getWrapEvent(seal, recipient, params);
    return new NDKEvent(event.ndk, wrap);
}

/**
 * Instantiate a new (Nip59 un-wrapped rumor) NDKEvent from any gift wrapped NDKEvent
 * @param event
 */
export async function giftUnwrap(
    event: NDKEvent,
    sender?: NDKUser,
    signer?: NDKSigner,
    scheme: NDKEncryptionScheme = "nip44",
): Promise<NDKEvent> {
    // Check cache first
    if (event.ndk?.cacheAdapter?.getDecryptedEvent) {
        const cached = await event.ndk.cacheAdapter.getDecryptedEvent(event.id);
        if (cached) {
            return cached;
        }
    }

    const _sender = sender || new NDKUser({ pubkey: event.pubkey });
    const _signer = signer || event.ndk?.signer;
    if (!_signer) throw new Error("no signer");

    try {
        const seal = JSON.parse(await _signer.decrypt(_sender, event.content, scheme)) as NostrEvent;
        if (!seal) throw new Error("Failed to decrypt wrapper");

        if (!new NDKEvent(undefined, seal).verifySignature(false))
            throw new Error("GiftSeal signature verification failed!");

        const rumorSender = new NDKUser({ pubkey: seal.pubkey });
        const rumor = JSON.parse(await _signer.decrypt(rumorSender, seal.content, scheme));
        if (!rumor) throw new Error("Failed to decrypt seal");
        if (rumor.pubkey !== seal.pubkey) throw new Error("Invalid GiftWrap, sender validation failed!");

        const rumorEvent = new NDKEvent(event.ndk, rumor as NostrEvent);

        // Cache the decrypted rumor using the wrapper ID as the key
        if (event.ndk?.cacheAdapter?.addDecryptedEvent) {
            await event.ndk.cacheAdapter.addDecryptedEvent(event.id, rumorEvent);
        }

        return rumorEvent;
    } catch (_e) {
        return Promise.reject("Got error unwrapping event! See console log.");
    }
}

function getRumorEvent(event: NDKEvent, kind?: number): NDKEvent {
    const rumor = event.rawEvent() as Partial<NDKRawEvent>;
    rumor.kind = kind || rumor.kind || NDKKind.PrivateDirectMessage;
    rumor.sig = undefined;
    rumor.id = getEventHash(rumor as any);
    return new NDKEvent(event.ndk, rumor);
}

async function getSealEvent(
    rumor: NDKEvent,
    recipient: NDKUser,
    signer: NDKSigner,
    scheme: NDKEncryptionScheme = "nip44",
): Promise<NDKEvent> {
    const seal = new NDKEvent(rumor.ndk);
    seal.kind = NDKKind.GiftWrapSeal;
    seal.created_at = approximateNow(5);
    seal.content = JSON.stringify(rumor.rawEvent());
    await seal.encrypt(recipient, signer, scheme);
    await seal.sign(signer);
    return seal;
}

async function getWrapEvent(
    sealed: NDKEvent,
    recipient: NDKUser,
    params?: GiftWrapParams,
    scheme: NDKEncryptionScheme = "nip44",
): Promise<NDKEvent> {
    const signer = NDKPrivateKeySigner.generate();

    const wrap = new NDKEvent(sealed.ndk);
    wrap.kind = NDKKind.GiftWrap;
    wrap.created_at = approximateNow(5);
    if (params?.wrapTags) wrap.tags = params.wrapTags;
    wrap.tag(recipient);
    wrap.content = JSON.stringify(sealed.rawEvent());
    await wrap.encrypt(recipient, signer, scheme);
    await wrap.sign(signer);
    return wrap;
}

function approximateNow(drift = 0) {
    return Math.round(Date.now() / 1000 - Math.random() * 10 ** drift);
}
