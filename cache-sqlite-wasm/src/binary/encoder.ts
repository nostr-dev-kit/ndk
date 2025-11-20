/**
 * Binary encoder for Nostr events
 *
 * Format:
 * - Magic number (4 bytes): 0x4E4F5354 ('NOST')
 * - Version (1 byte)
 * - Event count (4 bytes)
 * - Events (variable)
 *
 * Each event:
 * - Event size (4 bytes) - total size of this event block
 * - ID (32 bytes hex decoded)
 * - Pubkey (32 bytes hex decoded)
 * - Created_at (4 bytes)
 * - Kind (2 bytes)
 * - Sig (64 bytes hex decoded)
 * - Content length (4 bytes)
 * - Content (variable UTF-8)
 * - Tags count (2 bytes)
 * - Tags (variable)
 *
 * Each tag:
 * - Tag items count (1 byte)
 * - Items (variable)
 *
 * Each tag item:
 * - Item length (2 bytes)
 * - Item data (variable UTF-8)
 */

const MAGIC_NUMBER = 0x4E4F5354; // 'NOST' in hex
const VERSION = 1;

export interface EventForEncoding {
    id: string;
    pubkey: string;
    created_at: number;
    kind: number;
    sig: string;
    content: string;
    tags: string[][];
    relay_url?: string | null;
}

// Reuse TextEncoder instance (PERFORMANCE FIX)
const textEncoder = new TextEncoder();

/**
 * Converts a hex string to bytes (optimized version)
 */
function hexToBytes(hex: string): Uint8Array {
    if (hex.length % 2 !== 0) {
        throw new Error('Hex string must have even length');
    }
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        const hi = hex.charCodeAt(i);
        const lo = hex.charCodeAt(i + 1);
        // Convert hex char codes to values (0-15)
        const hiVal = hi > 96 ? hi - 87 : hi > 64 ? hi - 55 : hi - 48;
        const loVal = lo > 96 ? lo - 87 : lo > 64 ? lo - 55 : lo - 48;
        bytes[i / 2] = (hiVal << 4) | loVal;
    }
    return bytes;
}

/**
 * Encodes a string to UTF-8 bytes
 */
function encodeString(str: string): Uint8Array {
    return textEncoder.encode(str);
}

/**
 * Pre-encoded event data to avoid double encoding
 */
interface EncodedEventData {
    idBytes: Uint8Array;
    pubkeyBytes: Uint8Array;
    sigBytes: Uint8Array;
    contentBytes: Uint8Array;
    tagBytes: Uint8Array[][];
    relayBytes: Uint8Array | null;
    totalSize: number;
}

/**
 * Pre-encode all string data for an event (encode once, use twice)
 */
function preEncodeEvent(event: EventForEncoding): EncodedEventData {
    // Encode hex fields
    const idBytes = hexToBytes(event.id);
    const pubkeyBytes = hexToBytes(event.pubkey);
    const sigBytes = hexToBytes(event.sig);

    // Encode content
    const contentBytes = encodeString(event.content);

    // Encode tags
    const tagBytes: Uint8Array[][] = [];
    for (const tag of event.tags) {
        const encodedTag: Uint8Array[] = [];
        for (const item of tag) {
            encodedTag.push(encodeString(item));
        }
        tagBytes.push(encodedTag);
    }

    // Encode relay URL
    const relayBytes = event.relay_url ? encodeString(event.relay_url) : null;

    // Calculate total size
    let size = 4; // Event size field itself
    size += 32; // ID
    size += 32; // Pubkey
    size += 4; // Created_at
    size += 2; // Kind
    size += 64; // Sig
    size += 4; // Content length
    size += contentBytes.length;
    size += 2; // Tags count

    for (const tag of tagBytes) {
        size += 1; // Tag items count
        for (const item of tag) {
            size += 2; // Item length
            size += item.length;
        }
    }

    size += 1; // Has relay URL flag
    if (relayBytes) {
        size += 2; // Relay URL length
        size += relayBytes.length;
    }

    return {
        idBytes,
        pubkeyBytes,
        sigBytes,
        contentBytes,
        tagBytes,
        relayBytes,
        totalSize: size,
    };
}

/**
 * Encode a pre-encoded event to a buffer at the specified offset
 */
function writeEncodedEvent(
    event: EventForEncoding,
    encoded: EncodedEventData,
    buffer: ArrayBuffer,
    offset: number
): number {
    const view = new DataView(buffer);
    const uint8 = new Uint8Array(buffer);
    let pos = offset;

    // Write event size
    view.setUint32(pos, encoded.totalSize, true);
    pos += 4;

    // Write ID
    uint8.set(encoded.idBytes, pos);
    pos += 32;

    // Write Pubkey
    uint8.set(encoded.pubkeyBytes, pos);
    pos += 32;

    // Write Created_at
    view.setUint32(pos, event.created_at, true);
    pos += 4;

    // Write Kind
    view.setUint16(pos, event.kind, true);
    pos += 2;

    // Write Sig
    uint8.set(encoded.sigBytes, pos);
    pos += 64;

    // Write Content
    view.setUint32(pos, encoded.contentBytes.length, true);
    pos += 4;
    uint8.set(encoded.contentBytes, pos);
    pos += encoded.contentBytes.length;

    // Write Tags
    view.setUint16(pos, encoded.tagBytes.length, true);
    pos += 2;

    for (const tag of encoded.tagBytes) {
        // Write tag items count
        view.setUint8(pos, tag.length);
        pos += 1;

        // Write each tag item
        for (const item of tag) {
            view.setUint16(pos, item.length, true);
            pos += 2;
            uint8.set(item, pos);
            pos += item.length;
        }
    }

    // Write relay URL
    if (encoded.relayBytes) {
        view.setUint8(pos, 1);
        pos += 1;
        view.setUint16(pos, encoded.relayBytes.length, true);
        pos += 2;
        uint8.set(encoded.relayBytes, pos);
        pos += encoded.relayBytes.length;
    } else {
        view.setUint8(pos, 0);
        pos += 1;
    }

    return pos;
}

/**
 * Encode multiple events to a binary format
 */
export function encodeEvents(events: EventForEncoding[]): ArrayBuffer {
    // Pre-encode all events (encode strings once)
    const encodedEvents: EncodedEventData[] = [];
    let totalSize = 4 + 1 + 4; // Magic number + Version + Event count

    for (const event of events) {
        const encoded = preEncodeEvent(event);
        encodedEvents.push(encoded);
        totalSize += encoded.totalSize;
    }

    // Create buffer
    const buffer = new ArrayBuffer(totalSize);
    const view = new DataView(buffer);
    let offset = 0;

    // Write header
    view.setUint32(offset, MAGIC_NUMBER, true);
    offset += 4;
    view.setUint8(offset, VERSION);
    offset += 1;
    view.setUint32(offset, events.length, true);
    offset += 4;

    // Write events
    for (let i = 0; i < events.length; i++) {
        offset = writeEncodedEvent(events[i], encodedEvents[i], buffer, offset);
    }

    return buffer;
}

/**
 * Encode a single event (convenience function)
 */
export function encodeSingleEvent(event: EventForEncoding): ArrayBuffer {
    return encodeEvents([event]);
}

/**
 * Validate that a buffer looks like our binary format
 */
export function isValidBinaryFormat(buffer: ArrayBuffer): boolean {
    if (buffer.byteLength < 9) return false; // Too small for header

    const view = new DataView(buffer);
    const magic = view.getUint32(0, true);
    const version = view.getUint8(4);

    return magic === MAGIC_NUMBER && version === VERSION;
}