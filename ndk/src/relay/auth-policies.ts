import { NDKRelay } from ".";
import { NDKEvent } from "../events";
import { NDKKind } from "../events/kinds";
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
    }
}

type ISignIn = {
    signer?: NDKSigner;
    debug?: debug.Debugger;
}

function signIn({ signer, debug }: ISignIn) {
    debug ??= createDebug("ndk:relay:auth-policies:signIn");

    return async (relay: NDKRelay, challenge: string)  => {
        debug!(`Relay ${relay.url} requested authentication, signing in`);

        const event = new NDKEvent();
        event.kind = NDKKind.ClientAuth;
        event.tags = [
            ["relay", relay.url],
            ["challenge", challenge],
        ];

        await event.sign(signer);
        await relay.publish(event)

        return event;
    }
}

const NDKRelayAuthPolicies = {
    disconnect,
    signIn,
};

export {
    NDKRelayAuthPolicies,
    NDKAuthPolicy,
};