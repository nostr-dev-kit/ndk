import { beforeEach, describe, expect, test, vi } from "vitest";
import { NDKNutzap } from "./index.js";

// Define a type for our debug mock function
type MockDebugger = ReturnType<typeof vi.fn> & {
    extend: ReturnType<typeof vi.fn>;
};

describe("NDKNutzap", () => {
    let mockDebug: MockDebugger;

    beforeEach(() => {
        // Create a function that can be called directly and also has an extend property
        mockDebug = vi.fn() as MockDebugger;
        mockDebug.extend = vi.fn().mockReturnValue(mockDebug);
    });

    describe("p2pk extraction", () => {
        test("should extract rawP2pk with proper P2PK array format", () => {
            // Create nutzap with mocked NDK
            const nutzap = new NDKNutzap({
                debug: mockDebug,
                getUser: vi.fn().mockImplementation((opts) => ({
                    pubkey: opts.pubkey,
                })),
            } as any);
            const testPubkey = "02b85cb23753546871fe6d1c20641120499a4ec60decd712e76708bb0fef19a7a1";

            // Mock the proofs with the format seen in the real-world example
            nutzap.proofs = [
                {
                    amount: 2,
                    C: "022c548b64e64cdbb9fb686a12486ccb322718a1fee6900e8bd43d8cc53bc3a8a4",
                    id: "004f7adf2a04356c",
                    secret: JSON.stringify([
                        "P2PK",
                        {
                            nonce: "30ee4536c363ecbcbc0ffee58f153a065fc404ccf98ac96324a1cb5c984eb3f1",
                            data: testPubkey,
                        },
                    ]),
                },
            ];

            expect(nutzap.rawP2pk).toBe(testPubkey);
            // p2pk should remove the "02" prefix if present
            expect(nutzap.p2pk).toBe("b85cb23753546871fe6d1c20641120499a4ec60decd712e76708bb0fef19a7a1");
        });

        test("should handle non-array secret format", () => {
            const nutzap = new NDKNutzap({
                debug: mockDebug,
                getUser: vi.fn().mockImplementation((opts) => ({
                    pubkey: opts.pubkey,
                })),
            } as any);
            const testPubkey = "02a1b2c3d4e5f6";

            // Mock a proof with non-array format but still has data at payload[1].data
            nutzap.proofs = [
                {
                    amount: 1,
                    C: "somec",
                    id: "someid",
                    secret: JSON.stringify({
                        "0": "something",
                        "1": {
                            data: testPubkey,
                        },
                    }),
                },
            ];

            expect(nutzap.rawP2pk).toBe(testPubkey);
            expect(nutzap.p2pk).toBe("a1b2c3d4e5f6");
        });

        test("should handle nested string JSON parsing", () => {
            const nutzap = new NDKNutzap({
                debug: mockDebug,
                getUser: vi.fn().mockImplementation((opts) => ({
                    pubkey: opts.pubkey,
                })),
            } as any);
            const testPubkey = "02d4e5f6a1b2c3";

            // Mock a proof with a stringified JSON inside the secret
            nutzap.proofs = [
                {
                    amount: 1,
                    C: "somec",
                    id: "someid",
                    secret: JSON.stringify(
                        JSON.stringify([
                            "P2PK",
                            {
                                nonce: "somenonce",
                                data: testPubkey,
                            },
                        ]),
                    ),
                },
            ];

            expect(nutzap.rawP2pk).toBe(testPubkey);
            expect(nutzap.p2pk).toBe("d4e5f6a1b2c3");
        });

        test("should handle invalid proof data gracefully", () => {
            const nutzap = new NDKNutzap({
                debug: mockDebug,
                getUser: vi.fn().mockImplementation((opts) => ({
                    pubkey: opts.pubkey,
                })),
            } as any);

            // Test with various invalid proof formats

            // 1. Empty proofs array
            nutzap.proofs = [];
            expect(nutzap.rawP2pk).toBeUndefined();
            expect(nutzap.p2pk).toBeUndefined();

            // 2. Invalid JSON in secret
            nutzap.proofs = [
                {
                    amount: 1,
                    C: "somec",
                    id: "someid",
                    secret: "not-valid-json",
                },
            ];
            expect(nutzap.rawP2pk).toBeUndefined();
            expect(nutzap.p2pk).toBeUndefined();

            // 3. Valid JSON but wrong structure
            nutzap.proofs = [
                {
                    amount: 1,
                    C: "somec",
                    id: "someid",
                    secret: JSON.stringify({
                        notCorrectFormat: true,
                    }),
                },
            ];
            expect(nutzap.rawP2pk).toBeUndefined();
            expect(nutzap.p2pk).toBeUndefined();
        });

        test("should handle real-world nutzap example", () => {
            // Mock NDK
            const mockNDK = {
                debug: mockDebug,
                getUser: vi.fn().mockImplementation((opts) => ({
                    pubkey: opts.pubkey,
                })),
            };

            // This test recreates the actual nutzap from the user's example
            const nutzapEvent = {
                kind: 9321,
                content: "🌊",
                created_at: Math.floor(Date.now() / 1000),
                tags: [
                    ["alt", "This is a nutzap"],
                    [
                        "proof",
                        '{"amount":2,"C":"022c548b64e64cdbb9fb686a12486ccb322718a1fee6900e8bd43d8cc53bc3a8a4","id":"004f7adf2a04356c","secret":"[\\"P2PK\\",{\\"nonce\\":\\"30ee4536c363ecbcbc0ffee58f153a065fc404ccf98ac96324a1cb5c984eb3f1\\",\\"data\\":\\"02b85cb23753546871fe6d1c20641120499a4ec60decd712e76708bb0fef19a7a1\\"}]"}',
                    ],
                    [
                        "proof",
                        '{"amount":8,"C":"0339d902b6f81c34121069a0c43d246475c007f404a6c1024457e7200dd81549d9","id":"004f7adf2a04356c","secret":"[\\"P2PK\\",{\\"nonce\\":\\"eac19df8ff5e177f847f7de3efd71030c4a52f0b1aefbfc047af5bdb1f83a5fb\\",\\"data\\":\\"02b85cb23753546871fe6d1c20641120499a4ec60decd712e76708bb0fef19a7a1\\"}]"}',
                    ],
                    ["u", "https://mint.coinos.io"],
                    ["p", "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52"],
                    ["unit", "sat"],
                    ["amount", "10"],
                ],
                pubkey: "a396e36e962a991dac21731dd45da2ee3fd9265d65f9839c15847294ec991f1c",
            };

            // Create nutzap event with our mocked NDK
            const nutzapWrapper = new NDKNutzap(mockNDK as any, nutzapEvent);
            const nutzap = NDKNutzap.from(nutzapWrapper);

            // Verify p2pk extraction
            expect(nutzap?.rawP2pk).toBe("02b85cb23753546871fe6d1c20641120499a4ec60decd712e76708bb0fef19a7a1");
            expect(nutzap?.p2pk).toBe("b85cb23753546871fe6d1c20641120499a4ec60decd712e76708bb0fef19a7a1");
        });
    });
});
