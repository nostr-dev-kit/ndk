import type { NDKEvent } from "./index.js";

export function isReplaceable(this: NDKEvent): boolean {
    if (this.kind === undefined) throw new Error("Kind not set");
    return (
        [0, 3].includes(this.kind) ||
        (this.kind >= 10000 && this.kind < 20000) ||
        (this.kind >= 30000 && this.kind < 40000)
    );
}

export function isEphemeral(this: NDKEvent): boolean {
    if (this.kind === undefined) throw new Error("Kind not set");
    return this.kind >= 20000 && this.kind < 30000;
}

export function isParamReplaceable(this: NDKEvent): boolean {
    if (this.kind === undefined) throw new Error("Kind not set");
    return this.kind >= 30000 && this.kind < 40000;
}
