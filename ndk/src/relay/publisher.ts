import type { NDKRelay } from ".";
import { NDKRelayStatus } from ".";
import type { NDKEvent } from "../events";

export class NDKRelayPublisher {
    private ndkRelay: NDKRelay;
    private debug: debug.Debugger;

    public constructor(ndkRelay: NDKRelay) {
        this.ndkRelay = ndkRelay;
        this.debug = ndkRelay.debug.extend("publisher");
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
        let timeout: NodeJS.Timeout | number | undefined;

        const publishConnected = () => {
            return new Promise<boolean>((resolve, reject) => {
                try {
                    this.publishEvent(event)
                        .then((result) => {
                            this.ndkRelay.emit("published", event);
                            event.emit("relay:published", this.ndkRelay);
                            resolve(true);
                        })
                        .catch(reject);
                } catch (err) {
                    reject(err);
                }
            });
        };

        const timeoutPromise = new Promise<boolean>((_, reject) => {
            timeout = setTimeout(() => {
                timeout = undefined;
                reject(new Error("Timeout: " + timeoutMs + "ms"));
            }, timeoutMs);
        });

        const onConnectHandler = () => {
            publishConnected()
                .then((result) => connectResolve(result))
                .catch((err) => connectReject(err));
        };

        let connectResolve: (value: boolean | PromiseLike<boolean>) => void;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let connectReject: (reason?: any) => void;

        const onError = (err: Error) => {
            this.ndkRelay.debug("Publish failed", err, event.id);
            this.ndkRelay.emit("publish:failed", event, err);
            event.emit("relay:publish:failed", this.ndkRelay, err);
            throw err;
        };

        const onFinally = () => {
            if (timeout) clearTimeout(timeout as NodeJS.Timeout);
            this.ndkRelay.removeListener("connect", onConnectHandler);
        };

        if (this.ndkRelay.status >= NDKRelayStatus.CONNECTED) {
            /**
             * If we're already connected, publish the event right now
             */
            return Promise.race([publishConnected(), timeoutPromise])
                .catch(onError)
                .finally(onFinally);
        } else {
            /**
             * If we are not connected, try to connect and, once connected, publish the event
             */
            return Promise.race([
                new Promise<boolean>((resolve, reject) => {
                    connectResolve = resolve;
                    connectReject = reject;
                    this.ndkRelay.once("connect", onConnectHandler);
                }),
                timeoutPromise,
            ])
                .catch(onError)
                .finally(onFinally);
        }
    }

    private async publishEvent(event: NDKEvent): Promise<string> {
        return this.ndkRelay.connectivity.publish(event.rawEvent());
    }
}
