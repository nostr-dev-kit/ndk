import { useNDKSessions } from "../store";

export const useNDKSessionSessions = () => useNDKSessions((s) => s.sessions);
