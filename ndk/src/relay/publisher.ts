import type { NDKRelay } from ".";
import { NDKRelayStatus } from ".";
import type { NDKEvent } from "../events";

export class NDKRelayPublisher {
    private ndkRelay: NDKRelay;

    public constructor(ndkRelay: NDKRelay) {
        this.ndkRelay = ndkRelay;
    }

    /**
     * Published an event to the relay; if the relay is not connected, it will
     * wait for the relay to connect before publishing the event.
     *
     * If the relay does not connect within the timeout, the publish operation
     * will fail.
     * @param event  The event to publish
     * @param timeoutMs  The timeout for the publish operation in milliseconds
     * @returns A promise that resolves when the event has been published or rejects if the operation times out
     */
    public async publish(event: NDKEvent, timeoutMs = 2500): Promise<boolean> {
        const publishWhenConnected = () => {
            return new Promise<boolean>((resolve, reject) => {
                try {
                    this.publishEvent(event, timeoutMs)
                        .then((result) => resolve(result))
                        .catch((err) => reject(err));
                } catch (err) {
                    reject(err);
                }
            });
        };

        const timeoutPromise = new Promise<boolean>((_, reject) => {
            setTimeout(() => reject(new Error("Timeout")), timeoutMs);
        });

        const onConnectHandler = () => {
            publishWhenConnected()
                .then((result) => connectResolve(result))
                .catch((err) => connectReject(err));
        };

        let connectResolve: (value: boolean | PromiseLike<boolean>) => void;
        let connectReject: (reason?: any) => void;

        if (this.ndkRelay.status === NDKRelayStatus.CONNECTED) {
            return Promise.race([publishWhenConnected(), timeoutPromise]);
        } else {
            return Promise.race([
                new Promise<boolean>((resolve, reject) => {
                    connectResolve = resolve;
                    connectReject = reject;
                    this.ndkRelay.once("connect", onConnectHandler);
                }),
                timeoutPromise,
            ]).finally(() => {
                // Remove the event listener to avoid memory leaks
                this.ndkRelay.removeListener("connect", onConnectHandler);
            });
        }
    }

    private async publishEvent(event: NDKEvent, timeoutMs?: number): Promise<boolean> {
        const nostrEvent = await event.toNostrEvent();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        // or if this is an ephemeral event, don't wait for the publish to complete
        if (!timeoutMs || event.isEphemeral()) {
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

    public async auth(event: NDKEvent): Promise<void> {
        return this.ndkRelay.connectivity.relay.auth(event.rawEvent() as any);
    }
}
