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
        const recipientUser = new NDKUser({ hexpubkey: recipientPubkey });
        const decryptedPayload = await encrypt(backend, id, remotePubkey, recipientUser, payload);

        return decryptedPayload;
    }
}

async function encrypt(
    backend: NDKNip46Backend,
    id: string,
    remotePubkey: string,
    recipientUser: NDKUser,
    payload: string
) {
    if (!(await backend.pubkeyAllowed(backend, id, remotePubkey, "encrypt", payload))) {
        backend.debug(`encrypt request from ${remotePubkey} rejected`);
        return undefined;
    }

    return await backend.signer.encrypt(recipientUser, payload);
}
