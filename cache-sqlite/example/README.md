# NDK SQLite Cache Adapter Example

This example demonstrates the functionality of the NDK SQLite cache adapter by:

1. Connecting to a Nostr relay and loading events
2. Storing those events in a local SQLite cache
3. Retrieving the same events from cache using `CACHE_ONLY` mode
4. Displaying cache statistics and validation results

## Prerequisites

- [Bun](https://bun.sh/) installed on your system
- Internet connection to connect to Nostr relays

## Installation

From the example directory, install dependencies:

```bash
bun install
```

## Running the Example

### Quick Start

```bash
bun start
```

### Development Mode (with auto-reload)

```bash
bun dev
```

### Build and Run

```bash
bun run build
bun run dist/index.js
```

## What the Example Does

1. **Initialization**: Creates an NDK instance with the SQLite cache adapter
2. **Relay Connection**: Connects to `wss://relay.damus.io` and subscribes to recent text notes (kind 1)
3. **Cache Population**: Events received from the relay are automatically stored in the SQLite cache
4. **Cache Validation**: Makes a second subscription with `CACHE_ONLY` mode to verify events are retrieved from cache
5. **Statistics**: Displays cache statistics including event counts and recent entries
6. **Cleanup**: Properly closes the database connection

## Expected Output

The example will show output similar to:

```
🎯 NDK SQLite Cache Adapter Validation Example
==================================================
🗑️  Cleaned up existing cache database
🚀 Initializing NDK with SQLite cache adapter...
✅ Cache adapter initialized

📡 Connecting to relay and loading events...
✅ Connected to wss://relay.damus.io
📝 Received event 1a2b3c4d... from npub1abc123...
📝 Received event 5e6f7g8h... from npub1def456...
...
✅ End of stored events reached. Loaded 10 events from relay

🔍 Validating cache retrieval with CACHE_ONLY mode...
💾 Retrieved cached event 1a2b3c4d... from cache
💾 Retrieved cached event 5e6f7g8h... from cache
...
✅ Cache retrieval complete. Found 10 events in cache
🎉 SUCCESS: SQLite cache is working! Events were successfully stored and retrieved from cache.

📈 Cache Statistics:
   📝 Total events in cache: 10
   👤 Total profiles in cache: 0
   🕒 Most recent cached events:
      1. 1a2b3c4d... (kind 1) - 2024-01-15T10:30:45.000Z
      2. 5e6f7g8h... (kind 1) - 2024-01-15T10:29:12.000Z
      3. 9i0j1k2l... (kind 1) - 2024-01-15T10:28:33.000Z

🧹 Cleaning up...
✅ Cache adapter closed

🎉 Example completed successfully!
   The SQLite cache adapter has been validated and is working correctly.
```

## Files Generated

- `cache.db`: SQLite database file containing cached events and profiles (automatically cleaned up)

## Troubleshooting

### No Events Loaded

If no events are loaded from the relay:
- Check your internet connection
- The relay might be temporarily unavailable
- Try running the example again after a few minutes

### Import Errors

If you see TypeScript import errors:
- Make sure you're running the example from the correct directory
- Ensure the parent `cache-sqlite` package is built: `cd .. && bun run build`

### Database Errors

If you encounter SQLite database errors:
- Make sure you have write permissions in the example directory
- Try deleting any existing `cache.db` file and running again

## Customization

You can modify the example to:
- Connect to different relays by changing `RELAY_URL`
- Subscribe to different event kinds by modifying the filter
- Adjust the number of events loaded by changing the `limit`
- Add more detailed logging or statistics

## Code Structure

- `src/index.ts`: Main application file with all the validation logic
- `package.json`: Project configuration and dependencies
- `tsconfig.json`: TypeScript configuration
- `README.md`: This documentation file