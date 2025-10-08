# 🥜 NDK Cashu Wallet REPL

A beautiful, feature-rich debugging REPL for the NDK Cashu Wallet. Perfect for development, testing, and understanding how the wallet works under the hood.

## Features

✨ **Beautiful TUI** - Colored boxes, tables, and gradients make debugging a pleasure
🔍 **Deep Inspection** - View proof state, wallet internals, sync status, and event logs
⚡ **Full Functionality** - Deposit, send, receive, pay invoices, and redeem nutzaps
💾 **SQLite Cache** - Fast local caching with Negentropy sync
🎯 **Real-time Updates** - Live balance updates and event logging
📊 **Detailed Analytics** - Proof management, mint balances, relay status

## Installation

```bash
# From the monorepo root
cd wallet-repl
bun install

# Run in development mode
bun run dev

# Or build and run
bun run build
bun run start
```

## Quick Start

1. **Launch the REPL**
   ```bash
   bun run dev
   ```

2. **Choose your key**
   - Use an existing private key (nsec or hex)
   - Generate a new one (for testing)

3. **Wait for sync**
   - The wallet will connect to relays
   - Negentropy sync will fetch your wallet state
   - Dashboard appears when ready

4. **Start exploring!**

## Main Dashboard

The main dashboard shows:
- Wallet status (READY/LOADING/OFFLINE)
- Active user (npub)
- P2PK address
- Number of configured mints
- Total balance
- Balance by mint
- Quick action buttons
- Debug & inspection commands
- Configuration options

## Available Commands

### Navigation
- `dashboard`, `home` - Return to main dashboard
- `clear`, `cls` - Clear screen and show dashboard
- `help`, `?` - Show help
- `exit`, `quit`, `q` - Exit the REPL

### Quick Actions
- `d`, `deposit` - Deposit funds via Lightning invoice
- `s`, `send` - Create a token to send
- `r`, `receive` - Receive a token
- `p`, `pay` - Pay a Lightning invoice

### Debug & Inspection
- `state` - View detailed wallet state (proof store, balance computation, subscriptions)
- `proofs` - List all proofs with detailed information
- `events` - View event log (recent wallet events)
- `sync` - View sync status (Negentropy, relays, cache)
- `balance`, `bal` - Show current balance
- `mints` - List configured mints with balances
- `relays` - Show relay connection status

## Workflow Examples

### Deposit Funds

```
wallet> d

? Amount (sats): 1000
? Select mint: mint.minibits.cash

⏳ Creating lightning invoice...
✓ Invoice created!

Invoice: lnbc10u1p...

[QR CODE DISPLAYED]

Amount: 1,000 sats
⏳ Waiting for payment...

✓ Payment received and tokens minted!
New balance: 1,000 sats
```

### Send a Token

```
wallet> s

? Amount (sats): 500

✓ Token created!

Token (send this to recipient):
{
  "mint": "https://mint.minibits.cash",
  "proofs": [...]
}
```

### Receive a Token

```
wallet> r

? Paste token: cashuAeyJ0b2tlbiI6W3...
? Description (optional): Payment from Alice

✓ Token received!
New balance: 1,500 sats
```

### Pay Lightning Invoice

```
wallet> p

? Lightning invoice: lnbc5u1p...

⏳ Processing payment...

✓ Payment successful!
New balance: 1,000 sats
```

## Debug Views

### Proof Manager (`proofs`)

Shows detailed proof information:
- Total, available, reserved, and destroyed proofs
- Proof tables by mint
- Secret previews
- Status indicators
- Token event links

### State Inspection (`state`)

Deep dive into wallet internals:
- Proof store maps (available, reserved, destroyed)
- Token event tracking
- Balance computation breakdown
- Subscription state
- Filter details
- Event counts

### Sync Status (`sync`)

View Negentropy sync information:
- Sync engine status
- Cache adapter status
- Last sync time and duration
- Number of events synchronized
- Per-relay sync status
- Live subscription details

### Event Log (`events`)

Recent wallet events:
- Timestamp
- Event kind
- Event ID
- Details
- Real-time updates

## Data Storage

All wallet data is stored in SQLite:
- Database location: `./wallet-data/ndk-wallet-repl.db`
- Automatic Negentropy sync with relays
- Proof state persistence
- Event caching
- Profile caching

## Development

The REPL is built with:
- **NDK Core** - Nostr development kit
- **NDK Wallet** - Cashu wallet implementation
- **Cache SQLite** - SQLite cache adapter with Negentropy
- **NDK Sync** - Negentropy-based sync
- **Inquirer** - Interactive prompts
- **Chalk** - Terminal colors
- **CLI Table 3** - Beautiful tables
- **QRCode Terminal** - QR code display
- **Figlet** - ASCII art
- **Gradient String** - Color gradients

## Architecture

```
wallet-repl/
├── src/
│   ├── index.ts              # Main entry point & REPL loop
│   ├── wallet-context.ts     # Wallet state management
│   ├── commands/
│   │   └── handlers.ts       # Command handlers
│   └── ui/
│       ├── theme.ts          # Colors, symbols, formatting
│       ├── render.ts         # Box drawing, tables, layouts
│       ├── dashboard.ts      # Main dashboard view
│       └── views.ts          # Debug views (proofs, state, sync, events)
└── package.json
```

## Tips & Tricks

1. **Fast Navigation**: Use single-letter commands (`d`, `s`, `r`, `p`)
2. **Clear Screen**: Use `clear` or `cls` to refresh the dashboard
3. **Balance Shortcuts**: Type `balance` or `bal` for quick balance check
4. **Proof Inspection**: Use `proofs` to debug proof state issues
5. **Event Tracking**: Use `events` to see what's happening in real-time
6. **Sync Debugging**: Use `sync` to diagnose sync issues

## Troubleshooting

**Wallet not syncing?**
- Check `sync` command for relay status
- Verify cache adapter is initialized
- Check event log for errors

**Proofs missing?**
- Use `proofs` to inspect proof state
- Check `state` for subscription details
- Verify mints are configured correctly

**Balance incorrect?**
- Use `state` to see balance computation
- Check for reserved or destroyed proofs
- Verify all relays are connected

## Contributing

Found a bug or want to add a feature? This REPL is designed to be easily extensible:

1. Add new commands in `commands/handlers.ts`
2. Create new views in `ui/views.ts`
3. Add UI components in `ui/render.ts`
4. Update the dashboard in `ui/dashboard.ts`

## License

MIT
