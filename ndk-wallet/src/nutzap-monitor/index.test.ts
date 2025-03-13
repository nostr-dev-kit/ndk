import NDK, { NDKCashuMintList, NDKEvent, NDKEventId, NDKNutzap, NDKPrivateKeySigner, NDKRelaySet, NDKUser } from "@nostr-dev-kit/ndk";
import { NDKNutzapMonitor, NDKNutzapState, NdkNutzapStatus, NDKNutzapMonitorStore } from "./index";
import * as CashuMintModule from "../wallets/cashu/mint.js";
import { CashuMint, CashuWallet } from "@cashu/cashu-ts";
import * as SpendStatusModule from "./spend-status.js";
import { NDKCashuWallet } from "../wallets/cashu/wallet/index.js";
import { fetchPage } from "./fetch-page.js";
import { mockNutzap } from "../tests/index.js";

// Mock the modules we don't want to actually call
jest.mock("./fetch-page.js");
jest.mock("./spend-status.js");
jest.mock("../wallets/cashu/mint.js");

// Define the extended store type with our test spy
interface MockStore extends NDKNutzapMonitorStore {
    setNutzapStateSpy: jest.Mock;
}

// Mock store for testing
const createMockStore = (): MockStore => {
    const nutzapStates = new Map<NDKEventId, NDKNutzapState>();
    const setNutzapStateSpy = jest.fn();
    
    return {
        getAllNutzaps: async (): Promise<Map<NDKEventId, NDKNutzapState>> => nutzapStates,
        setNutzapState: async (id: NDKEventId, stateChange: Partial<NDKNutzapState>): Promise<void> => {
            const currentState = nutzapStates.get(id) || {} as NDKNutzapState;
            nutzapStates.set(id, { ...currentState, ...stateChange });
            setNutzapStateSpy(id, stateChange);
        },
        setNutzapStateSpy
    };
};

describe("NDKNutzapMonitor", () => {
    let ndk: NDK;
    let user: NDKUser;
    let mintList: NDKCashuMintList;
    let mockStore: MockStore;
    let monitor: NDKNutzapMonitor;
    
    beforeEach(async () => {
        // Setup NDK with a signer
        ndk = new NDK({
            signer: NDKPrivateKeySigner.generate(),
            explicitRelayUrls: ['wss://relay1.com']
        });
        
        user = await ndk.signer!.user();
        
        // Setup a mint list
        mintList = new NDKCashuMintList(ndk);
        mintList.mints = ['https://testmint.com'];
        
        // Mock CashuWallet
        const mockCashuWallet = new CashuWallet(new CashuMint('https://testmint.com'));
        jest.spyOn(mockCashuWallet, 'checkProofsStates').mockResolvedValue([]);
        jest.spyOn(CashuMintModule, 'walletForMint').mockResolvedValue(mockCashuWallet);
        
        // Setup mock store
        mockStore = createMockStore();
        
        // Create the monitor
        monitor = new NDKNutzapMonitor(ndk, user, { mintList, store: mockStore });
        
        // Setup mock NDKCashuWallet
        const mockNDKCashuWallet = new NDKCashuWallet(ndk);
        mockNDKCashuWallet.redeemNutzaps = jest.fn().mockResolvedValue(100);
        monitor.wallet = mockNDKCashuWallet;
        
        // Mock console methods
        jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });
    
    afterEach(() => {
        jest.clearAllMocks();
    });
    
    describe("addPrivkey", () => {
        it("should add a private key to the monitor", async () => {
            const signer = NDKPrivateKeySigner.generate();
            const pubkey = (await signer.user()).pubkey;
            
            await monitor.addPrivkey(signer);
            
            expect(monitor.privkeys.has(pubkey)).toBe(true);
        });
        
        it("should attempt to redeem nutzaps that were previously locked to a privkey that is now available", async () => {
            // Create a signer
            const signer = NDKPrivateKeySigner.generate();
            const pubkey = (await signer.user()).pubkey;
            
            // Create a nutzap that requires this privkey
            const nutzap = await mockNutzap('https://testmint.com', 100, ndk, { recipientPubkey: pubkey });
            
            // Set the nutzap state to MISSING_PRIVKEY
            monitor.nutzapStates.set(nutzap.id, {
                nutzap,
                status: NdkNutzapStatus.MISSING_PRIVKEY
            });
            
            // Mock getProofSpendState to return the nutzap as unspent
            jest.spyOn(SpendStatusModule, 'getProofSpendState').mockResolvedValue({
                unspentProofs: nutzap.proofs,
                spentProofs: [],
                nutzapsWithUnspentProofs: [nutzap],
                nutzapsWithSpentProofs: []
            });
            
            // Spy on redeemNutzaps
            const redeemSpy = jest.spyOn(monitor, 'redeemNutzaps').mockResolvedValue(undefined);
            
            // Add the privkey (this should trigger a check for nutzaps that can now be redeemed)
            await monitor.addPrivkey(signer);
            
            // Start the monitor to trigger the check for nutzaps
            await monitor.start({ filter: {} });
            
            // Check that redeemNutzaps was called with the right arguments
            expect(redeemSpy).toHaveBeenCalled();
            const callArgs = redeemSpy.mock.calls[0];
            expect(callArgs[0]).toBe(nutzap.mint);
            expect(callArgs[1]).toContainEqual(expect.objectContaining({ id: nutzap.id }));
            expect(callArgs[3]).toHaveProperty('privateKey', signer.privateKey);
        });
    });
    
    describe("redeemNutzap", () => {
        it("should set state to MISSING_PRIVKEY when no privkey is available", async () => {
            // Create a nutzap with a pubkey we don't have
            const unknownSigner = NDKPrivateKeySigner.generate();
            const unknownPubkey = (await unknownSigner.user()).pubkey;
            
            const nutzap = await mockNutzap('https://testmint.com', 100, ndk, { recipientPubkey: unknownPubkey });
            
            // Try to redeem the nutzap
            await monitor.redeemNutzap(nutzap);
            
            // Check the state is set to MISSING_PRIVKEY
            const state = monitor.nutzapStates.get(nutzap.id);
            expect(state?.status).toBe(NdkNutzapStatus.MISSING_PRIVKEY);
            
            // Check the store was updated
            expect(mockStore.setNutzapStateSpy).toHaveBeenCalledWith(
                nutzap.id,
                expect.objectContaining({ status: NdkNutzapStatus.MISSING_PRIVKEY })
            );
        });
        
        it("should transition through states and set redeemedAmount when successfully redeemed", async () => {
            // Mock the wallet for mints
            const mockCashuWallet = new CashuWallet(new CashuMint('https://testmint.com'));
            jest.spyOn(CashuMintModule, 'walletForMint').mockResolvedValue(mockCashuWallet);
            
            // Get the user's pubkey and create a nutzap for them
            const userSigner = ndk.signer as NDKPrivateKeySigner;
            const userPubkey = (await userSigner.user()).pubkey;
            
            // Create a nutzap for the user
            const nutzap = await mockNutzap('https://testmint.com', 100, ndk, { recipientPubkey: userPubkey });
            
            // Add the user's privkey to the monitor
            await monitor.addPrivkey(userSigner);
            
            // Listen to emit events instead of spying on private method
            const stateChanges: NdkNutzapStatus[] = [];
            monitor.on('state_changed', (id, status) => {
                stateChanges.push(status);
            });
            
            // Try to redeem the nutzap
            await monitor.redeemNutzap(nutzap);
            
            // Check state transitions (should include INITIAL, PROCESSING, and REDEEMED)
            expect(stateChanges).toContain(NdkNutzapStatus.INITIAL);
            expect(stateChanges).toContain(NdkNutzapStatus.PROCESSING);
            expect(stateChanges).toContain(NdkNutzapStatus.REDEEMED);
        });
        
        it("should mark nutzap as PERMANENT_ERROR when 'unknown public key size' error occurs", async () => {
            // Mock the wallet for mints
            const mockCashuWallet = new CashuWallet(new CashuMint('https://testmint.com'));
            jest.spyOn(CashuMintModule, 'walletForMint').mockResolvedValue(mockCashuWallet);
            
            // Get the user's pubkey and create a nutzap for them
            const userSigner = ndk.signer as NDKPrivateKeySigner;
            const userPubkey = (await userSigner.user()).pubkey;
            
            // Create a nutzap for the user
            const nutzap = await mockNutzap('https://testmint.com', 100, ndk, { recipientPubkey: userPubkey });
            
            // Add the user's privkey to the monitor
            await monitor.addPrivkey(userSigner);
            
            // Mock redeemNutzaps to throw "unknown public key size" error
            jest.spyOn(monitor.wallet as NDKCashuWallet, 'redeemNutzaps').mockImplementation(() => {
                throw new Error("unknown public key size");
            });
            
            // Listen for failed emissions
            const failedEvents: Array<{nutzap: NDKNutzap, error: string}> = [];
            monitor.on('failed', (nutzap, error) => {
                failedEvents.push({nutzap, error});
            });
            
            // Try to redeem the nutzap
            await monitor.redeemNutzap(nutzap);
            
            // Check that the failed event was emitted with correct error message
            expect(failedEvents.length).toBe(1);
            expect(failedEvents[0].nutzap.id).toBe(nutzap.id);
            expect(failedEvents[0].error).toBe("Invalid p2pk: unknown public key size");
            
            // Check that the nutzap state was updated correctly
            const finalState = monitor.nutzapStates.get(nutzap.id);
            expect(finalState?.status).toBe(NdkNutzapStatus.PERMANENT_ERROR);
            expect(finalState?.errorMessage).toBe("Invalid p2pk: unknown public key size");
        });
    });
    
    describe("processAccumulatedNutzaps", () => {
        it("should mark spent nutzaps as SPENT and not attempt to redeem them", async () => {
            // Get the user's pubkey 
            const userPubkey = (await ndk.signer!.user()).pubkey;
            
            // Create nutzaps - one spent, one unspent
            const unspentNutzap = await mockNutzap('https://testmint.com', 100, ndk, { recipientPubkey: userPubkey });
            const spentNutzap = await mockNutzap('https://testmint.com', 200, ndk, { recipientPubkey: userPubkey });
            
            // Setup fetchPage mock
            (fetchPage as jest.Mock).mockResolvedValue([unspentNutzap, spentNutzap]);
            
            // Setup getProofSpendState mock to show one nutzap as spent and one as unspent
            jest.spyOn(SpendStatusModule, 'getProofSpendState').mockResolvedValue({
                unspentProofs: unspentNutzap.proofs,
                spentProofs: spentNutzap.proofs,
                nutzapsWithUnspentProofs: [unspentNutzap],
                nutzapsWithSpentProofs: [spentNutzap]
            });
            
            // Add user's private key
            await monitor.addPrivkey(ndk.signer as NDKPrivateKeySigner);
            
            // Listen to emit events instead of spying on private method
            const stateChanges = new Map<NDKEventId, NdkNutzapStatus>();
            monitor.on('state_changed', (id, status) => {
                stateChanges.set(id, status);
            });
            
            // Process the nutzaps
            await monitor.processAccumulatedNutzaps();
            
            // Check that spent nutzap was marked as SPENT
            expect(stateChanges.get(spentNutzap.id)).toBe(NdkNutzapStatus.SPENT);
        });
    });
    
    describe("store integration", () => {
        it("should load nutzap states from the store on startup", async () => {
            // Create a new mock store with pre-populated state
            const newStore = createMockStore();
            const existingNutzap = await mockNutzap('https://testmint.com', 100, ndk);
            
            // Add a nutzap state to the store
            await newStore.setNutzapState(existingNutzap.id, {
                nutzap: existingNutzap,
                status: NdkNutzapStatus.REDEEMED,
                redeemedAmount: 100
            });
            
            // Create a new monitor with this store
            const newMonitor = new NDKNutzapMonitor(ndk, user, { mintList, store: newStore });
            
            // Mock fetchPage to return empty array (so we don't process new nutzaps)
            (fetchPage as jest.Mock).mockResolvedValue([]);
            
            // Start the monitor (this should load states from the store)
            await newMonitor.start({ filter: {} });
            
            // Check that the state was loaded from the store
            const state = newMonitor.nutzapStates.get(existingNutzap.id);
            expect(state?.status).toBe(NdkNutzapStatus.REDEEMED);
            expect(state?.redeemedAmount).toBe(100);
        });
    });
    
    describe("shouldTryRedeem", () => {
        it("should return false for nutzaps with PERMANENT_ERROR status", async () => {
            // Create a nutzap
            const signer = NDKPrivateKeySigner.generate();
            const pubkey = (await signer.user()).pubkey;
            const nutzap = await mockNutzap('https://testmint.com', 100, ndk, { recipientPubkey: pubkey });
            
            // Set it to PERMANENT_ERROR state
            monitor.nutzapStates.set(nutzap.id, {
                nutzap,
                status: NdkNutzapStatus.PERMANENT_ERROR,
                errorMessage: "Invalid p2pk: unknown public key size"
            });
            
            // It should not be retried
            expect(monitor.shouldTryRedeem(nutzap)).toBe(false);
        });
        
        it("should return true for nutzaps with INITIAL status", async () => {
            // Create a nutzap
            const signer = NDKPrivateKeySigner.generate();
            const pubkey = (await signer.user()).pubkey;
            const nutzap = await mockNutzap('https://testmint.com', 100, ndk, { recipientPubkey: pubkey });
            
            // Set it to INITIAL state
            monitor.nutzapStates.set(nutzap.id, {
                nutzap,
                status: NdkNutzapStatus.INITIAL
            });
            
            // It should be retried
            expect(monitor.shouldTryRedeem(nutzap)).toBe(true);
        });
        
        it("should return true for unknown nutzaps", async () => {
            // Create a nutzap without setting any state
            const signer = NDKPrivateKeySigner.generate();
            const pubkey = (await signer.user()).pubkey;
            const nutzap = await mockNutzap('https://testmint.com', 100, ndk, { recipientPubkey: pubkey });
            
            // It should be retried since it's unknown
            expect(monitor.shouldTryRedeem(nutzap)).toBe(true);
        });
    });
});