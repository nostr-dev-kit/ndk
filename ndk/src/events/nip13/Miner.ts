import type { UnsignedEvent } from "nostr-tools";

/**
 * Determine the beginning and ending index of the nonce in the serialized event
 * @param serializedEvent string
 * @returns beginning and end index of the nonce in the buffer
 */
export function getNonceBounds(serializedEvent: string): [number, number] {
    const nonceTag = '"nonce","';
    const nonceStart = serializedEvent.indexOf(nonceTag) + nonceTag.length;
    const nonceEnd = serializedEvent.indexOf('"', nonceStart);
    return [nonceStart, nonceEnd];
}

/**
 * Deserialize a nostr event from a string
 * @param serializedEvent string
 * @returns UnsignedEvent
 */
export function deserializeEvent(serializedEvent: string): UnsignedEvent {
    const eventArray = JSON.parse(serializedEvent);
    return {
        pubkey: eventArray[1],
        created_at: eventArray[2],
        kind: eventArray[3],
        tags: eventArray[4],
        content: eventArray[5],
    };
}

/**
 * Increments the values in a Uint8Array buffer from a specified start index to an end index.
 * The buffer is treated as a big-endian number, and the increment is performed from right to left.
 * We are using 16 UTF-8 symbols between decimal 48 and 63 (0-9, :, ;, <, =, >, ?)
 *
 * 16 nonce digits * 4 bits per digit = 64 bits of possible entropy,
 * which is more than enough for a nonce, especially since the created_at will be incremented
 * and serve as entropy too.
 *
 * If a value in the buffer reaches 63, it wraps around to 48 (0).
 *
 * @param buffer - The Uint8Array buffer to increment.
 * @param startIndex - The index to start incrementing from.
 * @param endIndex - The index to stop incrementing at (inclusive).
 * @returns The modified Uint8Array buffer.
 */
export function incrementNonceBuffer(
    buffer: Uint8Array,
    startIndex: number,
    endIndex: number
): Uint8Array {
    // go from right to left to update count, because the number is big-endian
    for (let i = endIndex - 1; i >= startIndex; i--) {
        if (buffer[i] === 63) {
            buffer[i] = 48;
        } else {
            buffer[i]++;
            break;
        }
    }
    return buffer;
}

/**
 * Sets the nonce value in the given buffer at the specified range.
 *
 * @param buffer - The buffer to set the nonce value in.
 * @param startIndex - The starting index in the buffer to set the nonce value.
 * @param endIndex - The ending index in the buffer to set the nonce value.
 * @param nonce - The nonce value to set in the buffer.
 * @returns The modified buffer with the nonce value set.
 */
export function setNonceBuffer(
    buffer: Uint8Array,
    startIndex: number,
    endIndex: number,
    nonce: number
): Uint8Array {
    // Convert the nonce back to a big-endian array of bytes
    for (let i = endIndex - 1; i >= startIndex; i--) {
        buffer[i] = (nonce & 0xf) + 48;
        nonce = nonce >> 4;
    }

    return buffer;
}

/**
 * Counts the number of leading zeroes in a binary array.
 *
 * @param binary {Uint8Array} - The binary array to count leading zeroes from.
 * @returns The number of leading zeroes in the binary array.
 */
export function countLeadingZeroesBin(binary: Uint8Array): number {
    let count = 0;

    for (let i = 0; i < binary.length; i++) {
        const byte = binary[i];
        if (byte === 0) {
            count += 8;
        } else {
            count += Math.clz32(byte) - 24;
            break;
        }
    }

    return count;
}
