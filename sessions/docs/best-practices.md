# Best Practices

## Always Call destroy()

```typescript
// In your cleanup code
sessions.destroy();
```

## Use autoSave

```typescript
const sessions = new NDKSessionManager(ndk, {
    autoSave: true,
    saveDebounceMs: 500
});
```

## Handle No Active Session

```typescript
if (!sessions.activeUser) {
    // Show login UI
}
```

## Subscribe to Changes

```typescript
const unsubscribe = sessions.subscribe((state) => {
    // Update UI when sessions change
});
```

## Security

```typescript
// ⚠️ NEVER commit .ndk-sessions.json to git!
// Add to .gitignore:
// .ndk-sessions.json

// Use environment variables for sensitive keys
const nsec = process.env.NOSTR_NSEC;
```
