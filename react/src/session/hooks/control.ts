import { useNDKSessions } from "../store";

export const useNDKSessionStart = () => useNDKSessions((s) => s.startSession);
export const useNDKSessionStop = () => useNDKSessions((s) => s.stopSession);
export const useNDKSessionAddMonitor = () => useNDKSessions((s) => s.addMonitor);
