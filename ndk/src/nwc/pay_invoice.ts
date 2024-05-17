import type { NDKNwc, NDKNwcResponse } from ".";

export interface PayInvoiceResponse {
    preimage?: string;
}

export async function payInvoice(
    this: NDKNwc,
    invoice: string
): Promise<NDKNwcResponse<PayInvoiceResponse>> {
    const ret = await this.sendReq<PayInvoiceResponse>("pay_invoice", { invoice });
    return ret;
}
