import type { IEventHandlingStrategy, NDKNip46Backend } from "./index.js";

export default class GetPublicKeyHandlingStrategy implements IEventHandlingStrategy {
    async handle(
        backend: NDKNip46Backend,
        id: string,
        remotePubkey: string,
        params: string[]
    ): Promise<string | undefined> {
        return backend.localUser?.pubkey;
    }
}
