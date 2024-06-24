import { NDKUser } from "../../../user/index.js";
import type { IEventHandlingStrategy, NDKNip46Backend } from "./index.js";

export default class Nip04EncryptHandlingStrategy implements IEventHandlingStrategy {
    async handle(
        backend: NDKNip46Backend,
        id: string,
        remotePubkey: string,
        params: string[]
    ): Promise<string | undefined> {
        const [recipientPubkey, payload] = params;
        const recipientUser = new NDKUser({ pubkey: recipientPubkey });
        const encryptedPayload = await encrypt(backend, id, remotePubkey, recipientUser, payload);

        return encryptedPayload;
    }
}

async function encrypt(
    backend: NDKNip46Backend,
    id: string,
    remotePubkey: string,
    recipientUser: NDKUser,
    payload: string
): Promise<string | undefined> {
    if (
        !(await backend.pubkeyAllowed({
            id,
            pubkey: remotePubkey,
            method: "encrypt",
            params: payload,
        }))
    ) {
        backend.debug(`encrypt request from ${remotePubkey} rejected`);
        return undefined;
    }

    return await backend.signer.encrypt(recipientUser, payload);
}
