import { decode as decodeBolt11 } from "light-bolt11-decoder";

export function getBolt11ExpiresAt(bolt11: string): number | undefined {
    const decoded = decodeBolt11(bolt11);
    
    const expiry = decoded.expiry;
    const timestamp = decoded.sections.find((section: { name: string; }) => section.name === 'timestamp')?.value;
    
    if (typeof expiry === 'number' && typeof timestamp === 'number') {
        return expiry + timestamp;
    }
    
    return undefined;
}
