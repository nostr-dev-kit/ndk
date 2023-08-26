import { IEventHandlingStrategy, NDKNip46Backend } from "./index.js";

export default class DescribeHandlingStrategy
    implements IEventHandlingStrategy
{
    async handle(
        backend: NDKNip46Backend,
        remotePubkey: string,
        params: string[]
    ): Promise<string | undefined> {
        const keys = Object.keys(backend.handlers);
        return JSON.stringify(keys);
    }
}
