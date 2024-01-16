import { decode } from "light-bolt11-decoder";

import type { NDKEvent, NDKEventId, NostrEvent } from "../events/index.js";

export interface NDKZapInvoice {
    id?: NDKEventId;

    /**
     * The pubkey of the zapper app
     */
    zapper: string;

    /**
     * The pubkey of the user sending the zap
     */
    zappee: string;

    /**
     * The pubkey of the user receiving the zap
     */
    zapped: string;

    /**
     * The event that was zapped
     */
    zappedEvent?: string;

    /**
     * The amount zapped in millisatoshis
     */
    amount: number;

    /**
     * A comment attached to the zap
     */
    comment?: string;
}

/**
 * Parses a zap invoice from a kind 9735 event
 *
 * @param event The event to parse
 *
 * @returns NDKZapInvoice | null
 */
export function zapInvoiceFromEvent(event: NDKEvent): NDKZapInvoice | null {
    const description = event.getMatchingTags("description")[0];
    const bolt11 = event.getMatchingTags("bolt11")[0];
    let decodedInvoice;
    let zapRequest: NostrEvent;

    if (!description || !bolt11 || !bolt11[1]) {
        return null;
    }

    try {
        let zapRequestPayload = description[1];
        if (zapRequestPayload.startsWith("%")) {
            zapRequestPayload = decodeURIComponent(zapRequestPayload);
        }
        if (zapRequestPayload === "") {
            return null;
        }

        zapRequest = JSON.parse(zapRequestPayload);
        decodedInvoice = decode(bolt11[1]);
    } catch (e) {
        return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const amountSection = decodedInvoice.sections.find((s: any) => s.name === "amount");
    if (!amountSection) {
        return null;
    }

    const amount = parseInt(amountSection.value);
    if (!amount) {
        return null;
    }

    const content = zapRequest.content;
    const sender = zapRequest.pubkey;
    const recipientTag = event.getMatchingTags("p")[0];
    const recipient = recipientTag[1];
    let zappedEvent = event.getMatchingTags("e")[0];
    if (!zappedEvent) {
        zappedEvent = event.getMatchingTags("a")[0];
    }

    const zappedEventId = zappedEvent ? zappedEvent[1] : undefined;

    // ignore self-zaps (TODO: configurable?)
    // if (sender === recipient) { return null; } XXX

    const zapInvoice: NDKZapInvoice = {
        id: event.id,
        zapper: event.pubkey,
        zappee: sender,
        zapped: recipient,
        zappedEvent: zappedEventId,
        amount,
        comment: content,
    };

    return zapInvoice;
}
