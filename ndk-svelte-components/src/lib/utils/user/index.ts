export function prettifyNip05(nip05: string): string {
    if (nip05.startsWith("_@")) {
        return nip05.substring(2);
    } else {
        return nip05;
    }
}
