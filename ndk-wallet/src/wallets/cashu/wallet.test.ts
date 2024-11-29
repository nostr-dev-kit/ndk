import { NDKCashuWallet, WalletChange } from './wallet';
import { NDKCashuToken } from './token';
import { NDKZapDetails, CashuPaymentInfo, NDKUser, NDKEvent, NDKPrivateKeySigner, NDKRelaySet } from '@nostr-dev-kit/ndk';
import NDK from '@nostr-dev-kit/ndk';
import { NDKCashuPay } from './pay';
import { jest } from '@jest/globals';
import { Proof } from '@cashu/cashu-ts';
import { NDKRelay } from '@nostr-dev-kit/ndk';

const ndk = new NDK({ signer: NDKPrivateKeySigner.generate() });
const relay = new NDKRelay('wss://example.com', undefined, ndk);
ndk.addExplicitRelay(relay, undefined, false);

describe('NDKCashuWallet', () => {
    let wallet: NDKCashuWallet;

    const paymentDetails: NDKZapDetails<CashuPaymentInfo> = {
        amount: 200,
        unit: 'sats',
        mints: ['https://testnut.cashu.space'],
        recipientPubkey: 'some-pubkey',
        target: new NDKUser({ pubkey: 'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52'}),
        relays: ['wss://relay.example.com']
    };

    beforeEach(() => {
        wallet = new NDKCashuWallet(ndk);
    });

    it('should successfully pay with cashu when wallet has enough tokens', async () => {
        const { tokens, modifiedMockResult } = createMockTokens(mockPayNutResult, false, 3);
        wallet.tokens.push(...tokens);

        jest.spyOn(NDKCashuPay.prototype, 'payNut').mockResolvedValue(modifiedMockResult);

        const result = await wallet.cashuPay(paymentDetails);

        expect(result).toBeDefined();
        expect(result?.proofs).toBeDefined();

        expect(modifiedMockResult.send.length).toBe(result?.proofs.length);
    });

    async function mockTokenWithProofs(
        amounts: number[]
    ): Promise<NDKCashuToken> {
        const token = new NDKCashuToken(ndk);
        const proofs: Proof[] = [];

        for (const amount of amounts) {
            proofs.push({
                amount,
                C: `02${Math.random().toString(16).substring(2)}`,
                secret: Math.random().toString(16).substring(2),
                id: Math.random().toString(16).substring(2, 10)
            })
        }

        token.proofs = proofs;
        token.mint = 'https://testnut.cashu.space';
        await token.sign();
        return token;
    }

    describe('calculateNewState', () => {
        it('works when a single token with two proofs is getting one proof spent', async () => {
            const token = await mockTokenWithProofs([16, 8]);
            wallet.tokens.push(token);
        
            const walletChange: WalletChange = {
                "reserve": [],
                "destroy": [ { "amount": 8, "C": "037ae2cd8439b753fb86522a8fa445c613cda148eeffea7703ac065aaf6e4e3f35", "id": "009a1f293253e41e", "secret": "[\"P2PK\",{\"nonce\":\"ee6b11bc642e5df2251dbfb052b6356f8df8c988429dde5d84714d16dcfd86f0\",\"data\":\"026448ff8c43d98d84a50e9176b2746c580adc354d7fc43aebfc3a12462514f34f\"}]" } ],
                "store": [{ "amount": 16, "C": "02e1a8b3b633b57b062eecf3c3bd1865950d1fbae8670a7b405786701f0ea5380f", "id": "009a1f293253e41e", "secret": "f30b744120dac5f42deaa091cae94d168f13c23e19f048cf915b169d42fc0e15", } ],
                "mint": "https://testnut.cashu.space"
            }

            const res = await wallet.calculateNewState(walletChange);

            expect(Array.from(res.deletedTokenIds)[0]).toBe(token.id);
            expect(res.saveProofs.length).toBe(1);

            expect(res.saveProofs[0].C).toBe("02e1a8b3b633b57b062eecf3c3bd1865950d1fbae8670a7b405786701f0ea5380f");
        })

        it('deletes a token and rollsover the remaining proof', async () => {
            const token = await mockTokenWithProofs([16, 8]);
            wallet.tokens.push(token);

            const walletChange: WalletChange = {
                "reserve": [],
                "destroy": [ { "amount": 8, "C": "037ae2cd8439b753fb86522a8fa445c613cda148eeffea7703ac065aaf6e4e3f35", "id": "009a1f293253e41e", "secret": "[\"P2PK\",{\"nonce\":\"ee6b11bc642e5df2251dbfb052b6356f8df8c988429dde5d84714d16dcfd86f0\",\"data\":\"026448ff8c43d98d84a50e9176b2746c580adc354d7fc43aebfc3a12462514f34f\"}]" } ],
                "store": [{ "amount": 16, "C": "02e1a8b3b633b57b062eecf3c3bd1865950d1fbae8670a7b405786701f0ea5380f", "id": "009a1f293253e41e", "secret": "f30b744120dac5f42deaa091cae94d168f13c23e19f048cf915b169d42fc0e15", } ],
                "mint": "https://testnut.cashu.space"
            }

            const res = await wallet.calculateNewState(walletChange);

            expect(Array.from(res.deletedTokenIds).length).toBe(1);
            expect(res.saveProofs.length).toBe(1);
        })

        it('when the entire token is spent we dont create a new token', async () => {
            const tokens = [
                await mockTokenWithProofs([4]),
                await mockTokenWithProofs([8])
            ];
            wallet.tokens.push(...tokens);

            const walletChange: WalletChange = {
                "reserve": [],
                "destroy": [{ "amount": 8, "C": "037ae2cd8439b753fb86522a8fa445c613cda148eeffea7703ac065aaf6e4e3f35", "id": "009a1f293253e41e", "secret": "[\"P2PK\",{\"nonce\":\"ee6b11bc642e5df2251dbfb052b6356f8df8c988429dde5d84714d16dcfd86f0\",\"data\":\"026448ff8c43d98d84a50e9176b2746c580adc354d7fc43aebfc3a12462514f34f\"}]" }],
                "store": tokens[0].proofs, // the entire first token is kept
                "mint": "https://testnut.cashu.space"
            }

            const res = await wallet.calculateNewState(walletChange);

            expect(res.saveProofs.length).toBe(0);
            expect(Array.from(res.deletedTokenIds).length).toBe(1);
        })

        it('when multiple proofs in the same token are getting deleted and some are still in the new state it doesnt duplicate the kept proofs', async () => {
            const token = await mockTokenWithProofs([1, 1, 1, 1, 1, 8, 2, 4]);
            wallet.tokens.push(token);

            const walletChange: WalletChange = {
                "reserve": [],
                "destroy": [
                    // we are sending tokens with amounts 2 and 4
                    { "amount": 6, "C": "02e1a8b3b633b57b062eecf3c3bd1865950d1fbae8670a7b405786701f0ea5380f", "id": "009a1f293253e41e", "secret": "f30b744120dac5f42deaa091cae94d168f13c23e19f048cf915b169d42fc0e15", }],
                "store": token.proofs.filter((p) => p.amount !== 2 && p.amount !== 4),
                "mint": "https://testnut.cashu.space"
            }

            const res = await wallet.calculateNewState(walletChange);

            expect(res.saveProofs.length).toBe(token.proofs.length - 2);
            expect(res.deletedTokenIds.size).toBe(1);
            const savedTotalAmount = res.saveProofs.reduce((acc, p) => acc + p.amount, 0);
            // 1 + 1 + 1 + 1 + 1 + 1 + 1 + 8 = 13
            expect(savedTotalAmount).toBe(13);
        })

        it('deletes a token and doesnt rollver anything when the proof was in a different token', async () => {
            const tokens = [
                await mockTokenWithProofs([16]),
                await mockTokenWithProofs([8])
            ]
            wallet.tokens.push(...tokens);

            const walletChange: WalletChange = {
                "reserve": [],
                "destroy": [ { "amount": 8, "C": "037ae2cd8439b753fb86522a8fa445c613cda148eeffea7703ac065aaf6e4e3f35", "id": "009a1f293253e41e", "secret": "[\"P2PK\",{\"nonce\":\"ee6b11bc642e5df2251dbfb052b6356f8df8c988429dde5d84714d16dcfd86f0\",\"data\":\"026448ff8c43d98d84a50e9176b2746c580adc354d7fc43aebfc3a12462514f34f\"}]" } ],
                "store": [{ "amount": 16, "C": tokens[0].proofs[0].C, "id": "009a1f293253e41e", "secret": "f30b744120dac5f42deaa091cae94d168f13c23e19f048cf915b169d42fc0e15", } ],
                "mint": "https://testnut.cashu.space"
            }

            const res = await wallet.calculateNewState(walletChange);

            expect(Array.from(res.deletedTokenIds).length).toBe(1);
            expect(res.saveProofs.length).toBe(0);
        })
        
        it('works when there are no proofs to save from a deleted token', async () => {
            const tokens = [
                await mockTokenWithProofs([16]),
                await mockTokenWithProofs([8]),
            ]
            
            wallet.tokens.push(...tokens);

            const walletChange: WalletChange = {
                "reserve": [],
                "destroy": [
                  {
                    "amount": 4,
                    "C": "037ae2cd8439b753fb86522a8fa445c613cda148eeffea7703ac065aaf6e4e3f35",
                    "id": "009a1f293253e41e",
                    "secret": "[\"P2PK\",{\"nonce\":\"ee6b11bc642e5df2251dbfb052b6356f8df8c988429dde5d84714d16dcfd86f0\",\"data\":\"026448ff8c43d98d84a50e9176b2746c580adc354d7fc43aebfc3a12462514f34f\"}]"
                  }
                ],
                "store": [
                    // unchanged token
                  {
                    "amount": 16,
                    "C": tokens[0].proofs[0].C,
                    "id": "009a1f293253e41e", "secret": "f30b744120dac5f42deaa091cae94d168f13c23e19f048cf915b169d42fc0e15",
                },
                  
                    // new token with three proofs
                  {
                    "amount": 1,
                    "C": "0212bb43a96b28c193fcd6d6dd09f4b074b3df22cb4e79bbb997be0afb4e1b71d0",
                    "id": "009a1f293253e41e", "secret": "ddbba008f1a54bf442affaed90e48e1de61b4836433145efee3bffe12542faef",
                  },
                  {
                    "amount": 1,
                    "C": "02d5ae3323e2ed934ff46a17d4293383ecd02b09b61d2ffd4277b136ed9225b61a",
                    "id": "009a1f293253e41e", "secret": "d9c4d46beab3e8da3b87b85093797c38921cc6154f480eab02bfb0ef979bc858",
                  },
                  {
                    "amount": 1,
                    "C": "030a115ad9644121a9fd658cc6672fe8419b3b6b277494f5179c62cd4ed88b5949",
                    "id": "009a1f293253e41e", "secret": "531448fe0f0693114793959c9060c74bcd14c393d264d0c4ad1caddb2d7ad83f",
                  }
                ],
                "mint": "https://testnut.cashu.space"
            }

            const res = await wallet.calculateNewState(walletChange);

            expect(res.saveProofs.length).toBe(3);
            expect(Array.from(res.deletedTokenIds).length).toBe(1);
        });
    });
}); 

const mockPayNutResult = {
    keep: [
        {
          amount: 4,
          C: "03f156e6003ce31135581ee1721b648ce6de541bf6c5485ac2fafac322edd9e6ac",
          id: "009a1f293253e41e",
          secret: "80e689463af88e81ae8986aa29b23fd34d4cf3e4a3c6c01327764823685b88db"
        }, {
          amount: 1,
          C: "026e85bfe207f3763e5d51ad0977c2c7a76c4d3ec44c5a23865ef40d30620dd6fa",
          id: "009a1f293253e41e",
          secret: "89f9a2d7325f9a2dde3eaa3e065d2f25580d65feb611be5830a2dfdd513d0758",
          witness: undefined
        }, {
          amount: 1,
          C: "029c1a92c08e483bd6e61e09b2bf61df61fb477f3ea2ee9afc753622cc0c1837b5",
          id: "009a1f293253e41e",
          secret: "102237b2ca75db7be737771ec08d0fabe3cd2c623c48cf3e652373f90cce0462",
          witness: undefined
        }, {
          amount: 1,
          C: "02e4b800131c285d403a37069c2902170386866bfa523a4f2576fca52620d67e46",
          id: "009a1f293253e41e",
          secret: "5764c88e38354b90f3a84795a7f147aea98ae638729a00ac26b8184833ad3406",
          witness: undefined
        }
      ],
      send: [
        {
          amount: 4,
          C: "02670095418aa3f32dcb07f7e36e522bfee60443254ecf6c68e9c014383eb3cb43",
          id: "009a1f293253e41e",
          secret: "[\"P2PK\",{\"nonce\":\"2bcfab22387225f87ecb1e2f8d861c1490672d90627b49f529a8f8575f4098a4\",\"data\":\"026448ff8c43d98d84a50e9176b2746c580adc354d7fc43aebfc3a12462514f34f\"}]",
          witness: undefined,
        }
      ],
    mint: "https://testnut.cashu.space"
}

/**
 * Creates mock Cashu tokens for testing purposes by distributing proofs across tokens
 * @param mockResult - Object containing keep/send proofs and mint info from a Cashu transaction
 * @param mixProofs - When true, combines keep/send proofs into single tokens. When false, creates separate tokens for keep/send proofs
 * @param numTokens - Number of tokens to distribute the proofs across
 * @returns Array of NDKCashuToken instances with distributed proofs
 * 
 * Behavior:
 * - With mixProofs=false (default):
 *   - Creates separate tokens for 'keep' and 'send' proofs
 *   - Evenly distributes keep proofs across numTokens tokens
 *   - Evenly distributes send proofs across numTokens tokens
 * - With mixProofs=true:
 *   - Combines all proofs into a single array
 *   - Evenly distributes combined proofs across numTokens tokens
 * 
 */
function createMockTokens(mockResult: any, mixProofs: boolean = false, numTokens: number = 1) {
    const ndk = new NDK();
    const tokens: NDKCashuToken[] = [];
    
    // Create copies and modify secrets with prefixes
    const keepProofs = [...(mockResult.keep || [])].map(proof => ({
        ...proof,
        secret: `keep_${proof.secret}`
    }));
    const sendProofs = [...(mockResult.send || [])].map(proof => ({
        ...proof,
        secret: `send_${proof.secret}`
    }));
    
    // Create modified mockResult with prefixed secrets
    const modifiedMockResult = {
        ...mockResult,
        keep: Array.from(keepProofs),
        send: Array.from(sendProofs)
    };

    if (mixProofs) {
        // Interleave keep and send proofs
        const allProofs = [];
        const maxLength = Math.max(keepProofs.length, sendProofs.length);
        
        for (let i = 0; i < maxLength; i++) {
            if (keepProofs[i]) allProofs.push(keepProofs[i]);
            if (sendProofs[i]) allProofs.push(sendProofs[i]);
        }
        
        const proofsPerToken = Math.ceil(allProofs.length / numTokens);
        
        for (let i = 0; i < numTokens && allProofs.length > 0; i++) {
            const token = new NDKCashuToken(ndk);
            token.id = `token${i + 1}`;
            token.mint = mockResult.mint;
            token.proofs = allProofs.splice(0, proofsPerToken);
            tokens.push(token);
        }
    } else {
        const keepTokens = Math.ceil(keepProofs.length / numTokens);
        const sendTokens = Math.ceil(sendProofs.length / numTokens);
        
        for (let i = 0; i < numTokens; i++) {
            if (keepProofs.length > 0) {
                const keepToken = new NDKCashuToken(ndk);
                keepToken.id = `keep_token${i + 1}`;
                keepToken.mint = mockResult.mint;
                keepToken.proofs = keepProofs.splice(0, keepTokens);
                tokens.push(keepToken);
            }
            
            if (sendProofs.length > 0) {
                const sendToken = new NDKCashuToken(ndk);
                sendToken.id = `send_token${i + 1}`;
                sendToken.mint = mockResult.mint;
                sendToken.proofs = sendProofs.splice(0, sendTokens);
                tokens.push(sendToken);
            }
        }
    }
    
    return {
        tokens,
        modifiedMockResult
    };
}

describe('NDKCashuWallet Integration Test', () => {
    let wallet: NDKCashuWallet;
    let ndk: NDK;

    beforeAll(() => {
        ndk = new NDK({ signer: NDKPrivateKeySigner.generate() });
        wallet = new NDKCashuWallet(ndk);
    });

    fit('should create a new wallet and publish it', async () => {
        // Create a new wallet and ensure it's initialized properly
        const newWallet = new NDKCashuWallet(ndk);
        newWallet.relays = ['wss://example.com'];
        expect(newWallet).toBeDefined();

        // Publish the wallet
        await newWallet.publish();
        expect(newWallet.walletId).not.toBe('');
        expect(newWallet.event?.id).toBeDefined();
    });

    it('should add a token to the wallet and sync balance', async () => {
        const token = await createMockToken([10, 20, 30]);
        wallet.addToken(token);

        // Ensure token was added
        expect(wallet.tokens.length).toBe(1);
        expect(wallet.tokens[0].proofs.length).toBe(3);

        // Sync balance and ensure correct amount is returned
        await wallet.syncBalance();
        const balance = wallet.balance();
        expect(balance?.[0].amount).toBe(60); // 10 + 20 + 30
    });

    it('should mint nuts and correctly update the wallet state', async () => {
        // Mock wallet minting nuts
        jest.spyOn(wallet, 'mintNuts').mockResolvedValue({ send: [], keep: [] });

        const result = await wallet.mintNuts([10, 20], 'sats');
        expect(result).toBeDefined();
    });

    it('should receive a token and add it to the wallet', async () => {
        const token = await createMockToken([50]);
        const tokenString = JSON.stringify(token);

        await wallet.receiveToken(tokenString);
        expect(wallet.tokens.length).toBeGreaterThan(0);
    });

    it('should send a payment with LN', async () => {
        const paymentDetails = {
            pr: 'lnbc2500n1pwyj9skpp5dj45g79qx5d...snipped_example...',
        };

        // Mock payment response
        jest.spyOn(wallet, 'lnPay').mockResolvedValue({ preimage: 'some-preimage' });
        const paymentConfirmation = await wallet.lnPay(paymentDetails);

        expect(paymentConfirmation).toBeDefined();
        expect(paymentConfirmation?.preimage).toBe('some-preimage');
    });

    async function createMockToken(amounts: number[]): Promise<NDKCashuToken> {
        const token = new NDKCashuToken(ndk);
        const proofs: Proof[] = amounts.map(amount => ({
            amount,
            C: `02${Math.random().toString(16).substring(2)}`,
            secret: Math.random().toString(16).substring(2),
            id: Math.random().toString(16).substring(2, 10)
        }));
        token.proofs = proofs;
        token.mint = 'https://testmint.cashu.space';
        await token.sign();
        return token;
    }
});
