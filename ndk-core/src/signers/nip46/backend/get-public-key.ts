import type { IEventHandlingStrategy, NDKNip46Backend } from "./index.js";

export default class GetPublicKeyHandlingStrategy implements IEventHandlingStrategy {
    async handle(
        backend: NDKNip46Backend,
        _id: string,
        _remotePubkey: string,
        _params: string[],
    ): Promise<string | undefined> {
        return backend.localUser?.pubkey;
    }
}
