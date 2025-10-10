import Table from "cli-table3";
import { box, theme } from "./theme.js";

export function clearScreen() {
    console.clear();
}

export function drawLine(length = 80, char = box.horizontal): string {
    return char.repeat(length);
}

export function drawBox(title: string, content: string[], width = 80, style: "single" | "double" = "single"): string {
    const tl = style === "double" ? box.doubleTopLeft : box.topLeft;
    const tr = style === "double" ? box.doubleTopRight : box.topRight;
    const bl = style === "double" ? box.doubleBottomLeft : box.bottomLeft;
    const br = style === "double" ? box.doubleBottomRight : box.bottomRight;
    const h = style === "double" ? box.doubleHorizontal : box.horizontal;
    const v = style === "double" ? box.doubleVertical : box.vertical;

    const lines: string[] = [];

    // Top border with title
    const titlePadding = Math.floor((width - title.length - 4) / 2);
    const topLine = `${tl + h.repeat(titlePadding)} ${title} ${h.repeat(width - titlePadding - title.length - 4)}${tr}`;
    lines.push(topLine);

    // Content lines
    for (const line of content) {
        const strippedLength = stripAnsi(line).length;
        const padding = width - strippedLength - 2;
        lines.push(v + line + " ".repeat(Math.max(0, padding)) + v);
    }

    // Bottom border
    lines.push(bl + h.repeat(width - 2) + br);

    return lines.join("\n");
}

export function drawHeader(title: string, subtitle?: string, width = 80): string {
    const lines: string[] = [];

    lines.push(box.doubleTopLeft + box.doubleHorizontal.repeat(width - 2) + box.doubleTopRight);

    const titlePadding = Math.floor((width - title.length - 2) / 2);
    lines.push(
        box.doubleVertical +
            " ".repeat(titlePadding) +
            theme.titleGradient(title) +
            " ".repeat(width - titlePadding - title.length - 2) +
            box.doubleVertical,
    );

    if (subtitle) {
        const subtitlePadding = Math.floor((width - subtitle.length - 2) / 2);
        lines.push(
            box.doubleVertical +
                " ".repeat(subtitlePadding) +
                theme.muted(subtitle) +
                " ".repeat(width - subtitlePadding - subtitle.length - 2) +
                box.doubleVertical,
        );
    }

    lines.push(box.doubleBottomLeft + box.doubleHorizontal.repeat(width - 2) + box.doubleBottomRight);

    return lines.join("\n");
}

export function drawSection(title: string, content: string[], width = 80): string {
    const lines: string[] = [];

    // Section header
    const headerLine =
        box.topLeft +
        box.horizontal +
        ` ${theme.highlight(title)} ` +
        box.horizontal.repeat(width - title.length - 5) +
        box.topRight;
    lines.push(headerLine);

    // Content
    for (const line of content) {
        const strippedLength = stripAnsi(line).length;
        const padding = width - strippedLength - 2;
        lines.push(box.vertical + line + " ".repeat(Math.max(0, padding)) + box.vertical);
    }

    // Bottom border
    lines.push(box.bottomLeft + box.horizontal.repeat(width - 2) + box.bottomRight);

    return lines.join("\n");
}

export function createTable(options: { head?: string[]; rows: string[][]; colWidths?: number[] }): string {
    const table = new Table({
        head: options.head?.map((h) => theme.highlight(h)),
        colWidths: options.colWidths,
        style: {
            head: [],
            border: ["gray"],
        },
        chars: {
            top: box.horizontal,
            "top-mid": box.tTop,
            "top-left": box.topLeft,
            "top-right": box.topRight,
            bottom: box.horizontal,
            "bottom-mid": box.tBottom,
            "bottom-left": box.bottomLeft,
            "bottom-right": box.bottomRight,
            left: box.vertical,
            "left-mid": box.tLeft,
            mid: box.horizontal,
            "mid-mid": box.cross,
            right: box.vertical,
            "right-mid": box.tRight,
            middle: box.vertical,
        },
    });

    for (const row of options.rows) {
        table.push(row);
    }

    return table.toString();
}

export function padRight(str: string, length: number): string {
    const stripped = stripAnsi(str);
    const padding = length - stripped.length;
    return str + " ".repeat(Math.max(0, padding));
}

export function padLeft(str: string, length: number): string {
    const stripped = stripAnsi(str);
    const padding = length - stripped.length;
    return " ".repeat(Math.max(0, padding)) + str;
}

export function padCenter(str: string, length: number): string {
    const stripped = stripAnsi(str);
    const padding = length - stripped.length;
    const leftPad = Math.floor(padding / 2);
    const rightPad = padding - leftPad;
    return " ".repeat(Math.max(0, leftPad)) + str + " ".repeat(Math.max(0, rightPad));
}

// Simple ANSI escape code stripper
function stripAnsi(str: string): string {
    // biome-ignore lint/suspicious/noControlCharactersInRegex: ANSI escape sequences use control characters
    return str.replace(/\x1b\[[0-9;]*m/g, "");
}
