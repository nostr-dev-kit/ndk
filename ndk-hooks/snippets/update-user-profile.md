# Updating User Profile in React

This snippet demonstrates how to update and save a user's profile (e.g., after changing their name or other fields) in a React application using ndk-hooks. The `useSetProfile` hook provides a function to persist profile modifications to relays as well as immediately trigger updating the profiles' store.

## Example: Editing and Saving a Profile

```tsx
import { useProfileValue, useSetProfile } from '@nostr-dev-kit/ndk-hooks';
import { useState } from 'react';

function EditProfile({ pubkey }: { pubkey: string }) {
  // Get the current profile
  const profile = useProfileValue(pubkey);
  // Get the updater function
  const setProfile = useSetProfile();

  // Local state for editing
  const [name, setName] = useState(profile?.name || '');

  // Save the updated profile
  const handleSave = () => {
    setProfile(pubkey, { ...profile, name });
  };

  return (
    <form onSubmit={e => { e.preventDefault(); handleSave(); }}>
      <label>
        Name:
        <input
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </label>
      <button type="submit">Save Profile</button>
    </form>
  );
}
```

**Usage tips:**
- `useProfileValue(pubkey)` returns the current profile for the given pubkey.
- `useSetProfile()` returns a function that can be called with a pubkey and a new profile object to save changes to relays.
- Call the updater after the user edits their profile fields to persist the changes.