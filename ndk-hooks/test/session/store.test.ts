import NDK from '@nostr-dev-kit/ndk'; // Changed from 'import type'
import { NDKEvent, NDKUser } from '@nostr-dev-kit/ndk';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'; // Import Mock type as a type
import { useNDKSessions } from '../../src/session/store';

// Mock NDK and related classes/functions
vi.mock('@nostr-dev-kit/ndk', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@nostr-dev-kit/ndk')>();
    return {
        ...actual,
        NDK: vi.fn().mockImplementation(() => {
            // Return an object where methods are explicitly mocks
            return {
                fetchEvent: vi.fn(),
                publish: vi.fn(),
                subscribe: vi.fn().mockReturnValue({
                    on: vi.fn(),
                    start: vi.fn()
                }),
                signer: undefined, // Add signer property that can be set
                // Add other methods if needed by tests
            };
        }),
        NDKUser: vi.fn().mockImplementation(({ pubkey }) => ({
            pubkey: pubkey,
            fetchProfile: vi.fn(),
            follows: vi.fn().mockResolvedValue(new Set()), // Default mock
        })),
        NDKEvent: vi.fn().mockImplementation(() => ({
            kind: 0, // Default kind
            tags: [],
            content: '',
            id: Math.random().toString(36).substring(7), // Simple unique ID for tests
            // Add other properties if needed
        })),
    };
});

// Helper to reset store before each test
const resetStore = () =>
    useNDKSessions.setState({ sessions: new Map(), activeSessionPubkey: null });

describe('useNDKSessions Zustand Store', () => {
    beforeEach(() => {
        // Reset store state and mocks before each test
        resetStore();
        vi.clearAllMocks();
    });

    const pubkey1 = 'pubkey1';
    const pubkey2 = 'pubkey2';
    const mockNdkInstance = new NDK(); // Use mocked NDK constructor
    // Explicitly ensure fetchEvent on the instance is a mock function
    mockNdkInstance.fetchEvent = vi.fn();
    const mockUser1 = new NDKUser({ pubkey: pubkey1 });
    const mockUser2 = new NDKUser({ pubkey: pubkey2 });

    // Create a mock signer for testing
    // Create a more complete mock signer for testing type compatibility
    const mockSigner = {
        user: vi.fn().mockReturnValue(mockUser1), // Mock user associated with signer
        pubkey: pubkey1, // Add pubkey property
        sign: vi.fn().mockResolvedValue({ sig: 'mockSignature' }),
        getPublicKey: vi.fn().mockResolvedValue(pubkey1), // Ensure this returns the correct pubkey
        // Add other necessary NDKSigner properties/methods as mocks if needed by tests
        blockUntilReady: vi.fn().mockResolvedValue(undefined),
        userSync: vi.fn(),
        authUrl: vi.fn(),
        relay: undefined,
        token: undefined,
    } as unknown as import('@nostr-dev-kit/ndk').NDKSigner; // Still need cast as it's a partial mock

    it('should initialize with empty sessions and null active pubkey', () => {
        const state = useNDKSessions.getState();
        expect(state.sessions.size).toBe(0);
        expect(state.activeSessionPubkey).toBeNull();
    });

    // --- Basic Session Management ---

    it('createSession: should add a new session', () => {
        useNDKSessions.getState().ensureSession(mockUser1); // Use ensureSession
        const state = useNDKSessions.getState();
        expect(state.sessions.size).toBe(1);
        expect(state.sessions.has(pubkey1)).toBe(true);
        const session = state.sessions.get(pubkey1);
        expect(session?.pubkey).toBe(pubkey1);
        expect(session?.mutedPubkeys).toBeInstanceOf(Set);
        // ensureSession does NOT set active
        expect(state.activeSessionPubkey).toBeNull();
    });

    it('createSession: should not overwrite existing session', () => {
        // Test that createSession doesn't overwrite with invalid data
        // createSession now only accepts 'signer' in initialData
        useNDKSessions.getState().ensureSession(mockUser1); // Use ensureSession
        const initialSession = useNDKSessions.getState().sessions.get(pubkey1);
        // Test ensureSession doesn't overwrite existing data (except signer)
        useNDKSessions.getState().ensureSession(mockUser1); // Call again
        const state = useNDKSessions.getState();
        expect(state.sessions.size).toBe(1);
        // Ensure the original session object wasn't fundamentally changed (check a core prop)
        expect(state.sessions.get(pubkey1)?.pubkey).toBe(initialSession?.pubkey); // Check core prop
        // Add more checks if ensureSession modified other things unintentionally
    });

    it('updateSession: should update an existing session', () => {
        useNDKSessions.getState().ensureSession(mockUser1); // Use ensureSession
        const updateData = { followSet: new Set(['follow1']), lastActive: 123 };
        useNDKSessions.getState().updateSession(pubkey1, updateData);
        const session = useNDKSessions.getState().sessions.get(pubkey1);
        expect(session?.followSet).toEqual(new Set(['follow1']));
        expect(session?.lastActive).not.toBe(123); // lastActive is always updated internally
    });

    it('updateSession: should not update a non-existent session', () => {
        useNDKSessions.getState().updateSession(pubkey1, { followSet: new Set(['f1']) });
        expect(useNDKSessions.getState().sessions.size).toBe(0);
    });

    it('removeSession: should remove an existing session', () => {
        useNDKSessions.getState().ensureSession(mockUser1); // Use ensureSession
        useNDKSessions.getState().removeSession(pubkey1); // Use removeSession
        expect(useNDKSessions.getState().sessions.has(pubkey1)).toBe(false);
        expect(useNDKSessions.getState().activeSessionPubkey).toBeNull(); // Active was deleted
    });

    it('removeSession: should set another session active if the active one is deleted', () => {
        useNDKSessions.getState().ensureSession(mockUser1);
        useNDKSessions.getState().ensureSession(mockUser2);
        // Manually set active for the test scenario
        useNDKSessions.setState({ activeSessionPubkey: pubkey1 });
        useNDKSessions.getState().removeSession(pubkey1); // Use removeSession
        expect(useNDKSessions.getState().sessions.has(pubkey1)).toBe(false);
        expect(useNDKSessions.getState().activeSessionPubkey).toBe(pubkey2); // pubkey2 becomes active
    });

    // Removed setActiveSession tests (functionality tested via switchToUser)



    // --- Getters ---

    it('getSession: should return the correct session data', () => {
        // createSession no longer accepts 'relays'
        useNDKSessions.getState().ensureSession(mockUser1); // Use ensureSession
        const session = useNDKSessions.getState().sessions.get(pubkey1); // Use direct access
        expect(session?.pubkey).toBe(pubkey1); // Changed property name
        // expect(session?.relays).toEqual(['r1']); // Removed check for non-existent property
    });

    it('getSession: should return undefined for non-existent session', () => {
        const session = useNDKSessions.getState().sessions.get(pubkey1); // Use direct access
        expect(session).toBeUndefined();
    });

    it('getActiveSession: should return the active session data', () => {
        useNDKSessions.getState().ensureSession(mockUser1);
        useNDKSessions.getState().ensureSession(mockUser2);
        // Manually set active for test
        useNDKSessions.setState({ activeSessionPubkey: pubkey2 });
        const state = useNDKSessions.getState();
        const activeSession = state.activeSessionPubkey ? state.sessions.get(state.activeSessionPubkey) : undefined; // Use direct access
        expect(activeSession?.pubkey).toBe(pubkey2); // Changed property name
        // expect(activeSession?.relays).toEqual(['r2']); // Removed check for non-existent property
    });

    it('getActiveSession: should return undefined if no session is active', () => {
        const stateAfter = useNDKSessions.getState(); // Use different name to avoid conflict
        const activeSession = stateAfter.activeSessionPubkey ? stateAfter.sessions.get(stateAfter.activeSessionPubkey) : undefined; // Use direct access
        expect(activeSession).toBeUndefined();
    });

    // --- Session Data Interaction ---

    // Tests for addEventToSession removed

    it('muteItemForSession: should add item to the correct mute set', () => {
        useNDKSessions.getState().ensureSession(mockUser1); // Use ensureSession
        useNDKSessions
            .getState()
            .muteItemForSession(pubkey1, 'mutePubkey', 'pubkey'); // Removed publish arg
        useNDKSessions
            .getState()
            .muteItemForSession(pubkey1, 'MuteTag', 'hashtag'); // Removed publish arg
        const session = useNDKSessions.getState().sessions.get(pubkey1); // Use direct access
        expect(session?.mutedPubkeys.has('mutePubkey')).toBe(true);
        expect(session?.mutedHashtags.has('MuteTag')).toBe(true); // Should store original case now
    });

    // --- Initialization (Refactored Tests) ---
    // initSession now only ensures a session entry exists and updates the signer.
    // It does NOT fetch data or accept NDK/opts/callback.

    it('ensureSession: should create a new session if one does not exist', () => { // Renamed test
        const result = useNDKSessions.getState().ensureSession(mockUser1); // Use ensureSession
        expect(result).toBe(pubkey1);
        const state = useNDKSessions.getState();
        expect(state.sessions.has(pubkey1)).toBe(true);
        const session = state.sessions.get(pubkey1);
        expect(session?.pubkey).toBe(pubkey1);
        expect(session?.signer).toBeUndefined(); // No signer provided
        // Should NOT automatically set active
        expect(state.activeSessionPubkey).toBeNull();
    });

    it('ensureSession: should create a new session with a signer', () => { // Renamed test
        const result = useNDKSessions.getState().ensureSession(mockUser1, mockSigner); // Use ensureSession
        expect(result).toBe(pubkey1);
        const state = useNDKSessions.getState();
        expect(state.sessions.has(pubkey1)).toBe(true);
        const session = state.sessions.get(pubkey1);
        expect(session?.pubkey).toBe(pubkey1);
        expect(session?.signer).toBe(mockSigner);
        expect(state.activeSessionPubkey).toBeNull(); // Still should not set active
    });

    it('ensureSession: should not overwrite existing session data (except signer)', () => { // Renamed test
        // Create session with some initial data (e.g., via updateSession)
        useNDKSessions.getState().ensureSession(mockUser1); // Use ensureSession
        useNDKSessions.getState().updateSession(pubkey1, { mutedWords: new Set(['test']) });

        const result = useNDKSessions.getState().ensureSession(mockUser1); // Use ensureSession
        expect(result).toBe(pubkey1);
        const session = useNDKSessions.getState().sessions.get(pubkey1);
        expect(session?.mutedWords.has('test')).toBe(true); // Existing data preserved
        expect(session?.signer).toBeUndefined(); // Signer should remain undefined
    });

    it('ensureSession: should update signer on existing session if different', () => { // Renamed test
        useNDKSessions.getState().ensureSession(mockUser1); // Use ensureSession
        const result = useNDKSessions.getState().ensureSession(mockUser1, mockSigner); // Use ensureSession
        expect(result).toBe(pubkey1);
        const session = useNDKSessions.getState().sessions.get(pubkey1);
        expect(session?.signer).toBe(mockSigner); // Signer should be updated
    });

    it('ensureSession: should not update signer on existing session if same', () => { // Renamed test
        useNDKSessions.getState().ensureSession(mockUser1, mockSigner); // Use ensureSession with signer
        const result = useNDKSessions.getState().ensureSession(mockUser1, mockSigner); // Use ensureSession
        expect(result).toBe(pubkey1);
        // We can't easily check if the update function was *not* called without more complex mocking,
        // but we verify the signer is still the correct one.
        const session = useNDKSessions.getState().sessions.get(pubkey1);
        expect(session?.signer).toBe(mockSigner);
    });

    // --- Signer Support Tests ---

    it('createSession: should store a signer when provided in initialData', () => {
        // Use the existing mockSigner
        useNDKSessions.getState().ensureSession(mockUser1, mockSigner); // Use ensureSession with signer
        
        const session = useNDKSessions.getState().sessions.get(pubkey1); // Use direct access
        expect(session?.signer).toBe(mockSigner);
    });

    it('createSession: should work without a signer for backward compatibility', () => {
        // createSession no longer accepts 'relays'
        useNDKSessions.getState().ensureSession(mockUser1); // Use ensureSession

        const session = useNDKSessions.getState().sessions.get(pubkey1); // Use direct access
        expect(session?.signer).toBeUndefined();
        // expect(session?.relays).toEqual(['relay1']); // Removed check for non-existent property
    });

    // Removed old initSession tests that relied on NDK instance, opts, fetching, etc.

    it('updateSession: should update signer when provided', () => {
        useNDKSessions.getState().ensureSession(mockUser1); // Use ensureSession
        // Use existing mockSigner
        useNDKSessions.getState().updateSession(pubkey1, { signer: mockSigner });
        
        const session = useNDKSessions.getState().sessions.get(pubkey1); // Use direct access
        expect(session?.signer).toBe(mockSigner);
    });
});
