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
 * @param event
 * @param recipient
 * @param signer
 * @param params
 * @returns
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
    const _sender = sender || new NDKUser({ pubkey: event.pubkey });
    let _signer = signer;
    if (!_signer) {
        if (!event.ndk) throw new Error("no signer available for giftUnwrap");
        _signer = event.ndk.signer;
    }
    if (!signer) throw new Error("no signer");
    try {
        const seal = JSON.parse(await signer.decrypt(_sender, event.content, scheme)) as NostrEvent;
        if (!seal) throw new Error("Failed to decrypt wrapper");

        if (!new NDKEvent(undefined, seal).verifySignature(false))
            throw new Error("GiftSeal signature verification failed!");

        const rumorSender = new NDKUser({ pubkey: seal.pubkey });
        const rumor = JSON.parse(await signer.decrypt(rumorSender, seal.content, scheme));
        if (!rumor) throw new Error("Failed to decrypt seal");
        if (rumor.pubkey !== seal.pubkey) throw new Error("Invalid GiftWrap, sender validation failed!");

        return new NDKEvent(event.ndk, rumor as NostrEvent);
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
