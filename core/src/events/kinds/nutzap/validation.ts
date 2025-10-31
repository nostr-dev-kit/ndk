export enum NutzapValidationCode {
    // Critical errors - make the nutzap invalid
    NO_PROOFS = "NO_PROOFS",
    INVALID_PROOF_COUNT = "INVALID_PROOF_COUNT",
    MULTIPLE_RECIPIENTS = "MULTIPLE_RECIPIENTS",
    NO_RECIPIENT = "NO_RECIPIENT",
    MULTIPLE_MINTS = "MULTIPLE_MINTS",
    NO_MINT = "NO_MINT",
    MULTIPLE_EVENT_TAGS = "MULTIPLE_EVENT_TAGS",
    MALFORMED_PROOF_SECRET = "MALFORMED_PROOF_SECRET",

    // Non-critical warnings - suggest improvements but don't invalidate
    MISSING_EVENT_TAG_IN_PROOF = "MISSING_EVENT_TAG_IN_PROOF",
    MISMATCHED_EVENT_TAG_IN_PROOF = "MISMATCHED_EVENT_TAG_IN_PROOF",
    MISSING_SENDER_TAG_IN_PROOF = "MISSING_SENDER_TAG_IN_PROOF",
    MISMATCHED_SENDER_TAG_IN_PROOF = "MISMATCHED_SENDER_TAG_IN_PROOF",
    NO_EVENT_TAG_IN_EVENT = "NO_EVENT_TAG_IN_EVENT",
}

export enum NutzapValidationSeverity {
    ERROR = "ERROR",
    WARNING = "WARNING",
}

export type NutzapValidationIssue = {
    code: NutzapValidationCode;
    severity: NutzapValidationSeverity;
    message: string;
    proofIndex?: number;
};

export type NutzapValidationResult = {
    valid: boolean;
    issues: NutzapValidationIssue[];
};

const SEVERITY_MAP: Record<NutzapValidationCode, NutzapValidationSeverity> = {
    [NutzapValidationCode.NO_PROOFS]: NutzapValidationSeverity.ERROR,
    [NutzapValidationCode.INVALID_PROOF_COUNT]: NutzapValidationSeverity.ERROR,
    [NutzapValidationCode.MULTIPLE_RECIPIENTS]: NutzapValidationSeverity.ERROR,
    [NutzapValidationCode.NO_RECIPIENT]: NutzapValidationSeverity.ERROR,
    [NutzapValidationCode.MULTIPLE_MINTS]: NutzapValidationSeverity.ERROR,
    [NutzapValidationCode.NO_MINT]: NutzapValidationSeverity.ERROR,
    [NutzapValidationCode.MULTIPLE_EVENT_TAGS]: NutzapValidationSeverity.ERROR,
    [NutzapValidationCode.MALFORMED_PROOF_SECRET]: NutzapValidationSeverity.ERROR,
    [NutzapValidationCode.MISSING_EVENT_TAG_IN_PROOF]: NutzapValidationSeverity.WARNING,
    [NutzapValidationCode.MISMATCHED_EVENT_TAG_IN_PROOF]: NutzapValidationSeverity.WARNING,
    [NutzapValidationCode.MISSING_SENDER_TAG_IN_PROOF]: NutzapValidationSeverity.WARNING,
    [NutzapValidationCode.MISMATCHED_SENDER_TAG_IN_PROOF]: NutzapValidationSeverity.WARNING,
    [NutzapValidationCode.NO_EVENT_TAG_IN_EVENT]: NutzapValidationSeverity.WARNING,
};

const ERROR_MESSAGES: Record<NutzapValidationCode, string> = {
    [NutzapValidationCode.NO_PROOFS]: "Nutzap must contain at least one proof",
    [NutzapValidationCode.INVALID_PROOF_COUNT]: "Invalid proof count",
    [NutzapValidationCode.MULTIPLE_RECIPIENTS]: "Nutzap must have exactly one recipient (p tag)",
    [NutzapValidationCode.NO_RECIPIENT]: "Nutzap must have a recipient (p tag)",
    [NutzapValidationCode.MULTIPLE_MINTS]: "Nutzap must specify exactly one mint (u tag)",
    [NutzapValidationCode.NO_MINT]: "Nutzap must specify a mint (u tag)",
    [NutzapValidationCode.MULTIPLE_EVENT_TAGS]: "Nutzap must have at most one event tag (e tag)",
    [NutzapValidationCode.MALFORMED_PROOF_SECRET]: "Proof secret is malformed and cannot be parsed",
    [NutzapValidationCode.MISSING_EVENT_TAG_IN_PROOF]: "Proof secret missing 'e' tag for replay protection",
    [NutzapValidationCode.MISMATCHED_EVENT_TAG_IN_PROOF]: "Proof secret 'e' tag does not match event being zapped",
    [NutzapValidationCode.MISSING_SENDER_TAG_IN_PROOF]: "Proof secret missing 'P' tag for sender verification",
    [NutzapValidationCode.MISMATCHED_SENDER_TAG_IN_PROOF]: "Proof secret 'P' tag does not match sender pubkey",
    [NutzapValidationCode.NO_EVENT_TAG_IN_EVENT]: "Nutzap event missing 'e' tag (recommended for replay protection)",
};

export function createValidationIssue(
    code: NutzapValidationCode,
    proofIndex?: number
): NutzapValidationIssue {
    return {
        code,
        severity: SEVERITY_MAP[code],
        message: ERROR_MESSAGES[code],
        proofIndex,
    };
}
