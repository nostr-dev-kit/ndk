import debug from "debug";
import { DEBUG_NAMESPACE } from "./constants";

/**
 * Standard logger interface
 */
export interface Logger {
    error(message: string, data?: any): void;
    warn(message: string, data?: any): void;
    info(message: string, data?: any): void;
    debug(message: string, data?: any): void;
}

/**
 * Debug logger implementation using debug package
 */
export class DebugLogger implements Logger {
    private debugger: debug.Debugger;

    constructor(namespace = DEBUG_NAMESPACE) {
        this.debugger = debug(namespace);
    }

    error(message: string, data?: any): void {
        this.log("error", message, data);
    }

    warn(message: string, data?: any): void {
        this.log("warn", message, data);
    }

    info(message: string, data?: any): void {
        this.log("info", message, data);
    }

    debug(message: string, data?: any): void {
        this.log("debug", message, data);
    }

    private log(level: string, message: string, data?: any): void {
        const formattedMessage = `[${level.toUpperCase()}] ${message}`;
        if (data !== undefined) {
            this.debugger(formattedMessage, data);
        } else {
            this.debugger(formattedMessage);
        }
    }
}

/**
 * Custom logger implementation
 */
export class CustomLogger implements Logger {
    private logFunction: (level: string, message: string, data?: any) => void;

    constructor(logFunction: (level: string, message: string, data?: any) => void) {
        this.logFunction = logFunction;
    }

    error(message: string, data?: any): void {
        this.logFunction("error", message, data);
    }

    warn(message: string, data?: any): void {
        this.logFunction("warn", message, data);
    }

    info(message: string, data?: any): void {
        this.logFunction("info", message, data);
    }

    debug(message: string, data?: any): void {
        this.logFunction("debug", message, data);
    }
}
