import { createContext, useContext } from "react";
import { useSocket } from "../infra/wsHook";

const WSContext = createContext<any>(null);

export function WebSocketProvider({ children }: any) {
  const ws = useSocket(import.meta.env.VITE_WS_URI);

  return <WSContext.Provider value={ws}>{children}</WSContext.Provider>;
}

export function useWS() {
  return useContext(WSContext);
}

