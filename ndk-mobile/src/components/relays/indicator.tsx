import React from "react";
import { NDKRelay } from "@nostr-dev-kit/ndk";

import { NDKRelayStatus } from "@nostr-dev-kit/ndk";
import { useState, useEffect } from "react";
import { View } from "react-native";

const CONNECTIVITY_STATUS_COLORS: Record<NDKRelayStatus, string> = {
    [NDKRelayStatus.RECONNECTING]: '#f1c40f',
    [NDKRelayStatus.CONNECTING]: '#f1c40f',
    [NDKRelayStatus.DISCONNECTED]: '#aa4240',
    [NDKRelayStatus.DISCONNECTING]: '#aa4240',
    [NDKRelayStatus.CONNECTED]: '#66cc66',
    [NDKRelayStatus.FLAPPING]: '#2ecc71',
    [NDKRelayStatus.AUTHENTICATING]: '#3498db',
    [NDKRelayStatus.AUTHENTICATED]: '#e74c3c',
    [NDKRelayStatus.AUTH_REQUESTED]: '#e74c3c',
} as const;

export default function RelayConnectivityIndicator({ relay }: { relay: NDKRelay }) {
    const [ color, setColor ] = useState(CONNECTIVITY_STATUS_COLORS[relay.status]);

    useEffect(() => {
        relay.on("connect", () => setColor(CONNECTIVITY_STATUS_COLORS[relay.status]));
        relay.on("disconnect", () => setColor(CONNECTIVITY_STATUS_COLORS[relay.status]));
        relay.on("ready", () => setColor(CONNECTIVITY_STATUS_COLORS[relay.status]));
        relay.on("flapping", () => setColor(CONNECTIVITY_STATUS_COLORS[relay.status]));
        relay.on("notice", () => setColor(CONNECTIVITY_STATUS_COLORS[relay.status]));
        relay.on("auth", () => setColor(CONNECTIVITY_STATUS_COLORS[relay.status]));
        relay.on("authed", () => setColor(CONNECTIVITY_STATUS_COLORS[relay.status]));
        relay.on("auth:failed", () => setColor(CONNECTIVITY_STATUS_COLORS[relay.status]));
        relay.on("delayed-connect", () => setColor(CONNECTIVITY_STATUS_COLORS[relay.status]));
    }, []);

    return (
        <View
            style={{
                borderRadius: 10,
                width: 8,
                height: 8,
                backgroundColor: color,
            }}
        />
    );
}
