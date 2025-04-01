export type NDKEncryptionScheme = "nip04" | "nip44";

import type { NDKEventId } from "./events/index.js";
import type { NDKNutzap } from "./index.js";

export enum NdkNutzapStatus {
    // First time we see a nutzap
    INITIAL = "initial",

    // Processing the nutzap
    PROCESSING = "processing",

    // Nutzap has been redeemed
    REDEEMED = "redeemed",

    // Nutzap has been spent
    SPENT = "spent",

    // The nutzap is p2pk to a pubkey of which we don't have a privkey
    MISSING_PRIVKEY = "missing_privkey",

    // Generic temporary error
    TEMPORARY_ERROR = "temporary_error",

    // Generic permanent error
    PERMANENT_ERROR = "permanent_error",

    // The nutzap is invalid
    INVALID_NUTZAP = "invalid_nutzap",
}

export interface NDKNutzapState {
    nutzap?: NDKNutzap;

    status: NdkNutzapStatus;

    // The token event id of the event that redeemed the nutzap
    redeemedById?: NDKEventId;

    // Error message if the nutzap has an error
    errorMessage?: string;

    // Amount redeemed if the nutzap has been redeemed
    redeemedAmount?: number;
}
