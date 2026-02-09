import type { IEventHandlingStrategy, NDKNip46Backend } from "./index.js";

/**
 * "switch_relays" method handler.
 *
 * Returns the backend's configured relay URLs so the client
 * can switch to the bunker's preferred relays.
 */
export default class SwitchRelaysEventHandlingStrategy implements IEventHandlingStrategy {
    async handle(
        backend: NDKNip46Backend,
        id: string,
        remotePubkey: string,
        _params: string[],
    ): Promise<string | undefined> {
        const debug = backend.debug.extend("switch_relays");

        debug(`switch_relays request from ${remotePubkey}`);

        if (await backend.pubkeyAllowed({ id, pubkey: remotePubkey, method: "switch_relays" })) {
            debug(`responding with relays: ${backend.relayUrls.join(", ")}`);
            return JSON.stringify(backend.relayUrls);
        }

        debug(`switch_relays request from ${remotePubkey} rejected`);
        return undefined;
    }
}
