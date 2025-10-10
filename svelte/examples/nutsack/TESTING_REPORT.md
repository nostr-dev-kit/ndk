# Nutsack Wallet - Testing & Bug Report

**Date:** 2025-10-04
**Tester:** Claude Code
**Test Environment:** Playwright MCP Browser Automation
**Test Accounts:**
- Account 1: `nsec16muyegsrkdhga3v7aq2u6nah725usqar48aqca8c55ayvn75udesn0tlck`
- Account 2: `nsec1dwlunk8e89f9j8006r86n56jmasp2yke4zjy8kynpr9dj832wpts76wmdf`

---

## Executive Summary

The nutsack wallet example has been reviewed and tested. **CRITICAL SESSION BUG FIXED** ✅ - the app now properly uses ndk-svelte5's session store for authentication. However, **CRITICAL DEPOSIT BUGS FOUND** ❌ in the minting/deposit functionality.

### Test Results Overview

| Feature | Status | Notes |
|---------|--------|-------|
| Login Flow | ✅ **FIXED & WORKING** | Session store integration successful |
| Session Management | ✅ **FIXED & WORKING** | Properly using `sessions.current` |
| Wallet Initialization | ✅ WORKING | Wallet initializes on login |
| Deposit/Mint Flow | ❌ **BROKEN** | Multiple critical issues |
| Balance Display | ✅ WORKING | Shows 0 sats correctly |
| UI/UX | ✅ WORKING | Clean interface, proper navigation |
| Relay Publishing | ❌ **BROKEN** | Events fail to publish |

---

## Critical Bugs Fixed

### 🔧 Bug #1: Session Detection Not Working (FIXED)

**Original Issue:**
- App used manual `ndk.activeUser` tracking instead of ndk-svelte5's session store
- `ndk.activeUser` is not reactive, so login didn't trigger UI updates
- User remained on LoginView even after successful authentication

**Root Cause:**
```typescript
// ❌ BROKEN - ndk.activeUser is not reactive
let currentUser = $state(ndk.activeUser);

$effect(() => {
  currentUser = ndk.activeUser; // This never triggers!
});
```

**Fix Applied:**
- Updated `App.svelte` to use `sessions.current` (reactive)
- Updated `LoginView.svelte` to use `sessions.login(signer)`
- Updated `useWallet.svelte.ts` to use `sessions.current`
- Added `sessions.init(ndk)` in App.svelte onMount

**Files Modified:**
- `/ndk-svelte5/examples/nutsack/src/App.svelte`
- `/ndk-svelte5/examples/nutsack/src/components/LoginView.svelte`
- `/ndk-svelte5/examples/nutsack/src/lib/useWallet.svelte.ts`

**Verification:** ✅ Login now works perfectly - app transitions from LoginView to WalletView successfully

---

### 🔧 Bug #2: Receive View UX Issues (FIXED)

**Original Issues:**
1. Defaulted to "Paste Token" tab instead of deposit/mint tab
2. Hardcoded testnet mint URL instead of using NIP-60 wallet configuration
3. No ability to select which mint to deposit to

**Problems:**
```typescript
// ❌ BROKEN - Hardcoded testnet mint
const TESTNET_MINT = 'https://nofees.testnut.cashu.space';
const deposit = wallet.deposit(amount, TESTNET_MINT);

// ❌ BROKEN - Wrong default tab
let activeTab = $state<'paste' | 'mint'>('paste');
```

**Fix Applied:**
- Changed default tab to 'mint' (deposit)
- Use `wallet.mints` to get configured mints from NIP-60 wallet
- Added mint selector dropdown
- Tabs reordered: "Deposit" first, then "Paste Token"
- Removed testnet-specific messaging

**New Implementation:**
```typescript
// ✅ FIXED - Use wallet's configured mints
let availableMints = $derived(wallet.mints || []);
let selectedMint = $state<string>('');

// Auto-select first mint
$effect(() => {
  if (availableMints.length > 0 && !selectedMint) {
    selectedMint = availableMints[0];
  }
});

// Use selected mint for deposit
const deposit = wallet.deposit(amount, selectedMint);
```

**Files Modified:**
- `/ndk-svelte5/examples/nutsack/src/components/ReceiveView.svelte`

**Verification:** ✅ Now defaults to Deposit tab with dropdown to select from configured mints

---

## Critical Bugs Found (Not Yet Fixed)

### 🐛 Bug #3: Deposit Flow - Missing Lightning Invoice

**Issue:** Lightning invoice is not displayed in the UI after creating a mint deposit

**Symptoms:**
- "Payment Request Created" screen shows amount but no invoice
- No way to copy or pay the Lightning invoice
- Deposit flow is unusable for real testing

**Root Cause Analysis:**
- Code expects `deposit.pr` to contain the Lightning invoice after `deposit.start()`
- `deposit.pr` is `undefined` or not set correctly
- UI conditionally renders invoice box only if `depositInvoice` is truthy

**Code Location:** `/ndk-svelte5/examples/nutsack/src/components/ReceiveView.svelte:79-81`
```typescript
// Get the lightning invoice
if (deposit.pr) {
  depositInvoice = deposit.pr;
}
```

**Network Evidence:**
- `POST /v1/mint/quote/bolt11` → 200 OK (quote created)
- Quote response likely contains invoice, but it's not being extracted properly

**Impact:** HIGH - Cannot test real Lightning deposits

---

### 🐛 Bug #4: Deposit Auto-Check Causes Quote Exhaustion

**Issue:** Deposit flow automatically checks mint status too aggressively, causing quote to be consumed before Lightning payment

**Symptoms:**
- Mint API returns 400 error: "quote has already been issued"
- Console shows: `"Mint is saying the quote has already been issued, destroying quote"`
- Deposit destroys itself before user can pay

**Evidence from Network Log:**
1. `POST /v1/mint/quote/bolt11` → 200 OK
2. `POST /v1/mint/bolt11` → 200 OK (first mint attempt)
3. `POST /v1/mint/bolt11` → 400 Bad Request (second mint attempt fails)

**Root Cause:**
- NDKCashuDeposit likely has auto-checking mechanism
- Check happens immediately after `.start()` before invoice can be paid
- Mint interprets check as minting attempt, exhausting the quote

**Impact:** HIGH - Testnet minting is completely broken

---

### 🐛 Bug #5: Relay Publishing Failures

**Issue:** All Nostr events fail to publish to relay

**Symptoms:**
- Console errors: `NDKPublishError: Not enough relays received the event (0 published, 1 required)`
- Relay: `wss://purplepag.es` shows "Publish failed"
- Wallet state events cannot be saved

**Evidence:**
```
[DEBUG] %cndk:relay:wss://purplepag.es %cPublish failed%c
NDKPublishError: Not enough relays received the event (0 published, 1 required)
```

**Impact:** MEDIUM - Wallet state not persisted, but local operations work

---

### 🐛 Bug #6: Encryption/Decryption Warnings

**Issue:** Warnings about missing decrypted events

**Symptoms:**
```
[WARNING] [WASM] No decrypted event found for ID: f70f339e31eaea8bf51c3e85384c66a06606a817b066fe3af8...
```

**Root Cause:** Unknown - possibly related to NIP-60 wallet state encryption

**Impact:** LOW - May affect wallet state recovery

---

## What's Working Well ✅

1. **Session Management** - Fully functional after fix
2. **Wallet Initialization** - Properly initializes NDKCashuWallet on login
3. **UI/Navigation** - Clean, responsive interface with proper routing
4. **Balance Display** - Correctly shows 0 sats for empty wallet
5. **Transaction History UI** - Renders correctly (empty state)
6. **Mint Configuration** - Correctly configured with testnet mint URL
7. **Error Handling** - Good error messages and loading states

---

## Svelte 5 Runes Usage ✅

The app correctly uses Svelte 5 runes throughout:

- `$state()` for reactive state
- `$derived()` for computed values
- `$effect()` for side effects
- `$props()` for component props

**Example from App.svelte:**
```typescript
$effect(() => {
  const currentSession = sessions.current;
  if (currentSession) {
    payments.init(ndk, currentSession.pubkey);
    // ...
  }
});
```

---

## Recommendations

### Immediate Fixes Needed

1. **Fix Lightning Invoice Display**
   - Investigate `NDKCashuDeposit.pr` property
   - Check if invoice is in `deposit.quote.request` or similar
   - Add logging to see deposit object structure after `.start()`

2. **Fix Auto-Check Behavior**
   - Disable automatic mint status checking
   - Only check status when user explicitly clicks "Check Status"
   - Or implement proper payment-received event handling

3. **Fix Relay Publishing**
   - Verify relay URL and permissions
   - Check if relay accepts NIP-60 events
   - Consider adding fallback relays

### Testing Gaps

- ❌ Deposit flow (blocked by bugs)
- ❌ Nutzap sending (requires funds)
- ❌ Nutzap receiving (requires funds)
- ❌ Token receiving via paste (no test token available)
- ❌ Multi-mint balance distribution
- ❌ Transaction history with real data

---

## Code Quality Assessment

### Positive Aspects
- Clean component structure
- Good separation of concerns (useWallet abstraction)
- Proper TypeScript types
- Good error handling patterns
- Responsive UI design

### Areas for Improvement
- Missing invoice extraction logic
- Overly aggressive status checking
- Relay configuration needs review
- Need better logging for debugging deposit flow
- Consider adding deposit flow state machine

---

## Next Steps

1. ✅ **COMPLETED:** Fix session store integration
2. 🔧 **IN PROGRESS:** Document all findings
3. ⏳ **TODO:** Fix deposit invoice display issue
4. ⏳ **TODO:** Fix auto-check behavior
5. ⏳ **TODO:** Test complete deposit flow with testnet Lightning
6. ⏳ **TODO:** Test nutzap functionality between two accounts
7. ⏳ **TODO:** Create cookbooks for ndk-svelte5-learn

---

## Technical Debt & DX Improvements

### API Improvements Needed in ndk-wallet

1. **NDKCashuDeposit API clarity**
   - Document where Lightning invoice is accessible
   - Clarify when `.pr` property is set
   - Document auto-check behavior and how to control it

2. **Better error messages**
   - More specific error types (QuoteExhausted, MintUnavailable, etc.)
   - Include mint URL in error context

3. **Deposit lifecycle events**
   - `quote-created` event with invoice
   - `payment-detected` event
   - `minting-complete` event

### Cookbook Topics Identified

1. Basic wallet setup and initialization
2. Session management with ndk-svelte5
3. Creating and handling deposits
4. Sending and receiving nutzaps
5. Transaction history display
6. Multi-mint balance management
7. Error handling patterns
8. Wallet state persistence

---

## Conclusion

**Session bug successfully fixed** - the app now properly detects login and manages sessions using ndk-svelte5's session store. This was the critical blocker preventing any wallet functionality from working.

**Deposit flow has serious issues** that need investigation at the ndk-wallet level. The missing invoice and aggressive auto-checking make the feature unusable for testing.

The app demonstrates good Svelte 5 patterns and clean architecture, but needs wallet integration fixes before it can be used as a reference implementation.
