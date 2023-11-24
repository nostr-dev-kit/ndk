import type { IEventHandlingStrategy, NDKNip46Backend } from "./index.js";

/**
 * "connect" method handler.
 *
 * This method receives a:
 * * pubkey -- this is the client pubkey that is requesting permission ("local pubkey")
 * * token -- An optional OTP token
 */
export default class ConnectEventHandlingStrategy implements IEventHandlingStrategy {
    async handle(
        backend: NDKNip46Backend,
        id: string,
        remotePubkey: string,
        params: string[]
    ): Promise<string | undefined> {
        const [pubkey, token] = params;
        const debug = backend.debug.extend("connect");

        debug(`connection request from ${pubkey}`);

        if (token && backend.applyToken) {
            debug(`applying token`);
            await backend.applyToken(pubkey, token);
        }

        if (await backend.pubkeyAllowed({ id, pubkey, method: "connect", params: token })) {
            debug(`connection request from ${pubkey} allowed`);
            return "ack";
        } else {
            debug(`connection request from ${pubkey} rejected`);
        }

        return undefined;
    }
}
