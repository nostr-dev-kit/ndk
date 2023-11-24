import { NDKEvent } from "../../../events/index.js";
import type { IEventHandlingStrategy, NDKNip46Backend } from "./index.js";

export default class SignEventHandlingStrategy implements IEventHandlingStrategy {
    async handle(
        backend: NDKNip46Backend,
        id: string,
        remotePubkey: string,
        params: string[]
    ): Promise<string | undefined> {
        const event = await signEvent(backend, id, remotePubkey, params);
        if (!event) return undefined;

        return JSON.stringify(await event.toNostrEvent());
    }
}

async function signEvent(
    backend: NDKNip46Backend,
    id: string,
    remotePubkey: string,
    params: string[]
): Promise<NDKEvent | undefined> {
    const [eventString] = params;

    backend.debug(`sign event request from ${remotePubkey}`);

    const event = new NDKEvent(backend.ndk, JSON.parse(eventString));

    backend.debug("event to sign", event.rawEvent());

    if (
        !(await backend.pubkeyAllowed({
            id,
            pubkey: remotePubkey,
            method: "sign_event",
            params: event,
        }))
    ) {
        backend.debug(`sign event request from ${remotePubkey} rejected`);
        return undefined;
    }

    backend.debug(`sign event request from ${remotePubkey} allowed`);

    await event.sign(backend.signer);
    return event;
}
