import { SignerAppInfo } from "expo-nip55";
import { getInstalledSignerApps } from "expo-nip55";
import { useState, useEffect } from "react";

export function useNip55() {
    const [signerApps, setSignerApps] = useState<SignerAppInfo[]>([]);

    useEffect(() => {
        getInstalledSignerApps().then(setSignerApps);
    }, [])

    return {
        isAvailable: signerApps.length > 0,
        apps: signerApps,
    }
}