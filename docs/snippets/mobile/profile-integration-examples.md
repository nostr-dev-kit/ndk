# Integrating App-Specific Profile Features with NDK Mobile

This document demonstrates how to extend the NDK Mobile profile system with app-specific functionality like flares.

## Adding Flares to Profiles

```typescript
import { useUserProfile } from "@nostr-dev-kit/ndk-mobile";
import { useUserFlare } from "@/hooks/user-flare";

// Use separate hooks for profile and flare data
function UserCard({ pubkey }: { pubkey: string }) {
    const profileData = useUserProfile(pubkey);
    const flare = useUserFlare(pubkey);

    if (!profileData) return <div>Loading...</div>;

    if (profileData.fetchFailed) {
        return <div>Failed to load profile</div>;
    }

    return (
        <div className="user-card">
            {flare && <div className="flare">{flare}</div>}
            <img src={profileData.userProfile?.picture} alt="Profile" />
            <h3>{profileData.userProfile?.name || "Unknown"}</h3>
        </div>
    );
}
```

## Example Avatar Component Using Both Profile and Flare

```tsx
import { useUserProfile } from "@nostr-dev-kit/ndk-mobile";
import { useUserFlare } from "@/hooks/user-flare";

function UserAvatar({ pubkey }: { pubkey: string }) {
    const profileData = useUserProfile(pubkey);
    const flare = useUserFlare(pubkey);

    return (
        <div className="avatar-container">
            {flare && <div className="flare-indicator">{flare}</div>}
            <img
                src={profileData?.userProfile?.picture || `https://robohash.org/${pubkey}`}
                alt={profileData?.userProfile?.name || "User"}
                className="avatar-image"
            />
        </div>
    );
}
```

## Extending Profile with Additional Metrics

```typescript
import { useUserProfile } from "@nostr-dev-kit/ndk-mobile";
import { useUserStats } from "./app-specific/stats";

export interface EnhancedUserProfile {
    // Base profile from NDK
    userProfile: NDKUserProfile | null;
    pubkey: string;
    cachedAt?: number;
    fetchFailed?: boolean;

    // App-specific extensions
    followerCount?: number;
    postCount?: number;
    lastActive?: number;
    reputation?: number;
}

export function useEnhancedUserProfile(pubkey?: string): EnhancedUserProfile | undefined {
    // Use the NDK profile store
    const profile = useUserProfile(pubkey);

    // Get app-specific user stats
    const stats = useUserStats(pubkey);

    if (!profile) return undefined;

    return {
        ...profile,
        followerCount: stats?.followers || 0,
        postCount: stats?.posts || 0,
        lastActive: stats?.lastActive,
        reputation: stats?.reputation,
    };
}
```

## Private User Data Integration

```typescript
import { useUserProfile } from "@nostr-dev-kit/ndk-mobile";
import { usePrivateUserData } from "./app-specific/private-data";

export function useCompleteUserProfile(pubkey?: string) {
    // Get the standard profile from NDK
    const profile = useUserProfile(pubkey);

    // Get app-specific private data that shouldn't be in the library
    const privateData = usePrivateUserData(pubkey);

    if (!profile) return undefined;

    return {
        ...profile,
        isFollowing: privateData?.isFollowing || false,
        isMuted: privateData?.isMuted || false,
        customNotes: privateData?.notes,
        lastInteraction: privateData?.lastInteraction,
    };
}
```
