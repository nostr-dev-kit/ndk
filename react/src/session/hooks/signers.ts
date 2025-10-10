import { useNDKSessions } from "../store";

export const useNDKSessionSigners = () => useNDKSessions((s) => s.signers);
