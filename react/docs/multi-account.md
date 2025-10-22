## Sessions / Multi-Account

`@nostr-dev-kit/react` supports multiple-sessions. Use `useNDKSessionLogin()` to add a session.

Sessions can be read-only (logging by providing an `NDKUser`) or full-sessions with signing access (logging by providing
an `NDKSigner`).

```tsx
import {useNDKSessionLogin, useNDKCurrentUser} from '@nostr-dev-kit/react';
import {NDKPrivateKeySigner} from '@nostr-dev-kit/ndk';

function Signin() {
  const login = useNDKSessionLogin();
  const nsec = "nsec1...."; // ask the user to enter their key or the preferred login method.
  const currentUser = useNDKCurrentUser();

  const handleLogin = useCallback(async () => {
    const signer = new NDKPrivateKeySigner(nsec);
    
    await login(signer)
    aloert("hello!")
  }, [])

  useEffect(() => {
    if (!currentUser) {
      console.log('you are not logged in)
    } else {
      console.log('you are now logged in with user with pubkey', currentUser.pubkey)
    }
  }, [currentUser])
}
```

## Managing User Sessions (Login & Multi-Account)

`@nostr-dev-kit/react` provides robust session management, supporting both single and multiple user accounts. You can
use the session monitoring functionality to automatically persist and restore user sessions across page reloads.

The session monitor will:

1. Automatically restore sessions from storage when your app loads
2. Persist new sessions when users log in
3. Update storage when sessions change
4. Remove sessions from storage when users log out

You can use this alongside the other session management hooks like `useNDKSessionLogin`, `useNDKSessionLogout`, and
`useNDKSessionSwitch`.