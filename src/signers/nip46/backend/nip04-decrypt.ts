import NDKUser from "../../../user/index.js";
import { IEventHandlingStrategy, NDKNip46Backend } from "./index.js";

export default class Nip04DecryptHandlingStrategy
    implements IEventHandlingStrategy
{
    async handle(
        backend: NDKNip46Backend,
        remotePubkey: string,
        params: string[]
    ): Promise<string | undefined> {
        const [senderPubkey, payload] = params;
        const senderUser = new NDKUser({ hexpubkey: senderPubkey });
        const decryptedPayload = await backend.decrypt(
            remotePubkey,
            senderUser,
            payload
        );

        return JSON.stringify([decryptedPayload]);
    }
}
