import { sha256 } from "@noble/hashes/sha256";
import type { NDKEvent } from "@nostr-dev-kit/ndk";

export async function verifySignatureAsync(event: NDKEvent): Promise<boolean> {
  // JS-thread hashing
  const raw = new TextEncoder().encode(event.serialize());
  const hash = sha256(raw);
  // nativeVerifySchnorr injected by JSI
  return (global as any).nativeVerifySchnorr(event.sig!, hash, event.pubkey!);
}