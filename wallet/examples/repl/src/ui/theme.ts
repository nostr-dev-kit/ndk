import chalk from "chalk";
import gradient from "gradient-string";

export const theme = {
    // Colors
    primary: chalk.hex("#FF6B35"),
    secondary: chalk.hex("#4ECDC4"),
    success: chalk.green,
    error: chalk.red,
    warning: chalk.yellow,
    info: chalk.blue,
    muted: chalk.gray,
    highlight: chalk.cyan,

    // Status indicators
    ready: chalk.green("●"),
    loading: chalk.yellow("●"),
    errorIcon: chalk.red("●"),
    offline: chalk.gray("●"),

    // Symbols
    check: chalk.green("✓"),
    cross: chalk.red("✗"),
    arrow: chalk.cyan("→"),
    bullet: chalk.gray("•"),
    pending: chalk.yellow("⏳"),

    // Gradients
    titleGradient: gradient(["#FF6B35", "#F7931A"]),
    headerGradient: gradient(["#4ECDC4", "#556270"]),
};

export const box = {
    // Box drawing characters
    topLeft: "┌",
    topRight: "┐",
    bottomLeft: "└",
    bottomRight: "┘",
    horizontal: "─",
    vertical: "│",
    cross: "┼",
    tLeft: "├",
    tRight: "┤",
    tTop: "┬",
    tBottom: "┴",

    // Double line box
    doubleTopLeft: "╔",
    doubleTopRight: "╗",
    doubleBottomLeft: "╚",
    doubleBottomRight: "╝",
    doubleHorizontal: "═",
    doubleVertical: "║",
};

export function formatSats(amount: number): string {
    return new Intl.NumberFormat("en-US").format(amount);
}

export function formatTime(timestamp: number): string {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - timestamp;

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

export function formatRelativeTime(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

export function truncate(str: string, length: number): string {
    if (str.length <= length) return str;
    return `${str.slice(0, length - 3)}...`;
}

export function npubPreview(npub: string): string {
    if (npub.length < 16) return npub;
    return `${npub.slice(0, 8)}...${npub.slice(-4)}`;
}

export function eventIdPreview(id: string): string {
    return `${id.slice(0, 6)}...${id.slice(-6)}`;
}
