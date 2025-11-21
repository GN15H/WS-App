// useSocket.ts
import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";


export function useSocket(
  url: string,
  onConnectionChange: (connected: boolean) => void
) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = io(url, {
      transports: ["websocket"],
      auth: { token },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Cliente 2 conectado:", socket.id);
      // socket.emit("users.actives.subscribe");
      onConnectionChange(true);   // <--- AVISAMOS AL PROVIDER
    });

    // socket.on("users.updated", (users) => {
    //   console.log("usuarios online:");
    //   console.log(users);
    //   console.table(users);
    // });
    socket.on("disconnect", () => {
      console.log("Cliente desconectado");
      onConnectionChange(false);  // <--- AVISAMOS AL PROVIDER
    });

    return () => socket.disconnect();
  }, [url, onConnectionChange]);

  const on = useCallback((event: string, handler: (data: any) => void) => {
    const socket = socketRef.current;
    if (!socket) return;
    socket.on(event, handler);
    return () => socket.off(event, handler);
  }, []);

  const emit = useCallback((event: string, payload?: any) => {
    socketRef.current?.emit(event, payload);
  }, []);

  return { socket: socketRef.current, on, emit };
}


