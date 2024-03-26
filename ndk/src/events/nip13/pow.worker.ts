import { sha256 } from '@noble/hashes/sha256';
import { incrementNonceBuffer, setNonceBuffer, countLeadingZeroesBin } from "./Miner";

let threadID = undefined;
let threadCountNum = 0;
let NONCE_OFFSET = 0;
let active = false;
let currentNonce = 0;

self.onmessage = function(message) {
  const { command, data } = message.data;
  if (data.thread) threadID = data.thread;
  if (data.threadCount) threadCountNum = data.threadCount;
  if (data.nonceOffset) NONCE_OFFSET = data.nonceOffset;
  switch (command) {
    case 'start':
      safeInterrupt(data);
      break;
    case 'stop':
      active = false;
      break;
  }
};

// if we call 'start' while mining, we need to stop mining, wait a tick, then start again to allow the previous mining loop to finish
function safeInterrupt(data) {
  active = false;
  setTimeout(() => {
    active = true;
    initiateMining(data);
  }, 2);
}

function initiateMining(data) {
  // console.log('worker',threadID,'starting');
  let {
    binary,
    nonceBounds,
    nonceStartValue,
    nonceEndValue,
    targetPOW,
  } = data;

  currentNonce = nonceStartValue;

  // get binary nonce to start value

  binary = setNonceBuffer(binary, nonceBounds[0], nonceBounds[1], nonceStartValue);

  // start mining loop
  function mine(){
    if (active && currentNonce <= nonceEndValue) {

      let digest = sha256(binary);
      let POW = countLeadingZeroesBin(digest);

      if (POW === targetPOW) {
        // success! end thread and return the result
        postMessage({ thread: threadID, status: 'pow-target-found', binary, nonceBounds, digest, currentNonce, POW });
        active = false;
        return;
      }

      currentNonce++;

      binary = incrementNonceBuffer(binary, nonceBounds[0], nonceBounds[1])

      // keep mining
      setTimeout(mine, 0);

      return;

    } else if (!active) {
      console.log('worker',threadID,'stopped');
    }

    if (currentNonce > nonceEndValue) {
      console.log('worker',threadID,'finished');
      // figure out what the next nonce range will be for this worker based on our threadCount; use NONCE_OFFSET to change our starting point
      data.nonceStartValue += threadCountNum * NONCE_OFFSET;
      data.nonceEndValue = data.nonceStartValue + NONCE_OFFSET;
      // keep mining at new nonce range
      setTimeout(() => initiateMining(data), 1);
    }
  }

  mine();

}
