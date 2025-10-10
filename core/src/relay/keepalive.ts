/**
 * NDKRelayKeepalive monitors relay silence and triggers probes when no activity is detected.
 * This helps detect stale connections that occur after system sleep/wake events.
 */
export class NDKRelayKeepalive {
    private lastActivity = Date.now();
    private timer?: ReturnType<typeof setTimeout>;
    private readonly timeout: number;
    private isRunning = false;

    /**
     * @param timeout - Time in milliseconds to wait before considering connection stale (default 30s)
     * @param onSilenceDetected - Callback when silence is detected
     */
    constructor(
        timeout = 30000,
        private onSilenceDetected: () => void,
    ) {
        this.timeout = timeout;
    }

    /**
     * Records activity from the relay, resetting the silence timer
     */
    public recordActivity(): void {
        this.lastActivity = Date.now();
        if (this.isRunning) {
            this.resetTimer();
        }
    }

    /**
     * Starts monitoring for relay silence
     */
    public start(): void {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastActivity = Date.now();
        this.resetTimer();
    }

    /**
     * Stops monitoring for relay silence
     */
    public stop(): void {
        this.isRunning = false;
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = undefined;
        }
    }

    private resetTimer(): void {
        if (this.timer) {
            clearTimeout(this.timer);
        }

        this.timer = setTimeout(() => {
            const silenceTime = Date.now() - this.lastActivity;
            if (silenceTime >= this.timeout) {
                // Relay has been silent for too long
                this.onSilenceDetected();
            } else {
                // Some activity happened, reset timer for remaining time
                const remainingTime = this.timeout - silenceTime;
                this.timer = setTimeout(() => {
                    this.onSilenceDetected();
                }, remainingTime);
            }
        }, this.timeout);
    }
}

/**
 * Probes a relay connection by sending a minimal REQ expecting immediate EOSE response
 * @param relay - The relay to probe
 * @returns Promise that resolves to true if relay responds, false otherwise
 */
export async function probeRelayConnection(relay: {
    send: (msg: any[]) => void;
    once: (event: string, handler: () => void) => void;
}): Promise<boolean> {
    const probeId = `probe-${Math.random().toString(36).substring(7)}`;

    return new Promise((resolve) => {
        let responded = false;

        const timeout = setTimeout(() => {
            if (!responded) {
                responded = true;
                relay.send(["CLOSE", probeId]);
                resolve(false);
            }
        }, 5000);

        const handler = () => {
            if (!responded) {
                responded = true;
                clearTimeout(timeout);
                relay.send(["CLOSE", probeId]);
                resolve(true);
            }
        };

        relay.once("message", handler);

        // Send minimal REQ that should trigger immediate EOSE
        // Using a non-existent kind and limit 0 for minimal overhead
        relay.send([
            "REQ",
            probeId,
            {
                kinds: [99999],
                limit: 0,
            },
        ]);
    });
}
