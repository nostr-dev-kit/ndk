import NDKBlossom from "@nostr-dev-kit/blossom";
import NDK, { NDKBlossomList, NDKEvent, NDKNip07Signer, NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import {
    NDKSessionLocalStorage,
    useAvailableSessions,
    useCurrentUserProfile,
    useNDK,
    useNDKCurrentPubkey,
    useNDKCurrentUser,
    useNDKInit,
    useNDKSessionLogin,
    useNDKSessionLogout,
    useNDKSessionMonitor,
    useNDKSessionSessions,
    useNDKSessionSwitch,
} from "@nostr-dev-kit/react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";

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
    // Server management state
    const [newServerUrl, setNewServerUrl] = useState("");
    const [savingServers, setSavingServers] = useState(false);
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

    // Add a new server to the list
    const addServer = async () => {
        if (!newServerUrl.trim() || !currentUser || !ndk) {
            alert("Please enter a valid server URL and make sure you are logged in");
            return;
        }

        try {
            // Normalize the URL
            let url = newServerUrl.trim();
            if (!url.startsWith("http://") && !url.startsWith("https://")) {
                url = "https://" + url;
            }

            // Add to local state immediately
            const updatedServers = [...blossomServers, url];
            setBlossomServers(updatedServers);
            setNewServerUrl("");

            // Save to the user's profile
            await saveServerList(updatedServers);
        } catch (error) {
            alert(`Failed to add server: ${(error as Error).message}`);
            // Revert local state on error
            setBlossomServers(blossomServers);
        }
    };

    // Remove a server from the list
    const removeServer = async (serverToRemove: string) => {
        if (!currentUser || !ndk) return;

        try {
            const updatedServers = blossomServers.filter((server) => server !== serverToRemove);
            setBlossomServers(updatedServers);
            await saveServerList(updatedServers);
        } catch (error) {
            alert(`Failed to remove server: ${(error as Error).message}`);
            // Revert local state on error
            setBlossomServers(blossomServers);
        }
    };

    // Save the server list to the user's profile
    const saveServerList = async (servers: string[]) => {
        if (!currentUser || !ndk) return;

        setSavingServers(true);
        try {
            const blossom = new NDKBlossom(ndk);
            // Create or update the blossom server list
            const serverList = await blossom.getServerList(currentUser);

            if (serverList) {
                // Update existing list
                serverList.servers = servers;
                await serverList.publish();
            } else {
                // Create new server list event
                const newServerList = new NDKBlossomList(ndk);
                newServerList.servers = servers;
                await newServerList.publish();
            }
        } finally {
            setSavingServers(false);
        }
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
            <p>A demonstration of using ndk-hooks session monitor and blossom for file uploads</p>

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
                    ) : (
                        <>
                            {blossomServers.length > 0 ? (
                                <ul>
                                    {blossomServers.map((server, index) => (
                                        <li key={index} className="server-item">
                                            <span>{server}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeServer(server)}
                                                disabled={savingServers}
                                                style={{ backgroundColor: "#dc3545", marginLeft: "10px" }}
                                            >
                                                Remove
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No Blossom servers configured. Add some servers below to upload files.</p>
                            )}

                            {/* Add Server Form */}
                            <div
                                style={{
                                    marginTop: "20px",
                                    padding: "15px",
                                    border: "1px solid #ddd",
                                    borderRadius: "4px",
                                }}
                            >
                                <h3>Add Blossom Server</h3>
                                <p>Enter a Blossom server URL (e.g., blossom.oxtr.dev)</p>
                                <input
                                    type="text"
                                    value={newServerUrl}
                                    onChange={(e) => setNewServerUrl(e.target.value)}
                                    placeholder="Enter server URL"
                                    disabled={savingServers}
                                    onKeyPress={(e) => e.key === "Enter" && addServer()}
                                />
                                <button
                                    type="button"
                                    onClick={addServer}
                                    disabled={savingServers || !newServerUrl.trim()}
                                >
                                    {savingServers ? "Saving..." : "Add Server"}
                                </button>
                            </div>
                        </>
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
