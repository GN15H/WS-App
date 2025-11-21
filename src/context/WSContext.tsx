import { createContext, useContext, useState } from "react";
import { useSocket } from "../infra/wsHook";
import type { Socket } from "socket.io-client";

export type WsConnection = {
  socket: Socket | null;
  on: (event: string, handler: (data: any) => void) => (() => void) | undefined;
  emit: (event: string, payload?: any) => void;
};

interface IWsContext {
  ws: WsConnection;
  isConnected: boolean;
}

export const WsContext = createContext<IWsContext | undefined>(undefined);

export const useWS = () => {
  const context = useContext(WsContext);
  if (!context) throw new Error("WsContext is not loaded");
  return context;
};

export function WebSocketProvider({ children }: any) {
  const [isConnected, setIsConnected] = useState(false);

  const ws = useSocket(import.meta.env.VITE_WS_URI, setIsConnected);

  return (
    <WsContext.Provider value={{ ws, isConnected }}>
      {children}
    </WsContext.Provider>
  );
}
