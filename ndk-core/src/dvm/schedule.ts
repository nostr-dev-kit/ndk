import type { NDKEvent, NostrEvent } from "../events";
import { type NDKUser } from "../user";
import { NDKKind } from "../events/kinds";
import type { NDKSubscription } from "../subscription";
import { NDKDVMRequest } from "../events/kinds/dvm/request";
import { NDKDVMJobFeedback } from "../events/kinds/dvm";

function addRelays(event: NDKEvent, relays?: string[]) {
    const tags = [];

    if (!relays || relays.length === 0) {
        const poolRelays = event.ndk?.pool.relays;
        relays = poolRelays ? Object.keys(poolRelays) : undefined;
    }
    if (relays && relays.length > 0) tags.push(["relays", ...relays]);

    return tags;
}

/**
 * Schedule a post for publishing at a later time using * a NIP-90 DVM.
 *
 * @param dvm {NDKUser} The DVM to use for scheduling.
 * @param relays {string[]} The relays the schedule event should be published to by the DVM. Defaults to all relays in the pool.
 * @param encrypted {boolean} Whether to encrypt the event. Defaults to true.
 * @param waitForConfirmationForMs {number} How long to wait for the DVM to confirm the schedule event. If none is provided, the event will be scheduled but not confirmed.
 *
 * @example
 * const event = new NDKEvent(ndk, { kind: 1, content: "hello world" });
 * event.created_at = Date.now()/1000 + 60 // schedule for 60 seconds from now
 * await event.sign();
 *
 * const dvm = ndk.getUser({ pubkey: "<a-kind-5905-dvm-pubkey>" });
 *
 * const result = await dvmSchedule(event, dvm);
 * console.log(result.status); // "success"
 */
export async function dvmSchedule(
    events: NDKEvent | NDKEvent[],
    dvm: NDKUser,
    relays?: string[],
    encrypted = true,
    waitForConfirmationForMs?: number
) {
    if (!(events instanceof Array)) {
        events = [events];
    }

    const ndk = events[0].ndk;

    if (!ndk) throw new Error("NDK not set");

    for (const event of events) {
        // check the event has a future date and that it's signed
        if (!event.sig) throw new Error("Event not signed");
        if (!event.created_at) throw new Error("Event has no date");
        if (!dvm) throw new Error("No DVM specified");
        if (event.created_at <= Date.now() / 1000)
            throw new Error("Event needs to be in the future");
    }

    const scheduleEvent = new NDKDVMRequest(ndk, {
        kind: NDKKind.DVMEventSchedule,
    } as NostrEvent);

    for (const event of events) {
        scheduleEvent.addInput(JSON.stringify(event.rawEvent()), "text");
    }

    scheduleEvent.tags.push(...addRelays(events[0], relays));

    if (encrypted) {
        await scheduleEvent.encryption(dvm);
    } else {
        scheduleEvent.dvm = dvm;
    }

    await scheduleEvent.sign();

    let res: NDKSubscription | undefined;

    if (waitForConfirmationForMs) {
        res = ndk.subscribe(
            {
                kinds: [NDKKind.DVMEventSchedule + 1000, NDKKind.DVMJobFeedback],
                ...scheduleEvent.filter(),
            },
            { groupable: false, closeOnEose: false }
        );
    }

    const timeoutPromise = new Promise<string>((reject) => {
        setTimeout(() => {
            res?.stop();
            reject("Timeout waiting for an answer from the DVM");
        }, waitForConfirmationForMs);
    });

    const schedulePromise = new Promise<NDKDVMJobFeedback | NDKEvent | string | void>(
        (resolve, reject) => {
            if (waitForConfirmationForMs) {
                res?.on("event", async (e: NDKEvent) => {
                    res?.stop();
                    if (e.kind === NDKKind.DVMJobFeedback) {
                        const feedback = await NDKDVMJobFeedback.from(e);
                        if (feedback.status === "error") {
                            const statusTag = feedback.getMatchingTags("status");
                            reject(statusTag?.[2] ?? feedback);
                        } else {
                            resolve(feedback);
                        }
                    }

                    resolve(e);
                });
            }

            scheduleEvent.publish().then(() => {
                if (!waitForConfirmationForMs) resolve();
            });
        }
    );

    return new Promise<NDKEvent | string | void>((resolve, reject) => {
        if (waitForConfirmationForMs) {
            Promise.race([timeoutPromise, schedulePromise])
                .then((e) => {
                    resolve(e);
                })
                .catch(reject);
        } else {
            schedulePromise.then(resolve);
        }
    });
}
