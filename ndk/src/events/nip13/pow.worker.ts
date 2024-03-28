import { sha256 } from "@noble/hashes/sha256";
import { incrementNonceBuffer, setNonceBuffer, countLeadingZeroesBin } from "./Miner";
import type { PowMessageData } from "./nip13";

let threadID: number | undefined = undefined;
let threadCountNum = 0;
let NONCE_OFFSET = 0;
let active = false;
let currentNonce = 0;

self.onmessage = function (message) {
    const command: string = message.data.command;
    const data: PowMessageData = message.data.data;
    if (data.thread) threadID = data.thread;
    if (data.threadCount) threadCountNum = data.threadCount;
    if (data.nonceOffset) NONCE_OFFSET = data.nonceOffset;
    switch (command) {
        case "start":
            safeInterrupt(data);
            break;
        case "stop":
            active = false;
            break;
    }
};

/**
 * Safely interrupts the mining process and initiates it again after a short delay.
 * If we call 'start' while mining, we need to stop mining, wait a tick, then start again to
 * allow the previous mining loop to finish.
 * @param data - The PowMessageData object containing the necessary data for mining.
 */
function safeInterrupt(data: PowMessageData): void {
    active = false;
    setTimeout(() => {
        active = true;
        initiateMining(data);
    }, 2);
}

/**
 * Initiates the mining process.
 *
 * @param data - The PowMessageData object containing the mining parameters.
 */
function initiateMining(data: PowMessageData): void {
    // console.log('worker',threadID,'starting');
    let { binary } = data;
    const { nonceBounds, nonceStartValue, nonceEndValue, targetPOW } = data;

    currentNonce = nonceStartValue;

    // get binary nonce to start value
    binary = setNonceBuffer(binary, nonceBounds[0], nonceBounds[1], nonceStartValue);

    // start mining loop
    function mine(): void {
        if (active && currentNonce <= nonceEndValue) {
            const digest: Uint8Array = sha256(binary);
            const POW: number = countLeadingZeroesBin(digest);

            if (POW === targetPOW) {
                // success! end thread and return the result
                postMessage({
                    thread: threadID,
                    status: "pow-target-found",
                    binary,
                    nonceBounds,
                    digest,
                    currentNonce,
                    POW,
                });
                active = false;
                return;
            }

            currentNonce++;

            binary = incrementNonceBuffer(binary, nonceBounds[0], nonceBounds[1]);

            // keep mining
            setTimeout(mine, 0);

            return;
        } else if (!active) {
            console.log("worker", threadID, "stopped");
        }

        if (currentNonce > nonceEndValue) {
            console.log("worker", threadID, "finished");
            // figure out what the next nonce range will be for this worker based on our threadCount; use NONCE_OFFSET to change our starting point
            data.nonceStartValue += threadCountNum * NONCE_OFFSET;
            data.nonceEndValue = data.nonceStartValue + NONCE_OFFSET;
            // keep mining at new nonce range
            setTimeout(() => initiateMining(data), 1);
        }
    }

    mine();
}
