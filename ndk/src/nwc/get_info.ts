import type { NDKNWcCommands, NDKNwc, NDKNwcResponse } from ".";

export interface GetInfoResponse {
    alias?: string;
    color?: string;
    pubkey?: string;
    network?: string;
    block_height?: number;
    block_hash?: string;
    methods?: NDKNWcCommands[];
}

export async function getInfo(this: NDKNwc): Promise<NDKNwcResponse<GetInfoResponse>> {
    const ret = await this.sendReq<GetInfoResponse>("get_info", {});
    return ret;
}
