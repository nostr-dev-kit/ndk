import type { IEventHandlingStrategy, NDKNip46Backend } from "./index.js";

/**
 * "ping" method handler.
 */
export default class PingEventHandlingStrategy implements IEventHandlingStrategy {
    async handle(
        backend: NDKNip46Backend,
        id: string,
        remotePubkey: string,
        params: string[]
    ): Promise<string | undefined> {
        const debug = backend.debug.extend("ping");

        debug(`ping request from ${remotePubkey}`);

        if (await backend.pubkeyAllowed({ id, pubkey: remotePubkey, method: "ping" })) {
            debug(`connection request from ${remotePubkey} allowed`);
            return "pong";
        } else {
            debug(`connection request from ${remotePubkey} rejected`);
        }

        return undefined;
    }
}
