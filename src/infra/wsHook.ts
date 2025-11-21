// useSocket.ts
import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

export function useSocket(url: string) {
  const socketRef = useRef<Socket | null>(null);

  // Connect + authenticate
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = io("localhost:3100", {
      transports: ["websocket"],
      auth: {
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJwZXBpdG9AY29ycmVvLmNvbSIsImlhdCI6MTc2MzY5NjEwOCwiZXhwIjoxNzYzNzM5MzA4fQ.M9KprLfDr4sXAOSdCIVlNiIMTG_A-urp-c4rDJzBMfY",
      },
    });

    socketRef.current = socket;

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
    });

    return () => {
      socket.disconnect();
    };
  }, [url]);

  // Register event listener
  const on = useCallback((event: string, handler: (data: any) => void) => {
    const socket = socketRef.current;
    if (!socket) return;

    socket.on(event, handler);

    return () => {
      socket.off(event, handler); // cleanup
    };
  }, []);

  // Emit event
  const emit = useCallback((event: string, payload?: any) => {
    const socket = socketRef.current;
    if (!socket) return;

    socket.emit(event, payload);
  }, []);

  return { socket: socketRef.current, on, emit };
}

