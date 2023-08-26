import { IEventHandlingStrategy, NDKNip46Backend } from "./index.js";

export default class SignEventHandlingStrategy
    implements IEventHandlingStrategy
{
    async handle(
        backend: NDKNip46Backend,
        remotePubkey: string,
        params: string[]
    ): Promise<string | undefined> {
        const event = await backend.signEvent(remotePubkey, params);
        if (!event) return undefined;

        return JSON.stringify(await event.toNostrEvent());
    }
}
