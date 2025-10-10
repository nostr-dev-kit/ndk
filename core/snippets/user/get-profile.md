# Getting Profile Information

This snippet demonstrates how to fetch user profile information using NDK.

## Basic Profile Fetching

Use `NDKUser`'s `fetchProfile()` to fetch a user's profile.

```typescript
// Get an NDKUser instance for a specific pubkey
const user = ndk.getUser({ pubkey: "user_pubkey_here" });

// Fetch their profile
try {
    const profile = await user.fetchProfile();
    console.log("Profile loaded:", profile);
} catch (e) {
    console.error("Error fetching profile:", e);
}
```

## Profile Data Structure

The profile object contains standard Nostr profile fields:

```typescript
interface NDKUserProfile {
    name?: string;
    displayName?: string;
    image?: string;
    banner?: string;
    about?: string;
    nip05?: string;
    lud06?: string; // Lightning Address
    lud16?: string; // LNURL
    website?: string;
}
```
