import React, { useEffect, useState, useRef } from "react";
import { createRoot } from "react-dom/client";
import NDK, {
    useNDKInit,
    NDKNip07Signer,
    NDKPrivateKeySigner,
    NDKSessionLocalStorage,
    useAvailableSessions,
    useNDKSessionSwitch,
    useNDK,
    useNDKCurrentUser,
    useNDKCurrentPubkey,
    useNDKSessionMonitor,
    useNDKSessionLogin,
    useNDKSessionLogout,
    useCurrentUserProfile,
    useNDKSessionSessions,
} from "@nostr-dev-kit/ndk-hooks";
import NDKBlossom from "@nostr-dev-kit/ndk-blossom";

// Initialize NDK outside of any component
const ndkInstance = new NDK({
    explicitRelayUrls: ["wss://relay.damus.io", "wss://relay.nostr.band", "wss://nos.lol"],
});
ndkInstance.connect();

const sessionStorage = new NDKSessionLocalStorage();

const App: React.FC = () => {
    const initializeNDK = useNDKInit();
    const { ndk } = useNDK();
    const availableSessions = useAvailableSessions();
    const currentUser = useNDKCurrentUser();
    const currentPubkey = useNDKCurrentPubkey();
    const currentProfile = useCurrentUserProfile();
    const switchSession = useNDKSessionSwitch();
    const login = useNDKSessionLogin();
    const logout = useNDKSessionLogout();
    const sessions = useNDKSessionSessions();

    // State for private key input
    const [privateKey, setPrivateKey] = useState("");
    // Blossom state
    const [blossomServers, setBlossomServers] = useState<string[]>([]);
    const [blossomLoading, setBlossomLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [uploadStatus, setUploadStatus] = useState<string>("");
    const [uploadedUrl, setUploadedUrl] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initialize NDK on component mount
    useEffect(() => {
        if (!ndk) {
            initializeNDK(ndkInstance);
        }
    }, [ndk, initializeNDK]);

    // Set up session storage and monitor
    useNDKSessionMonitor(sessionStorage, { follows: true });

    // Fetch Blossom servers when user changes
    useEffect(() => {
        if (currentUser && ndk) {
            setBlossomLoading(true);
            const blossom = new NDKBlossom(ndk);
            blossom
                .getServerList(currentUser)
                .then((serverList) => setBlossomServers(serverList?.servers ?? []))
                .catch(() => setBlossomServers([]))
                .finally(() => setBlossomLoading(false));
        } else {
            setBlossomServers([]);
        }
    }, [currentUser, ndk]);

    // Login with NIP-07 (browser extension)
    const loginWithExtension = async () => {
        const signer = new NDKNip07Signer();
        await login(signer, true);
    };

    // Login with private key
    const loginWithPrivateKey = async () => {
        if (!privateKey) {
            alert("Please enter a private key");
            return;
        }
        try {
            const signer = new NDKPrivateKeySigner(privateKey);
            await login(signer, true);
            setPrivateKey(""); // Clear the input for security
        } catch (error) {
            alert("Failed to login with private key. Make sure the key is valid.");
        }
    };

    // Generate a new private key and login
    const generateAndLogin = async () => {
        const signer = NDKPrivateKeySigner.generate();
        await login(signer, true);
    };

    // Logout current user
    const handleLogout = () => {
        if (currentPubkey) {
            logout(currentPubkey);
        }
    };

    // Format pubkey for display
    const formatPubkey = (pubkey: string | null) => {
        if (!pubkey) return "None";
        return `${pubkey.substring(0, 8)}...${pubkey.substring(pubkey.length - 8)}`;
    };

    // File upload logic
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setUploadStatus("");
            setUploadProgress(0);
            setUploadedUrl("");
        }
    };

    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const uploadFile = async () => {
        if (!file || !currentUser || !ndk) {
            alert("Please select a file and make sure you are logged in");
            return;
        }
        if (blossomServers.length === 0) {
            alert("No Blossom servers found. Please add servers to your profile first.");
            return;
        }
        setUploadStatus("uploading");
        setUploadProgress(0);

        const blossom = new NDKBlossom(ndk);
        blossom.onUploadProgress = (progress) => {
            const percent = Math.round((progress.loaded / progress.total) * 100);
            setUploadProgress(percent);
            return "continue";
        };
        blossom.onUploadFailed = (error) => {
            setUploadStatus("failed");
        };

        try {
            const result = await blossom.upload(file);
            setUploadedUrl(result.url || "");
            setUploadStatus("success");
        } catch (error) {
            setUploadStatus("failed");
            alert(`Upload failed: ${(error as Error).message}`);
        }
    };

    return (
        <div>
            <h1>NDK Blossom Upload Example</h1>
            <p>A demonstration of using ndk-hooks session monitor and ndk-blossom for file uploads</p>

            {/* Current Session Info */}
            <div>
                <h2>Current Session</h2>
                {currentUser ? (
                    <div>
                        <div>
                            <img
                                src={currentProfile?.picture || "https://via.placeholder.com/50"}
                                alt="Profile"
                                width="50"
                                height="50"
                            />
                            <div>
                                <h3>{currentProfile?.name || "Anonymous User"}</h3>
                                <p>{currentProfile?.about || "No bio available"}</p>
                                <p>Pubkey: {formatPubkey(currentPubkey ?? null)}</p>
                            </div>
                        </div>
                        <button type="button" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                ) : (
                    <p>No active session. Please login.</p>
                )}
            </div>

            {/* Available Sessions */}
            <div>
                <h2>Available Sessions</h2>
                {availableSessions.availablePubkeys.length > 0 ? (
                    <div>
                        <p>Select a session to switch:</p>
                        <ul>
                            {availableSessions.availablePubkeys.map((pubkey) => {
                                const session = sessions.get(pubkey);
                                const isActive = pubkey === currentPubkey;
                                return (
                                    <li key={pubkey} data-active={isActive}>
                                        <div>
                                            <div>
                                                <strong>{session?.profile?.name || "Anonymous User"}</strong>
                                                <p>Pubkey: {formatPubkey(pubkey ?? null)}</p>
                                            </div>
                                            {!isActive && (
                                                <button type="button" onClick={() => switchSession(pubkey)}>
                                                    Switch to this session
                                                </button>
                                            )}
                                            {isActive && <span>Active</span>}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ) : (
                    <p>No saved sessions available.</p>
                )}
            </div>

            {/* Blossom Servers */}
            {currentUser && (
                <div className="server-list">
                    <h2>Blossom Servers</h2>
                    {blossomLoading ? (
                        <p>Loading servers...</p>
                    ) : blossomServers.length > 0 ? (
                        <ul>
                            {blossomServers.map((server, index) => (
                                <li key={index} className="server-item">
                                    <span>{server}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No Blossom servers found. You need to add servers to your profile.</p>
                    )}
                </div>
            )}

            {/* File Upload */}
            {currentUser && (
                <div>
                    <h2>File Upload</h2>
                    <input type="file" ref={fileInputRef} className="file-input" onChange={handleFileSelect} />
                    <button type="button" className="file-upload-btn" onClick={triggerFileInput}>
                        Select File
                    </button>

                    {file && (
                        <div>
                            <p>
                                Selected file: {file.name} ({Math.round(file.size / 1024)} KB)
                            </p>
                            <button type="button" onClick={uploadFile} disabled={uploadStatus === "uploading"}>
                                Upload File
                            </button>

                            {uploadStatus === "uploading" && (
                                <div className="upload-progress">
                                    <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
                                    <p>{uploadProgress}% uploaded</p>
                                </div>
                            )}

                            {uploadStatus === "success" && (
                                <div>
                                    <p>Upload successful!</p>
                                    <p>
                                        URL:{" "}
                                        <a href={uploadedUrl} target="_blank" rel="noopener noreferrer">
                                            {uploadedUrl}
                                        </a>
                                    </p>
                                </div>
                            )}

                            {uploadStatus === "failed" && <p>Upload failed. Please try again.</p>}
                        </div>
                    )}
                </div>
            )}

            {/* Login Options */}
            {!currentUser && (
                <div>
                    <h2>Login Options</h2>

                    <div>
                        <h3>Login with Browser Extension (NIP-07)</h3>
                        <p>Use a Nostr browser extension like nos2x or Alby</p>
                        <button type="button" onClick={loginWithExtension}>
                            Login with Extension
                        </button>
                    </div>

                    <div>
                        <h3>Login with Private Key</h3>
                        <p>Enter your Nostr private key (nsec or hex)</p>
                        <input
                            type="password"
                            value={privateKey}
                            onChange={(e) => setPrivateKey(e.target.value)}
                            placeholder="Enter private key (nsec or hex)"
                        />
                        <button type="button" onClick={loginWithPrivateKey}>
                            Login with Private Key
                        </button>
                    </div>

                    <div>
                        <h3>Generate New Key</h3>
                        <p>Create a new Nostr identity</p>
                        <button type="button" onClick={generateAndLogin}>
                            Generate & Login
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Render the app
const container = document.getElementById("root");
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}

export default App;
