import { NDKEvent } from "@nostr-dev-kit/ndk";
import { NDKKind } from "@nostr-dev-kit/ndk";
import { NDKNWCWallet } from ".";
import { NDKNWCResponseBase } from "./types";
import { NDKNWCResponseMap } from "./types";

export async function waitForResponse<M extends keyof NDKNWCResponseMap>(
    this: NDKNWCWallet,
    request: NDKEvent
): Promise<NDKNWCResponseBase<NDKNWCResponseMap[M]>> {
    if (!this.pool) throw new Error("Wallet not initialized");
    const sendRequest = () => {
        if (waitForEoseTimeout) clearTimeout(waitForEoseTimeout);
        request.publish(this.relaySet);
    };

    let waitForEoseTimeout = setTimeout(sendRequest, 2500);

    return new Promise((resolve, reject) => {
        const sub = this.ndk.subscribe(
            {
                kinds: [NDKKind.NostrWalletConnectRes],
                "#e": [request.id],
                limit: 1,
            },
            { groupable: false, pool: this.pool },
            this.relaySet
        );

        sub.on("event", async (event: NDKEvent) => {
            try {
                await event.decrypt(event.author, this.signer);
                const content = JSON.parse(event.content);

                if (content.error) {
                    reject(content);
                } else {
                    resolve(content);
                }
            } catch (e: any) {
                console.error("error decrypting event", e);
                reject({
                    result_type: "error",
                    error: {
                        code: "failed_to_parse_response",
                        message: e.message,
                    },
                });
            } finally {
                sub.stop();
            }
        });

        sub.on("eose", () => {
            sendRequest();
        });
    });
}
