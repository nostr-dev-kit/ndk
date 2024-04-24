export function prettifyNip05(nip05: string, maxLength?: number | undefined): string {
    const trimmedNip05: string = nip05.startsWith("_@") ? nip05.substring(2) : nip05;
    if (maxLength) {
        return trimmedNip05.slice(0, maxLength);
    } else {
        return trimmedNip05;
    }
}
