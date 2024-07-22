import type { NDKRelay } from ".";
import { NDKEvent } from "../events";
import { NDKKind } from "../events/kinds";
import type { NDK } from "../ndk";
import type { NDKSigner } from "../signers";
import type { NDKPool } from "./pool";
import createDebug from "debug";

/**
 * NDKAuthPolicies are functions that are called when a relay requests authentication
 * so that you can define a behavior for your application.
 *
 * @param relay The relay that requested authentication.
 * @param challenge The challenge that the relay sent.
 */
type NDKAuthPolicy = (relay: NDKRelay, challenge: string) => Promise<boolean | void | NDKEvent>;

/**
 * This policy will disconnect from relays that request authentication.
 */
function disconnect(pool: NDKPool, debug?: debug.Debugger) {
    debug ??= createDebug("ndk:relay:auth-policies:disconnect");

    return async (relay: NDKRelay) => {
        debug!(`Relay ${relay.url} requested authentication, disconnecting`);

        pool.removeRelay(relay.url);
    };
}

type ISignIn = {
    ndk?: NDK;
    signer?: NDKSigner;
    debug?: debug.Debugger;
};

async function signAndAuth(
    event: NDKEvent,
    relay: NDKRelay,
    signer: NDKSigner,
    debug: debug.Debugger,
    resolve: (event: NDKEvent) => void,
    reject: (event: NDKEvent) => void
) {
    try {
        await event.sign(signer);
        resolve(event);
    } catch (e) {
        debug!(`Failed to publish auth event to relay ${relay.url}`, e);
        reject(event);
    }
}

/**
 * Uses the signer to sign an event and then authenticate with the relay.
 * If no signer is provided the NDK signer will be used.
 * If none is not available it will wait for one to be ready.
 */
function signIn({ ndk, signer, debug }: ISignIn = {}) {
    debug ??= createDebug("ndk:auth-policies:signIn");

    return async (relay: NDKRelay, challenge: string): Promise<NDKEvent> => {
        debug!(`Relay ${relay.url} requested authentication, signing in`);

        const event = new NDKEvent(ndk);
        event.kind = NDKKind.ClientAuth;
        event.tags = [
            ["relay", relay.url],
            ["challenge", challenge],
        ];

        signer ??= ndk?.signer;

        // If we dont have a signer, we need to wait for one to be ready
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            if (signer) {
                await signAndAuth(event, relay, signer, debug!, resolve, reject);
            } else {
                ndk?.once("signer:ready", async (signer) => {
                    await signAndAuth(event, relay, signer, debug!, resolve, reject);
                });
            }
        });
    };
}

const NDKRelayAuthPolicies = {
    disconnect,
    signIn,
};

export { NDKRelayAuthPolicies, NDKAuthPolicy };
