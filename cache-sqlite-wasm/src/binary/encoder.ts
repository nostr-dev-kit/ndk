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

/**
 * Converts a hex string to bytes
 */
function hexToBytes(hex: string): Uint8Array {
    if (hex.length % 2 !== 0) {
        throw new Error('Hex string must have even length');
    }
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return bytes;
}

/**
 * Encodes a string to UTF-8 bytes
 */
function encodeString(str: string): Uint8Array {
    return new TextEncoder().encode(str);
}

/**
 * Calculate the size needed for a single event
 */
function calculateEventSize(event: EventForEncoding): number {
    let size = 4; // Event size field itself
    size += 32; // ID (32 bytes when decoded from hex)
    size += 32; // Pubkey (32 bytes when decoded from hex)
    size += 4; // Created_at
    size += 2; // Kind
    size += 64; // Sig (64 bytes when decoded from hex)

    // Content
    const contentBytes = encodeString(event.content);
    size += 4; // Content length
    size += contentBytes.length;

    // Tags
    size += 2; // Tags count
    for (const tag of event.tags) {
        size += 1; // Tag items count
        for (const item of tag) {
            const itemBytes = encodeString(item);
            size += 2; // Item length
            size += itemBytes.length;
        }
    }

    // Optional relay URL
    size += 1; // Has relay URL flag
    if (event.relay_url) {
        const relayBytes = encodeString(event.relay_url);
        size += 2; // Relay URL length
        size += relayBytes.length;
    }

    return size;
}

/**
 * Encode a single event to a buffer at the specified offset
 */
function encodeEvent(event: EventForEncoding, buffer: ArrayBuffer, offset: number): number {
    const view = new DataView(buffer);
    const uint8 = new Uint8Array(buffer);
    let pos = offset;

    // Calculate and write event size
    const eventSize = calculateEventSize(event);
    view.setUint32(pos, eventSize, true); // little-endian
    pos += 4;

    // Write ID (32 bytes)
    const idBytes = hexToBytes(event.id);
    uint8.set(idBytes, pos);
    pos += 32;

    // Write Pubkey (32 bytes)
    const pubkeyBytes = hexToBytes(event.pubkey);
    uint8.set(pubkeyBytes, pos);
    pos += 32;

    // Write Created_at (4 bytes)
    view.setUint32(pos, event.created_at, true);
    pos += 4;

    // Write Kind (2 bytes)
    view.setUint16(pos, event.kind, true);
    pos += 2;

    // Write Sig (64 bytes)
    const sigBytes = hexToBytes(event.sig);
    uint8.set(sigBytes, pos);
    pos += 64;

    // Write Content
    const contentBytes = encodeString(event.content);
    view.setUint32(pos, contentBytes.length, true);
    pos += 4;
    uint8.set(contentBytes, pos);
    pos += contentBytes.length;

    // Write Tags
    view.setUint16(pos, event.tags.length, true);
    pos += 2;

    for (const tag of event.tags) {
        // Write tag items count
        view.setUint8(pos, tag.length);
        pos += 1;

        // Write each tag item
        for (const item of tag) {
            const itemBytes = encodeString(item);
            view.setUint16(pos, itemBytes.length, true);
            pos += 2;
            uint8.set(itemBytes, pos);
            pos += itemBytes.length;
        }
    }

    // Write relay URL
    if (event.relay_url) {
        view.setUint8(pos, 1); // Has relay URL
        pos += 1;
        const relayBytes = encodeString(event.relay_url);
        view.setUint16(pos, relayBytes.length, true);
        pos += 2;
        uint8.set(relayBytes, pos);
        pos += relayBytes.length;
    } else {
        view.setUint8(pos, 0); // No relay URL
        pos += 1;
    }

    return pos;
}

/**
 * Encode multiple events to a binary format
 */
export function encodeEvents(events: EventForEncoding[]): ArrayBuffer {
    // Calculate total size needed
    let totalSize = 4 + 1 + 4; // Magic number + Version + Event count
    for (const event of events) {
        const eventSize = calculateEventSize(event);
        totalSize += eventSize;
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
        offset = encodeEvent(events[i], buffer, offset);
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