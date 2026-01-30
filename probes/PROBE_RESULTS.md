# Wallet Package Probe Validation Results

**Date**: 2026-01-09
**Package**: @nostr-dev-kit/wallet
**Testnet Mint**: https://testnut.cashu.space
**Test Relays**: wss://relay.primal.net, wss://nos.lol

## Executive Summary

| Probe | Description | Result | Notes |
|-------|-------------|--------|-------|
| 1.1 | Wallet Initialization | PASS | All checks passed |
| 1.2 | Deposit Flow | PASS | Deposit succeeded, 21 sats minted |
| 2.1 | Send Token | PARTIAL | Bug found in `wallet.send()`, low-level API works |

---

## Probe 1.1: Wallet Initialization & Event Publishing

### Objective
Verify that `NDKCashuWallet.create()` correctly generates keys, publishes wallet event (kind 17375), and backup event (kind 375).

### Results
| Check | Status |
|-------|--------|
| Wallet Created | PASS |
| P2PK Generated | PASS |
| Kind 17375 Published | PASS |
| Kind 375 Published | PASS |
| Events Encrypted | PASS |

### Details
- Generated p2pk: 64 character hex string
- Kind 17375 event encrypted content: 304 bytes
- Kind 375 backup event encrypted content: 260 bytes
- Both events properly encrypted with NIP-44

---

## Probe 1.2: Deposit Flow

### Objective
Verify deposit flow: create deposit, get invoice, mint proofs, update balance.

### Results
| Check | Status |
|-------|--------|
| Deposit Created | PASS |
| Invoice Returned | PASS |
| Quote Event (7374) Published | PASS |
| Deposit Finalized | PASS |
| Balance Updated | PASS |
| Token Event (7375) Published | PASS |

### Details
- Deposit amount: 21 sats
- Invoice format: Valid BOLT11 starting with `lnbc`
- Quote ID generated and stored
- Testnet mint provides immediate minting (no actual LN payment needed)
- Balance correctly increased from 0 to 21 sats

---

## Probe 2.1: Send Token

### Objective
Verify `wallet.send()` creates valid cashu tokens.

### Results
| Check | Status |
|-------|--------|
| Wallet Funded | PASS |
| wallet.send() | BUG FOUND |
| Low-level send (workaround) | PASS |
| Token Valid Format | PASS |
| Token Decodable | PASS |
| Amount Correct | PASS |
| Balance State Update | FAIL (bypassed due to bug) |

### Bug Identified: `mintNuts()` Proof Not Found Error

**Location**: `wallet/src/wallets/cashu/wallet/index.ts` lines 169-208

**Problem**: The `mintNuts()` function incorrectly handles proof state updates.

```typescript
// Current code (buggy):
result = await wallet.send(totalAmount, mintProofs, { ... });
const change = { store: result?.keep ?? [], destroy: result.send, mint };
//                                                 ^^^^^^^^^^^^^^
// BUG: result.send contains NEW proofs (outputs), not the original inputs
```

**Expected Behavior**: The `destroy` array should contain the ORIGINAL proofs that were used as inputs to the swap, not the NEW proofs generated for sending.

**Error Message**: `Error: Proof not found` when calling `updateProof()` on proofs that don't exist in wallet state.

### Workaround
Using the low-level cashu-ts API directly works:

```typescript
const cashuWallet = await wallet.getCashuWallet(TESTNET_MINT);
const proofs = wallet.state.getProofs({ mint: TESTNET_MINT });
const sendResult = await cashuWallet.send(amount, proofs, {
    proofsWeHave: proofs,
    includeFees: true,
});
const token = getEncodedToken({
    mint: TESTNET_MINT,
    proofs: sendResult.send,
    memo: "payment",
});
```

### Generated Token
- Format: Valid cashuB token
- Mint: https://testnut.cashu.space
- Proofs: 3
- Amount: 9 sats (8 + 1 sat fee)
- Memo: "Test payment memo"

---

## Recommendations

### Bug Fix Required
The `mintNuts()` function needs to track which proofs were used as inputs and destroy those, not the output proofs. The cashu-ts `wallet.send()` method returns:
- `send`: NEW proofs to give to recipient
- `keep`: NEW change proofs to keep

The original input proofs are consumed in the swap and should be marked as deleted.

---

## Scripts Location

All probe scripts are located at:
```
/probes/
├── probe-1.1-wallet-init.ts
├── probe-1.2-deposit.ts
├── probe-2.1-send-token.ts
├── package.json
└── tsconfig.json
```

Run with:
```bash
cd probes && bun run probe:1.1
cd probes && bun run probe:1.2
cd probes && bun run probe:2.1
```
