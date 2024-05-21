import type { NDKNwc, NDKNwcResponse } from ".";
import { NDKEvent, type NostrEvent } from "../events";
import { NDKKind } from "../events/kinds";

export type NostrWalletConnectMethod =
    | "pay_invoice"
    | "get_info"
    | "get_balance"
    | "get_transactions"
    | "get_invoice"
    | "get_invoices"
    | "get_invoice_status";

export async function sendReq<T>(
    this: NDKNwc,
    method: NostrWalletConnectMethod,
    params: any
): Promise<NDKNwcResponse<T>> {
    const event = new NDKEvent(this.ndk, {
        kind: NDKKind.NostrWalletConnectReq,
        tags: [["p", this.walletService.pubkey]],
        content: JSON.stringify({ method, params }),
    } as NostrEvent);

    this.debug("Sending request", event.content);

    await event.encrypt(this.walletService, this.signer);
    await event.sign(this.signer);

    this.debug("Request encrypted and signed");

    return new Promise<NDKNwcResponse<T>>(async (resolve, reject) => {
        try {
            const eTag = event.tagId();

            if (!eTag) throw new Error("Failed to get e-tag");

            const processEvent = (payload: string) => {
                this.off(eTag, processEvent);
                this.off("event", processEvent);

                this.debug("Received response", payload);
                try {
                    const content = JSON.parse(payload);

                    if (content.error) reject(content);

                    resolve(content);
                } catch (e: any) {
                    this.debug("Failed to parse response", e);
                    reject({
                        result_type: "error",
                        error: {
                            code: "failed_to_parse_response",
                            message: e.message,
                        },
                    });
                }
            };

            const sub = this.ndk.subscribe(
                {
                    kinds: [NDKKind.NostrWalletConnectRes],
                    "#e": [eTag],
                    limit: 1,
                },
                { groupable: false, subId: `nwc-${method}` },
                this.relaySet
            );

            sub.on("event", async (event: NDKEvent) => {
                await event.decrypt(event.author, this.signer);
                processEvent(event.content);
                sub.stop();
            });
            this.once(eTag, processEvent);
            this.once("event", processEvent);

            this.debug("Sending request to relay", event.rawEvent());

            await event.publish(this.relaySet);
        } catch (e: any) {
            this.debug("Failed to send request", e, e.relayErrors);
            reject({
                result_type: "error",
                error: {
                    code: "failed_to_send_request",
                    message: e.message,
                },
            });
        }
    });
}
