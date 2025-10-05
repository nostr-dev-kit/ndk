/**
 * Custom error classes for better error handling
 */

export class SessionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'SessionError';
    }
}

export class SignerDeserializationError extends SessionError {
    constructor(message: string) {
        super(message);
        this.name = 'SignerDeserializationError';
    }
}

export class StorageError extends SessionError {
    constructor(message: string) {
        super(message);
        this.name = 'StorageError';
    }
}

export class SessionNotFoundError extends SessionError {
    constructor(pubkey: string) {
        super(`Session not found for pubkey: ${pubkey}`);
        this.name = 'SessionNotFoundError';
    }
}

export class NoActiveSessionError extends SessionError {
    constructor() {
        super('No active session');
        this.name = 'NoActiveSessionError';
    }
}

export class NDKNotInitializedError extends SessionError {
    constructor() {
        super('NDK not initialized. Call init() first.');
        this.name = 'NDKNotInitializedError';
    }
}