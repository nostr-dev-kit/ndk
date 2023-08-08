import { IEventHandlingStrategy, NDKNip46Backend } from "./index.js";

export default class ConnectEventHandlingStrategy
    implements IEventHandlingStrategy
{
    async handle(
        backend: NDKNip46Backend,
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

        if (await backend.pubkeyAllowed(pubkey, "connect", token)) {
            debug(`connection request from ${pubkey} allowed`);
            return "ack";
        } else {
            debug(`connection request from ${pubkey} rejected`);
        }

        return undefined;
    }
}
