#!/usr/bin/env bun

/**
 * Generates comprehensive test vectors for NIP-61 nutzap validation.
 * Creates both valid and invalid nutzap events to test compliance.
 */

import { NDK } from "../src/ndk/index.js";
import { NDKPrivateKeySigner } from "../src/signers/private-key/index.js";
import { mockNutzap, mockProof } from "../test/mocks/nutzaps.js";
import { NDKNutzap } from "../src/events/kinds/nutzap/index.js";
import { NutzapValidationCode } from "../src/events/kinds/nutzap/validation.js";
import type { NostrEvent } from "../src/index.js";

type TestVector = {
    name: string;
    description: string;
    event: NostrEvent;
    expectedValid: boolean;
    expectedIssues?: NutzapValidationCode[];
};

async function generateTestVectors(): Promise<TestVector[]> {
    const ndk = new NDK();
    const senderSigner = NDKPrivateKeySigner.generate();
    const recipientSigner = NDKPrivateKeySigner.generate();

    const senderUser = await senderSigner.user();
    const recipientUser = await recipientSigner.user();
    const senderPubkey = senderUser.pubkey;
    const recipientPubkey = recipientUser.pubkey;

    const mint = "https://mint.example.com";
    const eventId = "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";

    const vectors: TestVector[] = [];

    // Valid nutzap with full NIP-61 compliance (e and P tags)
    const validNutzap = await mockNutzap(mint, 100, ndk, {
        senderPk: senderSigner,
        recipientPubkey,
        eventId,
        content: "Great post!",
    });
    vectors.push({
        name: "valid_complete",
        description: "Valid nutzap with e and P tags in proofs (full NIP-61 compliance)",
        event: await validNutzap.toNostrEvent(),
        expectedValid: true,
        expectedIssues: [],
    });

    // Valid nutzap without e tag (backwards compatible)
    const validNoETag = await mockNutzap(mint, 100, ndk, {
        senderPk: senderSigner,
        recipientPubkey,
        content: "Nice!",
    });
    vectors.push({
        name: "valid_no_e_tag",
        description: "Valid nutzap without e tag (backwards compatible but with warnings)",
        event: await validNoETag.toNostrEvent(),
        expectedValid: true,
        expectedIssues: [
            NutzapValidationCode.NO_EVENT_TAG_IN_EVENT,
            NutzapValidationCode.MISSING_EVENT_TAG_IN_PROOF,
        ],
    });

    // Valid nutzap with multiple proofs
    const validMultiProof = new NDKNutzap(ndk);
    validMultiProof.mint = mint;
    validMultiProof.recipientPubkey = recipientPubkey;
    validMultiProof.tag(["e", eventId]);
    const multiProofTags: [string, string][] = [["e", eventId], ["P", senderPubkey]];
    validMultiProof.proofs = [
        mockProof("proof1", 50, recipientPubkey, multiProofTags),
        mockProof("proof2", 50, recipientPubkey, multiProofTags),
    ];
    validMultiProof.comment = "Split payment";
    await validMultiProof.sign(senderSigner);
    vectors.push({
        name: "valid_multiple_proofs",
        description: "Valid nutzap with multiple proofs",
        event: await validMultiProof.toNostrEvent(),
        expectedValid: true,
        expectedIssues: [],
    });

    // Invalid: No proofs
    const noProofs = new NDKNutzap(ndk);
    noProofs.mint = mint;
    noProofs.recipientPubkey = recipientPubkey;
    noProofs.proofs = [];
    await noProofs.sign(senderSigner);
    vectors.push({
        name: "invalid_no_proofs",
        description: "Invalid: No proofs provided",
        event: await noProofs.toNostrEvent(),
        expectedValid: false,
        expectedIssues: [NutzapValidationCode.NO_PROOFS],
    });

    // Invalid: No recipient
    const validTags: [string, string][] = [["e", eventId], ["P", senderPubkey]];
    const noRecipient = new NDKNutzap(ndk);
    noRecipient.mint = mint;
    noRecipient.proofs = [mockProof("proof", 100, recipientPubkey, validTags)];
    await noRecipient.sign(senderSigner);
    vectors.push({
        name: "invalid_no_recipient",
        description: "Invalid: Missing recipient p tag",
        event: await noRecipient.toNostrEvent(),
        expectedValid: false,
        expectedIssues: [NutzapValidationCode.NO_RECIPIENT],
    });

    // Invalid: Multiple recipients
    const multipleRecipients = new NDKNutzap(ndk);
    multipleRecipients.mint = mint;
    multipleRecipients.proofs = [mockProof("proof", 100, recipientPubkey, validTags)];
    multipleRecipients.tags = [
        ["p", recipientPubkey],
        ["p", "another_pubkey_0123456789abcdef0123456789abcdef01234567"],
    ];
    await multipleRecipients.sign(senderSigner);
    vectors.push({
        name: "invalid_multiple_recipients",
        description: "Invalid: Multiple recipient p tags",
        event: await multipleRecipients.toNostrEvent(),
        expectedValid: false,
        expectedIssues: [NutzapValidationCode.MULTIPLE_RECIPIENTS],
    });

    // Invalid: No mint
    const noMint = new NDKNutzap(ndk);
    noMint.recipientPubkey = recipientPubkey;
    noMint.proofs = [mockProof("proof", 100, recipientPubkey, validTags)];
    await noMint.sign(senderSigner);
    vectors.push({
        name: "invalid_no_mint",
        description: "Invalid: Missing mint u tag",
        event: await noMint.toNostrEvent(),
        expectedValid: false,
        expectedIssues: [NutzapValidationCode.NO_MINT],
    });

    // Invalid: Multiple event tags
    const multipleEvents = await mockNutzap(mint, 100, ndk, {
        senderPk: senderSigner,
        recipientPubkey,
        eventId,
    });
    multipleEvents.tags.push(["e", "another_event_id_1234567890abcdef1234567890abcdef"]);
    vectors.push({
        name: "invalid_multiple_event_tags",
        description: "Invalid: Multiple e tags in event",
        event: await multipleEvents.toNostrEvent(),
        expectedValid: false,
        expectedIssues: [NutzapValidationCode.MULTIPLE_EVENT_TAGS],
    });

    // Invalid: Malformed proof secret
    const malformedSecret = new NDKNutzap(ndk);
    malformedSecret.mint = mint;
    malformedSecret.recipientPubkey = recipientPubkey;
    malformedSecret.proofs = [
        {
            id: "proof",
            amount: 100,
            C: "test",
            secret: "not valid json {{{",
        },
    ];
    await malformedSecret.sign(senderSigner);
    vectors.push({
        name: "invalid_malformed_secret",
        description: "Invalid: Proof secret is not valid JSON",
        event: await malformedSecret.toNostrEvent(),
        expectedValid: false,
        expectedIssues: [NutzapValidationCode.MALFORMED_PROOF_SECRET],
    });

    // Warning: Missing e tag in proof (event has e tag)
    const missingProofETag = new NDKNutzap(ndk);
    missingProofETag.mint = mint;
    missingProofETag.recipientPubkey = recipientPubkey;
    missingProofETag.tag(["e", eventId]);
    missingProofETag.proofs = [mockProof("proof", 100, recipientPubkey, [["P", senderPubkey]])];
    await missingProofETag.sign(senderSigner);
    vectors.push({
        name: "warning_missing_proof_e_tag",
        description: "Valid with warning: Event has e tag but proof doesn't",
        event: await missingProofETag.toNostrEvent(),
        expectedValid: true,
        expectedIssues: [NutzapValidationCode.MISSING_EVENT_TAG_IN_PROOF],
    });

    // Warning: Mismatched e tag in proof
    const mismatchedProofETag = new NDKNutzap(ndk);
    mismatchedProofETag.mint = mint;
    mismatchedProofETag.recipientPubkey = recipientPubkey;
    mismatchedProofETag.tag(["e", eventId]);
    mismatchedProofETag.proofs = [
        mockProof("proof", 100, recipientPubkey, [["e", "different_event_id"], ["P", senderPubkey]]),
    ];
    await mismatchedProofETag.sign(senderSigner);
    vectors.push({
        name: "warning_mismatched_proof_e_tag",
        description: "Valid with warning: Proof e tag doesn't match event e tag",
        event: await mismatchedProofETag.toNostrEvent(),
        expectedValid: true,
        expectedIssues: [NutzapValidationCode.MISMATCHED_EVENT_TAG_IN_PROOF],
    });

    // Warning: Missing P tag in proof
    const missingProofPTag = new NDKNutzap(ndk);
    missingProofPTag.mint = mint;
    missingProofPTag.recipientPubkey = recipientPubkey;
    missingProofPTag.tag(["e", eventId]);
    missingProofPTag.proofs = [mockProof("proof", 100, recipientPubkey, [["e", eventId]])];
    await missingProofPTag.sign(senderSigner);
    vectors.push({
        name: "warning_missing_proof_p_tag",
        description: "Valid with warning: Proof missing P tag for sender verification",
        event: await missingProofPTag.toNostrEvent(),
        expectedValid: true,
        expectedIssues: [NutzapValidationCode.MISSING_SENDER_TAG_IN_PROOF],
    });

    // Warning: Mismatched P tag in proof
    const mismatchedProofPTag = new NDKNutzap(ndk);
    mismatchedProofPTag.mint = mint;
    mismatchedProofPTag.recipientPubkey = recipientPubkey;
    mismatchedProofPTag.tag(["e", eventId]);
    mismatchedProofPTag.proofs = [
        mockProof("proof", 100, recipientPubkey, [["e", eventId], ["P", "wrong_sender_pubkey"]]),
    ];
    await mismatchedProofPTag.sign(senderSigner);
    vectors.push({
        name: "warning_mismatched_proof_p_tag",
        description: "Valid with warning: Proof P tag doesn't match sender pubkey",
        event: await mismatchedProofPTag.toNostrEvent(),
        expectedValid: true,
        expectedIssues: [NutzapValidationCode.MISMATCHED_SENDER_TAG_IN_PROOF],
    });

    return vectors;
}

async function main() {
    console.log("Generating NIP-61 test vectors...\n");

    const vectors = await generateTestVectors();

    // Output as JSON
    const output = {
        version: "1.0.0",
        nip: "NIP-61",
        description: "Test vectors for NIP-61 nutzap validation",
        generated: new Date().toISOString(),
        vectors,
    };

    console.log(JSON.stringify(output, null, 2));

    // Print summary
    console.error(`\n✓ Generated ${vectors.length} test vectors:`);
    console.error(`  - ${vectors.filter((v) => v.expectedValid).length} valid events`);
    console.error(
        `  - ${vectors.filter((v) => !v.expectedValid).length} invalid events (errors)`
    );
    console.error(
        `  - ${vectors.filter((v) => v.expectedValid && v.expectedIssues && v.expectedIssues.length > 0).length} valid events with warnings`
    );
}

main().catch(console.error);
