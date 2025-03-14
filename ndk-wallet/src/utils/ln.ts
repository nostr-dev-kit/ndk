import { decode as decodeBolt11 } from "light-bolt11-decoder";

export function getBolt11ExpiresAt(bolt11: string): number | undefined {
    const decoded = decodeBolt11(bolt11);

    const expiry = decoded.expiry;
    const timestamp = (
        decoded.sections.find((section: { name: string }) => section.name === "timestamp") as {
            value: number;
        }
    ).value;

    if (typeof expiry === "number" && typeof timestamp === "number") {
        return expiry + timestamp;
    }

    return undefined;
}

export function getBolt11Amount(bolt11: string): number | undefined {
    const decoded = decodeBolt11(bolt11);
    const section = decoded.sections.find(
        (section: { name: string }) => section.name === "amount"
    ) as { value: string };
    const val = section?.value;
    return Number(val);
}

export function getBolt11Description(bolt11: string): string | undefined {
    const decoded = decodeBolt11(bolt11);
    const section = decoded.sections.find(
        (section: { name: string }) => section.name === "description"
    ) as { value: string };
    const val = section?.value;
    return val;
}
