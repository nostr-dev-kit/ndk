/**
 * Binary decoder for Nostr events
 * Decodes the format created by encoder.ts
 */

import type { EventForEncoding } from './encoder';

const MAGIC_NUMBER = 0x4E4F5354; // 'NOST' in hex
const SUPPORTED_VERSION = 1;

// Reuse TextDecoder instance for better performance
const textDecoder = new TextDecoder();

// Hex lookup table for faster conversion
const HEX_CHARS = '0123456789abcdef';

/**
 * Converts bytes to a hex string (optimized version)
 */
function bytesToHex(bytes: Uint8Array): string {
    let hex = '';
    for (let i = 0; i < bytes.length; i++) {
        const byte = bytes[i];
        hex += HEX_CHARS[byte >> 4] + HEX_CHARS[byte & 15];
    }
    return hex;
}

/**
 * Decodes UTF-8 bytes to a string
 */
function decodeString(bytes: Uint8Array): string {
    return textDecoder.decode(bytes);
}

/**
 * Decode a single event from a buffer starting at the specified offset
 */
function decodeEvent(buffer: ArrayBuffer, offset: number): { event: EventForEncoding; nextOffset: number } {
    const view = new DataView(buffer);
    const uint8 = new Uint8Array(buffer);
    let pos = offset;

    // Validate we have enough bytes to read event size
    if (pos + 4 > buffer.byteLength) {
        throw new Error(`Buffer overflow: trying to read event size at offset ${pos}, buffer length is ${buffer.byteLength}`);
    }

    // Read event size (we could use this for validation)
    const eventSize = view.getUint32(pos, true);
    pos += 4;
    const eventEndPos = offset + eventSize;

    // Validate event size is reasonable
    if (eventEndPos > buffer.byteLength) {
        throw new Error(`Invalid event size: event claims to be ${eventSize} bytes but only ${buffer.byteLength - offset} bytes available`);
    }

    // Read ID (32 bytes)
    const idBytes = uint8.slice(pos, pos + 32);
    const id = bytesToHex(idBytes);
    pos += 32;

    // Read Pubkey (32 bytes)
    const pubkeyBytes = uint8.slice(pos, pos + 32);
    const pubkey = bytesToHex(pubkeyBytes);
    pos += 32;

    // Read Created_at (4 bytes)
    const created_at = view.getUint32(pos, true);
    pos += 4;

    // Read Kind (2 bytes)
    const kind = view.getUint16(pos, true);
    pos += 2;

    // Read Sig (64 bytes)
    const sigBytes = uint8.slice(pos, pos + 64);
    const sig = bytesToHex(sigBytes);
    pos += 64;

    // Read Content
    const contentLength = view.getUint32(pos, true);
    pos += 4;
    const contentBytes = uint8.slice(pos, pos + contentLength);
    const content = decodeString(contentBytes);
    pos += contentLength;

    // Read Tags
    const tagsCount = view.getUint16(pos, true);
    pos += 2;
    const tags: string[][] = [];

    for (let i = 0; i < tagsCount; i++) {
        const tagItemsCount = view.getUint8(pos);
        pos += 1;
        const tag: string[] = [];

        for (let j = 0; j < tagItemsCount; j++) {
            const itemLength = view.getUint16(pos, true);
            pos += 2;
            const itemBytes = uint8.slice(pos, pos + itemLength);
            const item = decodeString(itemBytes);
            tag.push(item);
            pos += itemLength;
        }

        tags.push(tag);
    }

    // Read relay URL (optional)
    let relay_url: string | null = null;
    const hasRelayUrl = view.getUint8(pos);
    pos += 1;
    if (hasRelayUrl === 1) {
        const relayLength = view.getUint16(pos, true);
        pos += 2;
        const relayBytes = uint8.slice(pos, pos + relayLength);
        relay_url = decodeString(relayBytes);
        pos += relayLength;
    }

    const event: EventForEncoding = {
        id,
        pubkey,
        created_at,
        kind,
        sig,
        content,
        tags,
        relay_url
    };

    return { event, nextOffset: eventEndPos };
}

/**
 * Decode multiple events from a binary buffer
 */
export function decodeEvents(buffer: ArrayBuffer): EventForEncoding[] {
    // Handle empty buffer (no results)
    if (buffer.byteLength === 0) {
        return [];
    }

    if (buffer.byteLength < 9) {
        throw new Error(`Buffer too small: ${buffer.byteLength} bytes. Need at least 9 bytes for header.`);
    }

    const view = new DataView(buffer);
    let offset = 0;

    // Read and validate header
    const magic = view.getUint32(offset, true);
    if (magic !== MAGIC_NUMBER) {
        throw new Error(`Invalid magic number. Expected ${MAGIC_NUMBER.toString(16)}, got ${magic.toString(16)}`);
    }
    offset += 4;

    const version = view.getUint8(offset);
    if (version !== SUPPORTED_VERSION) {
        throw new Error(`Unsupported version ${version}. Only version ${SUPPORTED_VERSION} is supported`);
    }
    offset += 1;

    const eventCount = view.getUint32(offset, true);
    offset += 4;

    // Decode events
    const events: EventForEncoding[] = [];
    for (let i = 0; i < eventCount; i++) {
        const { event, nextOffset } = decodeEvent(buffer, offset);
        events.push(event);
        offset = nextOffset;
    }

    return events;
}

/**
 * Decode a single event (convenience function)
 */
export function decodeSingleEvent(buffer: ArrayBuffer): EventForEncoding {
    const events = decodeEvents(buffer);
    if (events.length !== 1) {
        throw new Error(`Expected 1 event, got ${events.length}`);
    }
    return events[0];
}

/**
 * Quick check if a buffer appears to be in our binary format
 */
export function looksLikeBinaryFormat(buffer: ArrayBuffer): boolean {
    if (buffer.byteLength < 9) return false; // Too small for header

    const view = new DataView(buffer);
    const magic = view.getUint32(0, true);

    return magic === MAGIC_NUMBER;
}