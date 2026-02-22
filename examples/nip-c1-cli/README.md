# NIP-C1 Collaborative Events CLI

A command-line tool for testing and validating NIP-C1 Collaborative Events implementation in NDK.

## Overview

NIP-C1 (Collaborative Events) allows multiple authors to collaborate on a single document. This is implemented as a pointer event (kind 39382) that references an underlying event (like an article) and specifies which pubkeys are authorized to update it.

## Installation

```bash
cd examples/nip-c1-cli
bun install
```

## Usage

### Create a Collaborative Document

Create a new collaborative document with one or more authors:

```bash
# Basic creation (you as the only author)
bun run dev create \
  --nsec nsec1yourprivatekey \
  --title "My Collaborative Article" \
  --content "This is the initial content of our collaborative document."

# With additional authors
bun run dev create \
  --nsec nsec1yourprivatekey \
  --title "Team Document" \
  --content "A document we all work on together." \
  --author npub1alice... \
  --author npub1bob...
```

Options:
- `-n, --nsec <nsec>` (required): Your private key for signing
- `-t, --title <title>` (required): Title of the document
- `-c, --content <content>` (required): Initial content
- `-a, --author <pubkeys...>`: Additional author pubkeys (npub or hex)
- `-d, --dtag <dtag>`: Custom d-tag identifier

### Fetch a Collaborative Document

Retrieve and display a collaborative document:

```bash
bun run dev fetch naddr1...
```

This will show:
- Collaborative event metadata (d-tag, authors, target kind)
- Current content from the latest version
- Which author last updated it

### Update a Collaborative Document

Update a document you're authorized to edit:

```bash
# Update content only
bun run dev update naddr1... \
  --nsec nsec1yourprivatekey \
  --content "Updated content here"

# Update title only
bun run dev update naddr1... \
  --nsec nsec1yourprivatekey \
  --title "New Title"

# Update both
bun run dev update naddr1... \
  --nsec nsec1yourprivatekey \
  --title "New Title" \
  --content "New content"
```

Options:
- `-n, --nsec <nsec>` (required): Your private key (must be an authorized author)
- `-t, --title <title>`: New title
- `-c, --content <content>`: New content

### Watch for Real-time Updates

Subscribe to live updates on a collaborative document:

```bash
bun run dev watch naddr1...
```

This will:
- Show existing versions as they're received
- Display real-time updates from any authorized author
- Show who made each update and when
- Indicate which version is currently the "latest"

Press `Ctrl+C` to stop watching.

## Testing Workflow

Here's a complete test flow with two users:

### Terminal 1 (Alice - creates the document):
```bash
# Generate a test key if needed
bun -e "import { NDKPrivateKeySigner } from '@nostr-dev-kit/ndk'; const s = NDKPrivateKeySigner.generate(); console.log('nsec:', s.nsec, '\\nnpub:', s.npub)"

# Create a collaborative document with Bob as co-author
bun run dev create \
  --nsec nsec1alicekey \
  --title "Our Shared Doc" \
  --content "Hello from Alice!" \
  --author npub1bobspubkey

# Note the naddr output
```

### Terminal 2 (Bob - watches for updates):
```bash
bun run dev watch naddr1...
```

### Terminal 1 (Alice - updates the document):
```bash
bun run dev update naddr1... \
  --nsec nsec1alicekey \
  --content "Alice updated the content!"
```

### Terminal 3 (Bob - also updates):
```bash
bun run dev update naddr1... \
  --nsec nsec1bobskey \
  --content "Bob made his own edit!"
```

Watch Terminal 2 to see both updates arrive in real-time!

## Relays

The CLI uses these public relays by default:
- wss://relay.damus.io
- wss://nos.lol
- wss://relay.primal.net

## Troubleshooting

### "Collaborative event not found"
- The event may not have propagated to all relays yet
- Try waiting a few seconds and fetching again
- Verify the naddr is correct

### "You are not an authorized author"
- Only pubkeys listed in the collaborative event's p-tags can update
- Check the list of authorized authors with the `fetch` command

### No updates appearing in watch
- Ensure the collaborative event exists first (use `fetch`)
- Check that updates are being published to the same relays
- Wait a few seconds for relay propagation

## Technical Details

- **Kind 39382**: The collaborative pointer event
- **Kind 30023**: The underlying article (NIP-23)
- The d-tag of the article matches the d-tag of the collaborative pointer
- Updates are regular replaceable events from authorized authors
- The "latest" version is determined by highest `created_at` timestamp
