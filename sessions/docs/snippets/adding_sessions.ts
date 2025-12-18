// Login first account (automatically active)
const signer1 = new NDKPrivateKeySigner(nsec1);
const pubkey1 = await sessions.login(signer1);

// Login second account
const signer2 = new NDKPrivateKeySigner(nsec2);
const pubkey2 = await sessions.login(signer2, { setActive: false });

console.log("Accounts:", sessions.getSessions().size);
