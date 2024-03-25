import type { IEventHandlingStrategy, NDKNip46Backend } from "./index.js";

/**
 * "connect" method handler.
 *
 * This method receives a:
 * * token -- An optional OTP token
 */
export default class ConnectEventHandlingStrategy implements IEventHandlingStrategy {
    async handle(
        backend: NDKNip46Backend,
        id: string,
        remotePubkey: string,
        params: string[]
    ): Promise<string | undefined> {
        const [_, token] = params;
        const debug = backend.debug.extend("connect");

        debug(`connection request from ${remotePubkey}`);

        if (token && backend.applyToken) {
            debug(`applying token`);
            await backend.applyToken(remotePubkey, token);
        }

        if (
            await backend.pubkeyAllowed({
                id,
                pubkey: remotePubkey,
                method: "connect",
                params: token,
            })
        ) {
            debug(`connection request from ${remotePubkey} allowed`);
            return "ack";
        } else {
            debug(`connection request from ${remotePubkey} rejected`);
        }

        return undefined;
    }
}
