/**
 * Core Negentropy protocol implementation.
 * Handles the set reconciliation algorithm.
 */

import { BUFFER_SIZES, FRAME_SIZE_LIMITS, RANGE_SPLITTING } from "../constants.js";
import type { Bound, StorageItem } from "../types.js";
import { NegentropyMode } from "../types.js";
import type { NegentropyStorage } from "./storage.js";
import {
    compareUint8Array,
    decodeVarInt,
    encodeVarInt,
    FINGERPRINT_SIZE,
    getByte,
    getBytes,
    ID_SIZE,
    PROTOCOL_VERSION,
    WrappedBuffer,
} from "./utils.js";

/**
 * Negentropy set reconciliation engine.
 * Implements the client side of the Negentropy Protocol V1.
 */
export class Negentropy {
    private storage: NegentropyStorage;
    private frameSizeLimit: number;
    private lastTimestampIn = 0;
    private lastTimestampOut = 0;
    private isInitiator = false;

    constructor(storage: NegentropyStorage, frameSizeLimit = 0) {
        if (frameSizeLimit !== 0 && frameSizeLimit < FRAME_SIZE_LIMITS.MINIMUM) {
            throw new Error(`frameSizeLimit too small (minimum ${FRAME_SIZE_LIMITS.MINIMUM} bytes)`);
        }

        this.storage = storage;
        this.frameSizeLimit = frameSizeLimit;
    }

    /**
     * Create a bound object.
     */
    private bound(timestamp: number, id?: Uint8Array): Bound {
        return {
            timestamp,
            id: id || new Uint8Array(0),
        };
    }

    /**
     * Initiate a sync session.
     * Returns the initial message to send to the server.
     */
    async initiate(): Promise<Uint8Array> {
        if (this.isInitiator) {
            throw new Error("Already initiated");
        }
        this.isInitiator = true;

        const output = new WrappedBuffer();
        output.set([PROTOCOL_VERSION]);

        await this.splitRange(0, this.storage.size(), this.bound(Number.MAX_VALUE), output);

        return output.unwrap();
    }

    /**
     * Set this instance as the initiator (client).
     */
    setInitiator(): void {
        this.isInitiator = true;
    }

    /**
     * Process a message from the server.
     * Returns the next message to send, or undefined if sync is complete.
     * Also returns arrays of IDs we have and need.
     */
    async reconcile(query: Uint8Array): Promise<{
        nextMessage: Uint8Array | undefined;
        have: Uint8Array[];
        need: Uint8Array[];
    }> {
        const haveIds: Uint8Array[] = [];
        const needIds: Uint8Array[] = [];
        const queryBuf = new WrappedBuffer(query);

        this.lastTimestampIn = this.lastTimestampOut = 0; // Reset for each message

        const fullOutput = new WrappedBuffer();
        fullOutput.set([PROTOCOL_VERSION]);

        // Validate protocol version
        const versionCheckResult = this.validateProtocolVersion(queryBuf);
        if (!versionCheckResult.isValid) {
            return {
                nextMessage: versionCheckResult.output.unwrap(),
                have: haveIds,
                need: needIds,
            };
        }

        const storageSize = this.storage.size();
        let prevBound = this.bound(0);
        let prevIndex = 0;
        let skip = false;

        while (queryBuf.length !== 0) {
            const o = new WrappedBuffer();

            const doSkip = () => {
                if (skip) {
                    skip = false;
                    o.append(this.encodeBound(prevBound));
                    o.append(encodeVarInt(NegentropyMode.Skip));
                }
            };

            const currBound = this.decodeBound(queryBuf);
            const mode = queryBuf.length === 0 ? NegentropyMode.Skip : decodeVarInt(queryBuf);

            const lower = prevIndex;
            const upper = this.storage.findLowerBound(prevIndex, storageSize, currBound);

            // Process based on mode
            const modeResult = await this.processByMode(
                mode,
                lower,
                upper,
                currBound,
                queryBuf,
                o,
                fullOutput,
                doSkip,
                haveIds,
                needIds,
            );

            if (modeResult.shouldSkip) {
                skip = true;
            }

            if (this.exceededFrameSizeLimit(fullOutput.length + o.length)) {
                // Frame size limit exceeded: stop range processing
                const remainingFingerprint = await this.storage.fingerprint(upper, storageSize);

                fullOutput.append(this.encodeBound(this.bound(Number.MAX_VALUE)));
                fullOutput.append(encodeVarInt(NegentropyMode.Fingerprint));
                fullOutput.append(remainingFingerprint);
                break;
            }

            if (!modeResult.outputAlreadyAppended) {
                fullOutput.append(o.unwrap());
            }

            prevIndex = upper;
            prevBound = currBound;
        }

        return {
            nextMessage: fullOutput.length === 1 && this.isInitiator ? undefined : fullOutput.unwrap(),
            have: haveIds,
            need: needIds,
        };
    }

    /**
     * Validate the protocol version from the query buffer.
     */
    private validateProtocolVersion(queryBuf: WrappedBuffer): {
        isValid: boolean;
        output: WrappedBuffer;
    } {
        const output = new WrappedBuffer();
        output.set([PROTOCOL_VERSION]);

        const protocolVersion = getByte(queryBuf);
        if (protocolVersion < 0x60 || protocolVersion > 0x6f) {
            throw new Error("Invalid negentropy protocol version byte");
        }
        if (protocolVersion !== PROTOCOL_VERSION) {
            if (this.isInitiator) {
                throw new Error(`Unsupported negentropy protocol version requested: ${protocolVersion - 0x60}`);
            }
            return { isValid: false, output };
        }

        return { isValid: true, output };
    }

    /**
     * Process a range based on the operation mode.
     */
    private async processByMode(
        mode: number,
        lower: number,
        upper: number,
        currBound: Bound,
        queryBuf: WrappedBuffer,
        o: WrappedBuffer,
        fullOutput: WrappedBuffer,
        doSkip: () => void,
        haveIds: Uint8Array[],
        needIds: Uint8Array[],
    ): Promise<{ shouldSkip: boolean; outputAlreadyAppended: boolean }> {
        if (mode === NegentropyMode.Skip) {
            return this.handleModeSkip();
        } else if (mode === NegentropyMode.Fingerprint) {
            return await this.handleModeFingerprint(lower, upper, currBound, queryBuf, o, doSkip);
        } else if (mode === NegentropyMode.IdList) {
            return await this.handleModeIdList(
                lower,
                upper,
                currBound,
                queryBuf,
                o,
                fullOutput,
                doSkip,
                haveIds,
                needIds,
            );
        } else {
            throw new Error("Unexpected mode");
        }
    }

    /**
     * Handle Skip mode operation.
     */
    private handleModeSkip(): { shouldSkip: boolean; outputAlreadyAppended: boolean } {
        return { shouldSkip: true, outputAlreadyAppended: false };
    }

    /**
     * Handle Fingerprint mode operation.
     */
    private async handleModeFingerprint(
        lower: number,
        upper: number,
        currBound: Bound,
        queryBuf: WrappedBuffer,
        o: WrappedBuffer,
        doSkip: () => void,
    ): Promise<{ shouldSkip: boolean; outputAlreadyAppended: boolean }> {
        const theirFingerprint = getBytes(queryBuf, FINGERPRINT_SIZE); // getBytes already consumes
        const ourFingerprint = await this.storage.fingerprint(lower, upper);

        if (compareUint8Array(theirFingerprint, ourFingerprint) !== 0) {
            doSkip();
            await this.splitRange(lower, upper, currBound, o);
            return { shouldSkip: false, outputAlreadyAppended: false };
        } else {
            return { shouldSkip: true, outputAlreadyAppended: false };
        }
    }

    /**
     * Handle IdList mode operation.
     */
    private async handleModeIdList(
        lower: number,
        upper: number,
        currBound: Bound,
        queryBuf: WrappedBuffer,
        o: WrappedBuffer,
        fullOutput: WrappedBuffer,
        doSkip: () => void,
        haveIds: Uint8Array[],
        needIds: Uint8Array[],
    ): Promise<{ shouldSkip: boolean; outputAlreadyAppended: boolean }> {
        const numIds = decodeVarInt(queryBuf);

        const theirElems = new Map<string, Uint8Array>();
        for (let i = 0; i < numIds; i++) {
            const e = getBytes(queryBuf, ID_SIZE); // getBytes already consumes the bytes
            const key = Array.from(e).join(","); // Simple key for Map
            theirElems.set(key, e);
        }

        if (this.isInitiator) {
            return this.handleIdListAsInitiator(lower, upper, theirElems, haveIds, needIds);
        } else {
            return await this.handleIdListAsResponder(lower, upper, currBound, o, fullOutput, doSkip);
        }
    }

    /**
     * Handle IdList mode when we are the initiator.
     */
    private handleIdListAsInitiator(
        lower: number,
        upper: number,
        theirElems: Map<string, Uint8Array>,
        haveIds: Uint8Array[],
        needIds: Uint8Array[],
    ): { shouldSkip: boolean; outputAlreadyAppended: boolean } {
        this.storage.iterate(lower, upper, (item) => {
            const k = Array.from(item.id).join(",");

            if (!theirElems.has(k)) {
                // ID exists on our side, but not their side
                haveIds.push(item.id);
            } else {
                // ID exists on both sides
                theirElems.delete(k);
            }

            return true;
        });

        for (const v of theirElems.values()) {
            // ID exists on their side, but not our side
            needIds.push(v);
        }

        return { shouldSkip: true, outputAlreadyAppended: false };
    }

    /**
     * Handle IdList mode when we are the responder.
     */
    private async handleIdListAsResponder(
        lower: number,
        upper: number,
        currBound: Bound,
        o: WrappedBuffer,
        fullOutput: WrappedBuffer,
        doSkip: () => void,
    ): Promise<{ shouldSkip: boolean; outputAlreadyAppended: boolean }> {
        doSkip();

        const responseIds = new WrappedBuffer();
        let numResponseIds = 0;
        let endBound = currBound;

        this.storage.iterate(lower, upper, (item, _index) => {
            if (this.exceededFrameSizeLimit(fullOutput.length + responseIds.length)) {
                endBound = item;
                return false; // Stop iteration
            }

            responseIds.append(item.id);
            numResponseIds++;
            return true;
        });

        o.append(this.encodeBound(endBound));
        o.append(encodeVarInt(NegentropyMode.IdList));
        o.append(encodeVarInt(numResponseIds));
        o.append(responseIds.unwrap());

        fullOutput.append(o.unwrap());
        o.clear();

        return { shouldSkip: false, outputAlreadyAppended: true };
    }

    /**
     * Split a range into sub-ranges.
     * Either send fingerprints for buckets or an ID list if small enough.
     */
    private async splitRange(lower: number, upper: number, upperBound: Bound, o: WrappedBuffer): Promise<void> {
        const numElems = upper - lower;
        const buckets = RANGE_SPLITTING.BUCKET_COUNT;

        if (numElems < RANGE_SPLITTING.MIN_ELEMENTS_FOR_BUCKETS) {
            // Small range: send ID list
            o.append(this.encodeBound(upperBound));
            o.append(encodeVarInt(NegentropyMode.IdList));
            o.append(encodeVarInt(numElems));

            this.storage.iterate(lower, upper, (item) => {
                o.append(item.id);
                return true;
            });
        } else {
            // Large range: split into buckets and send fingerprints
            const itemsPerBucket = Math.floor(numElems / buckets);
            const bucketsWithExtra = numElems % buckets;
            let curr = lower;

            for (let i = 0; i < buckets; i++) {
                const bucketSize = itemsPerBucket + (i < bucketsWithExtra ? 1 : 0);
                const ourFingerprint = await this.storage.fingerprint(curr, curr + bucketSize);
                curr += bucketSize;

                let nextBound: Bound;

                if (curr === upper) {
                    nextBound = upperBound;
                } else {
                    let prevItem: StorageItem | undefined;
                    let currItem: StorageItem | undefined;

                    this.storage.iterate(curr - 1, curr + 1, (item, index) => {
                        if (index === curr - 1) prevItem = item;
                        else currItem = item;
                        return true;
                    });

                    if (!prevItem || !currItem) {
                        throw new Error(`Failed to get items at index ${curr - 1} and ${curr} for bound calculation`);
                    }

                    nextBound = this.getMinimalBound(prevItem, currItem);
                }

                o.append(this.encodeBound(nextBound));
                o.append(encodeVarInt(NegentropyMode.Fingerprint));
                o.append(ourFingerprint);
            }
        }
    }

    /**
     * Check if we've exceeded the frame size limit.
     */
    private exceededFrameSizeLimit(n: number): boolean {
        return this.frameSizeLimit > 0 && n > this.frameSizeLimit - BUFFER_SIZES.FRAME_SIZE_SAFETY_MARGIN;
    }

    // Decoding

    private decodeTimestampIn(encoded: WrappedBuffer): number {
        let timestamp = decodeVarInt(encoded);
        timestamp = timestamp === 0 ? Number.MAX_VALUE : timestamp - 1;

        if (this.lastTimestampIn === Number.MAX_VALUE || timestamp === Number.MAX_VALUE) {
            this.lastTimestampIn = Number.MAX_VALUE;
            return Number.MAX_VALUE;
        }

        timestamp += this.lastTimestampIn;
        this.lastTimestampIn = timestamp;
        return timestamp;
    }

    private decodeBound(encoded: WrappedBuffer): Bound {
        const timestamp = this.decodeTimestampIn(encoded);
        const len = decodeVarInt(encoded);

        if (len > ID_SIZE) {
            throw new Error("Bound key too long");
        }

        const id = new Uint8Array(ID_SIZE);
        const encodedId = getBytes(encoded, Math.min(len, encoded.length)); // getBytes already consumes
        id.set(encodedId);

        return { timestamp, id };
    }

    // Encoding

    private encodeTimestampOut(timestamp: number): Uint8Array {
        if (timestamp === Number.MAX_VALUE) {
            this.lastTimestampOut = Number.MAX_VALUE;
            return encodeVarInt(0);
        }

        const temp = timestamp;
        timestamp -= this.lastTimestampOut;
        this.lastTimestampOut = temp;
        return encodeVarInt(timestamp + 1);
    }

    private encodeBound(key: Bound): Uint8Array {
        const tsBytes = this.encodeTimestampOut(key.timestamp);
        const idLenBytes = encodeVarInt(key.id.length);
        const output = new Uint8Array(tsBytes.length + idLenBytes.length + key.id.length);

        output.set(tsBytes);
        output.set(idLenBytes, tsBytes.length);
        output.set(key.id, tsBytes.length + idLenBytes.length);

        return output;
    }

    private getMinimalBound(prev: StorageItem, curr: StorageItem): Bound {
        if (curr.timestamp !== prev.timestamp) {
            return this.bound(curr.timestamp);
        }

        // Same timestamp, find minimal ID prefix
        let sharedPrefixBytes = 0;
        for (let i = 0; i < ID_SIZE; i++) {
            if (curr.id[i] !== prev.id[i]) break;
            sharedPrefixBytes++;
        }

        return this.bound(curr.timestamp, curr.id.subarray(0, sharedPrefixBytes + 1));
    }
}
