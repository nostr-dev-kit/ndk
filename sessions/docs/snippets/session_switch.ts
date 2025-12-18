// Switch to different account
sessions.switchTo(pubkey2);
console.log("Active:", sessions.activePubkey);

// Switch back
sessions.switchTo(pubkey1);
