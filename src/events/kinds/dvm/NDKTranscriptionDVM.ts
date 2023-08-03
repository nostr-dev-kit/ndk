import { NDKKind } from "..";
import { NostrEvent } from "../..";
import NDK from "../../..";
import { NDKDVMRequest } from "./NDKDVMRequest";

/**
 * NIP-90
 *
 * This class creates DVM transcription job types
 */
export class NDKTranscriptionDVM extends NDKDVMRequest {
    constructor(ndk: NDK | undefined, event?: NostrEvent) {
        super(ndk, event);
        this.kind = NDKKind.DVMJobRequestTranscription;
    }
}
