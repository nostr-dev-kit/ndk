import { NDKRelay, NDKRelayStatus } from ".";
import { NDKEvent } from "../events";

export class NDKRelayPublisher {
    private ndkRelay: NDKRelay;

    public constructor(ndkRelay: NDKRelay) {
        this.ndkRelay = ndkRelay;
    }

    public async publish(event: NDKEvent, timeoutMs = 2500): Promise<boolean> {
        if (this.ndkRelay.status === NDKRelayStatus.CONNECTED) {
            return this.publishEvent(event, timeoutMs);
        } else {
            return new Promise<boolean>((resolve, reject) => {
                this.ndkRelay.once("connect", async () => {
                    try {
                        const result = await this.publishEvent(event, timeoutMs);
                        resolve(result);
                    } catch (err) {
                        reject(err);
                    }
                });
            });
        }
    }

    private async publishEvent(
        event: NDKEvent,
        timeoutMs?: number
    ): Promise<boolean> {
        const nostrEvent = await event.toNostrEvent();
        const publish = this.ndkRelay.connectivity.relay.publish(nostrEvent as any);
        let publishTimeout: NodeJS.Timeout | number;

        const publishPromise = new Promise<boolean>((resolve, reject) => {
            publish
                .then(() => {
                    clearTimeout(publishTimeout as unknown as NodeJS.Timeout);
                    this.ndkRelay.emit("published", event);
                    resolve(true);
                })
                .catch((err) => {
                    clearTimeout(publishTimeout as NodeJS.Timeout);
                    this.ndkRelay.debug("Publish failed", err, event.id);
                    this.ndkRelay.emit("publish:failed", event, err);
                    reject(err);
                });
        });

        // If no timeout is specified, just return the publish promise
        if (!timeoutMs) {
            return publishPromise;
        }

        // Create a promise that rejects after timeoutMs milliseconds
        const timeoutPromise = new Promise<boolean>((_, reject) => {
            publishTimeout = setTimeout(() => {
                this.ndkRelay.debug("Publish timed out", event.rawEvent());
                this.ndkRelay.emit("publish:failed", event, "Timeout");
                reject(new Error("Publish operation timed out"));
            }, timeoutMs);
        });

        // wait for either the publish operation to complete or the timeout to occur
        return Promise.race([publishPromise, timeoutPromise]);
    }
}