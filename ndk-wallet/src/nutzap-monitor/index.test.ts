import NDK, { Hexpubkey, NDKCashuMintList, NDKNutzap, NDKPrivateKeySigner, NDKUser } from "@nostr-dev-kit/ndk";
import { NDKNutzapMonitor } from ".";
import { fetchPage } from "./fetch-page";
import { mockNutzap } from "@nostr-dev-kit/ndk/test";
import * as CashuMintModule from "../wallets/cashu/mint";
import { CashuWallet, ProofState, Proof, CheckStateEnum } from "@cashu/cashu-ts";
import { CashuMint } from "@cashu/cashu-ts";
import * as SpendStatusModule from "./spend-status";
import { correctP2pk } from "../wallets/cashu/pay";

jest.mock("./fetch-page");

const ndk = new NDK({
    signer: NDKPrivateKeySigner.generate(),
    explicitRelayUrls: ['wss://relay1.com', 'wss://relay2.com']
});
let user: NDKUser;
const mintList = new NDKCashuMintList(ndk);
mintList.mints = ['https://testnut.cashu.space'];
mintList.relays = ['wss://relay1.com', 'wss://relay2.com'];

beforeAll(async () => {
    user = await ndk.signer!.user();
});

describe("NDKNutzapMonitor", () => {
    describe('processNutzaps', () => {
        it('checks spending status of nutzaps on each mint', async () => {
            const monitor = new NDKNutzapMonitor(ndk, user, mintList);

            jest.spyOn(CashuMintModule, 'walletForMint').mockResolvedValue(new CashuWallet(new CashuMint('https://mint1.com')));

            const nutzaps = [
                await mockNutzap('https://mint1.com', 100, ndk),
                await mockNutzap('https://mint2.com', 200, ndk),
            ];

            // mock the fetchPage function
            (fetchPage as jest.Mock).mockResolvedValue(nutzaps);

            const getUnspentProofsSpy = jest.spyOn(SpendStatusModule, 'getProofSpendState').mockResolvedValue(
                nutzaps.map(n => ({ nutzap: n, state: CheckStateEnum.UNSPENT }))
            );
            jest.spyOn(monitor, 'redeemNutzaps').mockImplementation();
            
            await monitor.processNutzaps(new Set(), 10);

            expect(getUnspentProofsSpy).toHaveBeenCalledTimes(2);

            // clear the mock
            jest.clearAllMocks();
        });

        it('skips asking for known nutzaps', async () => {
            const monitor = new NDKNutzapMonitor(ndk, user, mintList);

            const nutzaps = [
                await mockNutzap('https://mint3.com', 200, ndk),
            ];

            (fetchPage as jest.Mock).mockResolvedValue(nutzaps);

            const knownNutzaps = new Set([nutzaps[0].id]);
            const unspentResult: [string[], Proof[]] = [nutzaps.map(n => n.id), nutzaps.flatMap(n => n.proofs)];

            const getUnspentProofsSpy = jest.spyOn(SpendStatusModule, 'getProofSpendState').mockResolvedValue(unspentResult);

            await monitor.processNutzaps(knownNutzaps, 10);

            expect(getUnspentProofsSpy).toHaveBeenCalledTimes(0);
            
            getUnspentProofsSpy.mockClear();
        });

        it('tries to redeem unspent nutzaps', async () => {
            jest.spyOn(CashuMintModule, 'walletForMint').mockResolvedValue(new CashuWallet(new CashuMint('https://mint1.com')));
            const monitor = new NDKNutzapMonitor(ndk, user, mintList);

            const nutzaps = [
                await mockNutzap('https://mint1.com', 100, ndk),
                await mockNutzap('https://mint2.com', 200, ndk),
            ];
            (fetchPage as jest.Mock).mockResolvedValue(nutzaps);

            const unspentResult: [string[], Proof[]] = [nutzaps.map(n => n.id), nutzaps.flatMap(n => n.proofs)];
            
            const getUnspentProofsSpy = jest.spyOn(SpendStatusModule, 'getProofSpendState').mockResolvedValue(unspentResult);
            jest.spyOn(monitor, 'redeemNutzaps').mockImplementation();
            await monitor.processNutzaps(new Set(), 10);

            expect(getUnspentProofsSpy).toHaveBeenCalledTimes(2);

            jest.clearAllMocks();
        })

        fit('emits spent on the nutzaps that are seen as spent', async () => {
            const monitor = new NDKNutzapMonitor(ndk, user, mintList);
            const nutzaps = [
                await mockNutzap('https://mint1.com', 100, ndk),
                await mockNutzap('https://mint1.com', 200, ndk),
            ];

            (fetchPage as jest.Mock).mockResolvedValue(nutzaps);

            const getProofSpendStateResult = [
                { nutzap: nutzaps[0], state: CheckStateEnum.UNSPENT },
                { nutzap: nutzaps[1], state: CheckStateEnum.SPENT },
            ];

            const getProofSpendStateSpy = jest.spyOn(SpendStatusModule, 'getProofSpendState').mockResolvedValue(getProofSpendStateResult);
            jest.spyOn(monitor, 'redeemNutzaps').mockImplementation();
            await monitor.processNutzaps(new Set(), 10);

            // monitor should emit spend with the nutzap that is seen as spent
            expect(monitor.emit).toHaveBeenCalledWith('spent', nutzaps[1]);
        })

        it('skips proofs that are p2pk-locked to a key we do not have access to', async () => {
            const walletForMintSpy = jest.spyOn(CashuMintModule, 'walletForMint').mockResolvedValue(new CashuWallet(new CashuMint('https://mint1.com')));
            
            const monitor = new NDKNutzapMonitor(ndk, user, mintList);
            const pabloPubkey = "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52";
            const nutzaps = [
                await mockNutzap('https://mint1.com', 100, ndk, { recipientPubkey: pabloPubkey }),
                await mockNutzap('https://mint1.com', 100, ndk),
            ];

            (fetchPage as jest.Mock).mockResolvedValue(nutzaps);

            const redeemSpy = jest.spyOn(monitor, 'redeemNutzaps').mockImplementation();

            // mock the checkProofsStates of whatever CashuWallet instance is returned by walletForMint
            walletForMintSpy.mockImplementation(() => {
                const wallet = new CashuWallet(new CashuMint('https://mint1.com'));
                mockCheckProofsStates(wallet, [CheckStateEnum.UNSPENT, CheckStateEnum.UNSPENT]);
                return Promise.resolve(wallet);
            });
            
            await monitor.processNutzaps(new Set(), 10);

            expect(redeemSpy).toHaveBeenCalledTimes(1);
            expect(redeemSpy).toHaveBeenCalledWith(nutzaps[1].mint, [nutzaps[1]], nutzaps[1].proofs, ndk.signer as NDKPrivateKeySigner);
            
            jest.clearAllMocks();
        })

        xit('real quote', async () => {
            jest.clearAllMocks();
            const monitor = new NDKNutzapMonitor(ndk, user, mintList);
            
            const nutzaps = await createRealTestnutNutzap(6, user.pubkey, [2, 4]);

            (fetchPage as jest.Mock).mockResolvedValue(nutzaps);

            // spend the second nutzap
            await monitor.redeemNutzaps(nutzaps[0].mint, [nutzaps[0]], nutzaps[0].proofs, ndk.signer as NDKPrivateKeySigner);
            
            await monitor.processNutzaps(new Set(), 10);
        })
    });
});

// increase jest timeout to 15 seconds
jest.setTimeout(15000);

const wallet: Record<string, CashuWallet> = {};
const walletPromises: Record<string, Promise<CashuWallet>> = {};

async function getCashuWallet(mint: string) {
    if (!wallet[mint]) {
        if (!walletPromises[mint]) {
            const w = new CashuWallet(new CashuMint(mint));
            walletPromises[mint] = new Promise(async (resolve) => {
                await w.getMintInfo();
                await w.getKeys();
                wallet[mint] = w;
                resolve(w);
            });
            await walletPromises[mint];
        } else {
            await walletPromises[mint];
        }
    }
    return wallet[mint];
}

/**
 * This function creates a real testnut nutzap, talking
 * to an actual mint.
 * @returns 
 */
async function createRealTestnutNutzap(
    amount: number,
    recipientPubkey: Hexpubkey,
    amounts?: number[],
    mint: string = 'https://testnut.cashu.space',
    content: string = "",
    pk: NDKPrivateKeySigner = NDKPrivateKeySigner.generate()
) {
    amounts ??= [amount];
    const cashuWallet = await getCashuWallet(mint);
    const {quote} = await cashuWallet.createMintQuote(amount);
    const proofs = await cashuWallet.mintProofs(
        amount,
        quote,
        {
            pubkey: correctP2pk(recipientPubkey),
            outputAmounts: {
                sendAmounts: amounts,
            }
        }
    );

    const nutzaps: NDKNutzap[] = [];
    const numberOfProofsPerNutzap = proofs.length / amounts.length;
    for (const [index, amount] of amounts.entries()) {
        const nutzap = new NDKNutzap(ndk);
        nutzap.mint = mint;
        nutzap.proofs = proofs.slice(index * numberOfProofsPerNutzap, (index + 1) * numberOfProofsPerNutzap);
        nutzap.content = content;
        await nutzap.sign(pk);
        nutzaps.push(nutzap);
    }

    return nutzaps;
}

/**
 * Mocks in a CashuWallet a call to checkProofsStates with the given states.
 */
function mockCheckProofsStates(wallet: CashuWallet, states: CheckStateEnum[]) {
    jest.spyOn(wallet, 'checkProofsStates').mockResolvedValue(
        states.map(state => ({ state, Y: '1', witness: '1' }))
    );
}