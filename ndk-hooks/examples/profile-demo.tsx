import NDK from '@nostr-dev-kit/ndk';
import React, { useEffect, useState } from 'react';
import { useProfile, useUserProfilesStore } from '../src';

// Example component that displays a user profile
function UserProfile({ pubkey }: { pubkey: string }) {
    const profile = useProfile(pubkey);

    if (!profile) {
        return <div>Loading profile...</div>;
    }

    return (
        <div className="user-profile">
            {profile.picture && <img src={profile.picture} alt={profile.name || 'User'} className="profile-picture" />}
            <h2>{profile.name || 'Anonymous'}</h2>
            {profile.nip05 && <p className="nip05">{profile.nip05}</p>}
            {profile.about && <p className="about">{profile.about}</p>}
        </div>
    );
}

// Main app component
export default function App() {
    const [isNdkReady, setNdkReady] = useState(false);
    const [pubkey, setPubkey] = useState('');

    // Initialize NDK and the profiles store on mount
    useEffect(() => {
        async function initializeNDK() {
            const ndk = new NDK({
                explicitRelayUrls: ['wss://relay.nostr.band', 'wss://relay.damus.io', 'wss://nos.lol'],
            });

            await ndk.connect();

            // Initialize the profiles store with the NDK instance
            useUserProfilesStore.getState().initialize(ndk);

            setNdkReady(true);
        }

        initializeNDK().catch(console.error);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Form validation would go here
    };

    return (
        <div className="app">
            <h1>Nostr Profile Viewer</h1>

            {!isNdkReady && <p>Initializing NDK...</p>}

            {isNdkReady && (
                <>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            placeholder="Enter a Nostr pubkey"
                            value={pubkey}
                            onChange={(e) => setPubkey(e.target.value)}
                            className="pubkey-input"
                        />
                        <button type="submit">View Profile</button>
                    </form>

                    {pubkey && <UserProfile pubkey={pubkey} />}
                </>
            )}
        </div>
    );
}
