import type { NDKNutzap, NDKUser, NDKZap } from "@nostr-dev-kit/ndk";

export interface ProcessedZap {
  amount: number;
  sender: NDKUser;
  recipient: NDKUser;
  comment?: string;
  // Access typed instances
  zap?: NDKZap; // For NIP-57
  nutzap?: NDKNutzap; // For NIP-61
}
