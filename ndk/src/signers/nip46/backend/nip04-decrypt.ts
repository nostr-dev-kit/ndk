import { NDKUser } from "../../../user/index.js";
import type { IEventHandlingStrategy, NDKNip46Backend } from "./index.js";

export default class Nip04DecryptHandlingStrategy implements IEventHandlingStrategy {
    async handle(
        backend: NDKNip46Backend,
        id: string,
        remotePubkey: string,
        params: string[]
    ): Promise<string | undefined> {
        const [senderPubkey, payload] = params;
        const senderUser = new NDKUser({ pubkey: senderPubkey });
        const decryptedPayload = await decrypt(backend, id, remotePubkey, senderUser, payload);

        return decryptedPayload;
    }
}

async function decrypt(
    backend: NDKNip46Backend,
    id: string,
    remotePubkey: string,
    senderUser: NDKUser,
    payload: string
) {
    if (
        !(await backend.pubkeyAllowed({
            id,
            pubkey: remotePubkey,
            method: "decrypt",
            params: payload,
        }))
    ) {
        backend.debug(`decrypt request from ${remotePubkey} rejected`);
        return undefined;
    }

    return await backend.signer.decrypt(senderUser, payload);
}
