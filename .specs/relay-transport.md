# Specification: Relay Transport Layer

**Version:** 1.0
**Date:** 2025-04-28
**Author:** Solution Architect (AI)

## 1. Overview

This document specifies the design for an abstraction layer for relay communication within NDK-core. It defines a `RelayTransport` interface and a concrete implementation using WebSockets, `WebSocketTransport`. This abstraction allows for easier testing and potential future support for different transport mechanisms.

## 2. Goals

*   Define a standard interface for sending and receiving data from a relay.
*   Provide a concrete implementation using the standard browser `WebSocket` API.
*   Decouple the core relay logic from the specific transport mechanism.

## 3. Non-Goals

*   Implementing transport mechanisms other than WebSockets in this initial version.
*   Handling relay-specific protocol logic (e.g., NIP-01 message formatting) - this belongs in higher layers.

## 4. Proposed Architecture

We will introduce a new file, `src/relay/transport.ts`, containing the interface and the WebSocket implementation.

### 4.1. `RelayTransport` Interface

This interface defines the contract for any relay transport mechanism.

```typescript
// File: src/relay/transport.ts

/**
 * Interface for a relay transport layer.
 * Defines methods for connecting, sending/receiving data, and handling lifecycle events.
 */
export interface RelayTransport {
    /**
     * Initiates a connection to the specified relay URL.
     * @param url The URL of the relay to connect to.
     */
    connect(url: string): void;

    /**
     * Sends data over the established connection.
     * Should throw an error or handle cases where the connection is not open.
     * @param data The string data to send.
     */
    send(data: string): void;

    /**
     * Registers a callback function to be invoked when a message is received.
     * @param cb The callback function, receiving the message data as a string.
     */
    onMessage(cb: (data: string) => void): void;

    /**
     * Registers a callback function to be invoked when the connection is successfully opened.
     * @param cb The callback function.
     */
    onOpen(cb: () => void): void;

    /**
     * Registers a callback function to be invoked when the connection is closed.
     * @param cb The callback function.
     */
    onClose(cb: () => void): void;

    /**
     * Registers a callback function to be invoked when an error occurs.
     * @param cb The callback function, receiving the error object.
     */
    onError(cb: (error: any) => void): void;

    /**
     * Closes the connection.
     */
    close(): void;
}
```

### 4.2. `WebSocketTransport` Class

This class implements the `RelayTransport` interface using the browser's native `WebSocket` API.

```typescript
// File: src/relay/transport.ts (continued)
// Note: This is the specification, not the final implementation code.
// Implementation details might vary slightly.

export class WebSocketTransport implements RelayTransport {
    private ws: WebSocket | null = null;
    private messageCallback: ((data: string) => void) | null = null;
    private openCallback: (() => void) | null = null;
    private closeCallback: (() => void) | null = null;
    private errorCallback: ((error: any) => void) | null = null;

    connect(url: string): void {
        if (this.ws) {
            // Handle reconnection logic or throw error?
            // For now, assume close() is called before reconnecting.
            this.close();
        }

        try {
            this.ws = new WebSocket(url);

            this.ws.onopen = () => {
                this.openCallback?.();
            };

            this.ws.onmessage = (event: MessageEvent) => {
                if (typeof event.data === 'string') {
                    this.messageCallback?.(event.data);
                } else {
                    // Handle non-string data if necessary, or log a warning
                    console.warn("Received non-string WebSocket message:", event.data);
                }
            };

            this.ws.onclose = () => {
                this.closeCallback?.();
                this.ws = null; // Clean up reference
            };

            this.ws.onerror = (event: Event) => {
                // The 'error' event often doesn't contain detailed info.
                // The 'close' event usually follows with more details.
                this.errorCallback?.(event);
            };
        } catch (error) {
            this.errorCallback?.(error);
            this.ws = null;
        }
    }

    send(data: string): void {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(data);
        } else {
            // Handle error: connection not open
            const error = new Error("WebSocket connection is not open.");
            this.errorCallback?.(error);
            // Optionally throw the error
            // throw error;
        }
    }

    onMessage(cb: (data: string) => void): void {
        this.messageCallback = cb;
    }

    onOpen(cb: () => void): void {
        this.openCallback = cb;
    }

    onClose(cb: () => void): void {
        this.closeCallback = cb;
    }

    onError(cb: (error: any) => void): void {
        this.errorCallback = cb;
    }

    close(): void {
        if (this.ws) {
            // Remove listeners to prevent callbacks during explicit close?
            // Or rely on onclose handler? Let's rely on onclose for now.
            this.ws.close();
            // Note: The onclose callback will be triggered asynchronously.
            // Setting this.ws = null happens in the onclose handler.
        }
    }
}
```

## 5. Implementation Tasks

The following tasks need to be created in `project_state.json`:

1.  **Task ID:** `task-imp-transport-interface`
    *   **Goal:** Define the `RelayTransport` interface in `ndk-core/src/relay/transport.ts`.
    *   **Inputs:** Specification from `.specs/relay-transport.md`.
    *   **Outputs:** `ndk-core/src/relay/transport.ts` containing the interface definition.
    *   **Dependencies:** `task-design-relay-transport` (this design task).
    *   **Spec Files:** `.specs/relay-transport.md`
    *   **Acceptance Criteria:** The `RelayTransport` interface is correctly defined as per the spec in the specified file.

2.  **Task ID:** `task-imp-websocket-impl`
    *   **Goal:** Implement the `WebSocketTransport` class in `ndk-core/src/relay/transport.ts`.
    *   **Inputs:** Specification from `.specs/relay-transport.md`, `RelayTransport` interface.
    *   **Outputs:** `ndk-core/src/relay/transport.ts` containing the `WebSocketTransport` class implementation.
    *   **Dependencies:** `task-imp-transport-interface`.
    *   **Spec Files:** `.specs/relay-transport.md`
    *   **Acceptance Criteria:** The `WebSocketTransport` class correctly implements the `RelayTransport` interface using the `WebSocket` API as per the spec. It handles connection, sending, receiving, and lifecycle events appropriately.

## 6. Open Questions

*   How should reconnection attempts be handled if `connect` is called on an already connected instance? (Current spec assumes `close` is called first).
*   Should `send` throw an error if the connection isn't open, or just call the `onError` callback? (Current spec calls `onError` but comments out throwing). This might need refinement based on how the calling code expects to handle errors.
*   How should non-string WebSocket messages be handled? (Current spec logs a warning).