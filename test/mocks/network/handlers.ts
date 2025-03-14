import { http, HttpResponse } from "msw";
import { NDKEvent } from "../../../ndk/src";

// Store active WebSocket connections
const activeConnections = new Map<string, WebSocket>();

// Create MSW WebSocket handlers
export const handlers = [
    // Fallback for all HTTP requests
    http.all("*", () => {
        return new HttpResponse(null, { status: 404 });
    }),
];

// Helper functions to interact with active WebSocket connections
export const webSocketHelpers = {
    // Add a WebSocket connection for testing
    addConnection(url: string, socket: WebSocket): void {
        activeConnections.set(url, socket);
    },

    // Send a message to a specific WebSocket connection
    sendMessage(url: string, message: string | unknown[]): void {
        const socket = activeConnections.get(url);
        if (socket) {
            socket.send(typeof message === "string" ? message : JSON.stringify(message));
        }
    },

    // Simulate an event coming from a relay
    simulateEvent(url: string, event: NDKEvent): void {
        this.sendMessage(url, ["EVENT", "", event.rawEvent()]);
    },

    // Simulate EOSE for a subscription
    simulateEOSE(url: string, subscriptionId: string): void {
        this.sendMessage(url, ["EOSE", subscriptionId]);
    },

    // Close a WebSocket connection
    closeConnection(url: string): void {
        const socket = activeConnections.get(url);
        if (socket) {
            socket.close();
            activeConnections.delete(url);
        }
    },

    // Close all WebSocket connections
    closeAllConnections(): void {
        for (const [url, socket] of activeConnections.entries()) {
            socket.close();
            activeConnections.delete(url);
        }
    },
};
