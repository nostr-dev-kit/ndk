import type NDK from "@nostr-dev-kit/ndk";
import { NDKNip46Signer, NDKPrivateKeySigner, type NDKSigner } from "@nostr-dev-kit/ndk";
import type { SettingsStore } from "../types.js";
import { withNip46 } from "./nip46.js";
import { NDKNip55Signer } from "./nip55.js";

export async function withPrivateKey(key: string): Promise<NDKSigner | null> {
    return new NDKPrivateKeySigner(key);
}

export async function withNip55(payload: string): Promise<NDKSigner | null> {
    const [_type, packageName] = payload.split(" ");
    const signer = new NDKNip55Signer(packageName);
    try {
        const user = await signer.blockUntilReady();
        if (!user) return null;

        return signer;
    } catch (e) {
        console.error("NIP-55 SIGNER ERROR", e);
        return null;
    }
}

export async function withPayload(
    ndk: NDK,
    payload: string,
    settingsStore: SettingsStore
): Promise<NDKSigner | null> {
    if (payload.startsWith("nsec1")) return withPrivateKey(payload);

    if (payload.startsWith("nip55")) return withNip55(payload);

    let pk = await settingsStore.get("nip46.pk");
    let isNewKey = false;
    if (!pk) {
        const localSigner = NDKPrivateKeySigner.generate();
        pk = localSigner.privateKey;
        isNewKey = true;
    }

    const signer = await withNip46(ndk, payload, pk);

    if (signer instanceof NDKNip46Signer && isNewKey) {
        settingsStore.set("nip46.pk", pk);
    }

    return signer;
}
