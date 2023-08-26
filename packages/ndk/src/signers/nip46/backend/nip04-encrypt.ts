import NDKUser from "../../../user/index.js";
import { IEventHandlingStrategy, NDKNip46Backend } from "./index.js";

export default class Nip04EncryptHandlingStrategy
    implements IEventHandlingStrategy
{
    async handle(
        backend: NDKNip46Backend,
        remotePubkey: string,
        params: string[]
    ): Promise<string | undefined> {
        const [recipientPubkey, payload] = params;
        const recipientUser = new NDKUser({ hexpubkey: recipientPubkey });
        const decryptedPayload = await backend.encrypt(
            remotePubkey,
            recipientUser,
            payload
        );

        return decryptedPayload;
    }
}
