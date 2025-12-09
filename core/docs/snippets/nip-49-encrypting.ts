import { bytesToHex, hexToBytes } from "@noble/hashes/utils";
import { nip49 } from "@nostr-dev-kit/ndk";

// Encrypt raw private key bytes
const privateKeyHex = "14c226dbdd865d5e1645e72c7470fd0a17feb42cc87b750bab6538171b3a3f8a";
const privateKeyBytes = hexToBytes(privateKeyHex);
const password = "my-password";

const ncryptsec = nip49.encrypt(privateKeyBytes, password, 16, 0x02);
console.log("Encrypted:", ncryptsec);

// Decrypt to raw bytes
const decryptedBytes = nip49.decrypt(ncryptsec, password);
const decryptedHex = bytesToHex(decryptedBytes);
console.log("Decrypted:", decryptedHex);
