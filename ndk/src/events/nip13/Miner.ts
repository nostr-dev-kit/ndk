import type { UnsignedEvent } from "nostr-tools";

/**
 * Determine the beginning and ending index of the nonce in the serialized event
 * @param serializedEvent string
 * @returns beginning and end index of the nonce in the buffer
 */
export const getNonceBounds = (serializedEvent: string): [number, number] => {
  const nonceTag = '"nonce","';
  const nonceStart = serializedEvent.indexOf(nonceTag) + nonceTag.length;
  const nonceEnd = serializedEvent.indexOf('"', nonceStart);
  return [nonceStart, nonceEnd];
};

/**
 * Deserialize a nostr event from a string
 * @param serializedEvent string
 * @returns UnsignedEvent
 */
export const deserializeEvent = (serializedEvent: string): UnsignedEvent => {
  const eventArray = JSON.parse(serializedEvent);
  return {
    pubkey: eventArray[1],
    created_at: eventArray[2],
    kind: eventArray[3],
    tags: eventArray[4],
    content: eventArray[5],
  };
};

export const incrementNonceBuffer = (buffer: Uint8Array, startIndex: number, endIndex: number): Uint8Array => {
  // go from right to left to update count, because the number is big-endian
  for (let i = endIndex-1; i >= startIndex; i--) {
    if (buffer[i] === 63) {
      // we are using 16 UTF-8 symbols between decimal 48 and 63 (0-9, :, ;, <, =, >, ?)
      // 16 nonce digits * 4 bits per digit = 64 bits of possible entropy, which is more than enough for a nonce, especially since the created_at will be incremented and serve as entropy too.
      // wrap around if the symbol is 63 (?) and set to 48 (0)
      buffer[i] = 48;
    } else {
      buffer[i]++;
      break;
    }
  }
  return buffer;
};

export const setNonceBuffer = (buffer: Uint8Array, startIndex: number, endIndex: number, nonce: number): Uint8Array => {

  // Convert the nonce back to a big-endian array of bytes
  for (let i = endIndex - 1; i >= startIndex; i--) {
    buffer[i] = (nonce & 0xF) + 48;
    nonce = nonce >> 4;
  }

  return buffer;
};

export function countLeadingZeroesBin(binary: Uint8Array) {
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