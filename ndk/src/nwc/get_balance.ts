import type { NDKNwcResponse, NDKNwc } from "./index.js";

export interface GetBalanceResponse {
    balance?: number;
}

export async function getBalance(this: NDKNwc): Promise<NDKNwcResponse<GetBalanceResponse>> {
    const ret = await this.sendReq<GetBalanceResponse>("get_balance", {});
    return ret;
}
