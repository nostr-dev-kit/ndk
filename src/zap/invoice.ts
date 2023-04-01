import NDKEvent, {type NDKEventId, type NostrEvent} from '../events/';
import lightningPayReq from 'light-bolt11-decoder';

export interface NDKZapInvoice {
    id?: NDKEventId;
    zapper: string; // pubkey of zapper app
    zappee: string; // pubkey of user sending zap
    zapped: string; // pubkey of user receiving zap
    zappedEvent?: string; // event zapped
    amount: number;
    comment?: string;
}

export function zapInvoiceFromEvent(event: NDKEvent): NDKZapInvoice | null {
    const description = event.getMatchingTags('description')[0];
    const bolt11 = event.getMatchingTags('bolt11')[0];
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
        if (zapRequestPayload === "") { return null; }

        zapRequest = JSON.parse(zapRequestPayload);
        decodedInvoice = lightningPayReq.decode(bolt11[1]);
    } catch (e) {
        // console.log(e, {description, event});
        return null;
    }

    const amountSection = decodedInvoice.sections.find((s: any) => s.name === 'amount');
    if (!amountSection) { return null; }

    const amount = parseInt(amountSection.value) / 1000;
    if (!amount) { return null; }

    const content = zapRequest.content;
    const sender = zapRequest.pubkey;
    const recipientTag = event.getMatchingTags('p')[0];
    const recipient = recipientTag[1];
    const zappedEvent = event.getMatchingTags('e')[0];
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
