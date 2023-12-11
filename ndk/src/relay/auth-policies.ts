import { NDKRelay } from ".";
import { NDKEvent } from "../events";
import { NDKKind } from "../events/kinds";
import { NDK } from "../ndk";
import { NDKSigner } from "../signers";
import { NDKPool } from "./pool";
import createDebug from "debug";

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

function signIn({ ndk, signer, debug }: ISignIn = {}) {
    debug ??= createDebug("ndk:relay:auth-policies:signIn");

    return async (relay: NDKRelay, challenge: string) => {
        debug!(`Relay ${relay.url} requested authentication, signing in`);

        const event = new NDKEvent(ndk);
        event.kind = NDKKind.ClientAuth;
        event.tags = [
            ["relay", relay.url],
            ["challenge", challenge],
        ];

        try {
            await event.sign(signer);
            await relay.auth(event);
        } catch (e) {
            debug!(`Failed to publish auth event to relay ${relay.url}`, e);
        }

        return event;
    };
}

const NDKRelayAuthPolicies = {
    disconnect,
    signIn,
};

export { NDKRelayAuthPolicies, NDKAuthPolicy };
