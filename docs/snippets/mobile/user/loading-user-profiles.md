# Loading User Profiles

This snippet demonstrates how to load and cache user profiles in a mobile app using NDK Mobile.

```typescript
import { useUserProfile } from '@nostr-dev-kit/ndk-mobile';
import { View, Text, Image } from 'react-native';

// Example component using NDK Mobile's built-in profile hook
function ProfileComponent({ pubkey }: { pubkey: string }) {
    // useUserProfile hook handles caching and network fetching automatically
    const { userProfile, loading } = useUserProfile(pubkey);

    if (loading) return <LoadingSpinner />;
    if (!userProfile) return null;

    return (
        <View>
            <Text>{userProfile.name}</Text>
            <Text>{userProfile.about}</Text>
            {userProfile.picture && <Image source={{ uri: userProfile.picture }} />}
        </View>
    );
}
```

Key features:

- Built-in SQLite caching through NDK's cache adapter
- Automatic profile fetching and state management
- Type-safe profile data handling
- Zero-config setup (works with NDK's mobile provider)
