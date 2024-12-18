# Using `useUserProfile` in `ndk-mobile`

Efficiently managing user profiles is crucial for mobile applications. The `useUserProfile` hook helps streamline this process by using the SQLite cache adapter, reducing unnecessary re-renderings when the profile can be loaded synchronously.

Here's a simple example of how to use the `useUserProfile` hook in a component:

```tsx
import React from "react";
import { useUserProfile } from "ndk-mobile";

function UserProfile({ pubkey }) {
    const { userProfile, loading } = useUserProfile(pubkey);

    if (loading) return <Text>Loading...</Text>;

    return <Text>{userProfile.displayName}</Text>;
}

export default UserProfile;
```
