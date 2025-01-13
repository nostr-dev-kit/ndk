export function correctP2pk(p2pk?: string) {
    if (p2pk) {
        if (p2pk.length === 64) p2pk = `02${p2pk}`;
    }

    return p2pk;
}
