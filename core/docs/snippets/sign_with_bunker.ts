// provided by the user
const signerConnectionString = "bunker://....";

// local keypair generated when signer if first initialised
const clientKeypair = NDKPrivateKeySigner.generate(); //
const clientNsec = clientKeypair.nsec;

// initiate NIP-46 signer
const signer = NDKNip46Signer.bunker(ndk, signerConnectionString, clientNsec);

// promise will resolve once the `kind:24133` event is received
const user = await signer.blockUntilReady();

console.log("Welcome", user.npub);
