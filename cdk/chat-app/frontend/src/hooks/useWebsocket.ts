import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "../types/chat";
import { config } from "../config";

interface UseWebSocketProps {
  tokenId: string;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  email: string;
}

export function useWebSocket({ tokenId, setMessages, email }: UseWebSocketProps) {
  const socket = useRef<WebSocket | null>(null);

  const [connected, setConnected] = useState(false);

  const endpoint = config.WS_ENDPOINT;

  useEffect(() => {
    connect();
  }, []);

  const connect = () => {
    if (socket.current?.readyState === WebSocket.OPEN) return;



    socket.current = new WebSocket(`${endpoint}?Auth=${tokenId}`);

    socket.current.onopen = () => {
      setConnected(true);
    };

    socket.current.onclose = () => {
      setConnected(false);
    };

    socket.current.onerror = () => {
      setConnected(false);
    };

    socket.current.onmessage = (event) => {
      try {
        const message: ChatMessage = JSON.parse(event.data);
        setMessages((prev) => [
          ...prev,
          message,
        ]);
      } catch (err) {
        console.error("Invalid websocket message:", event.data);
      }
    };
  };

  const send = (text: string) => {
    if (!socket.current || socket.current.readyState !== WebSocket.OPEN)
      return;

    socket.current.send(
      JSON.stringify({
        action: "sendMessage",
        message: text,
      })
    );

    setMessages((prev) => [
      ...prev,
      {
        text: text,
        email: email,
      },
    ]);
  };

  return {
    connected,
    connect,
    send,
  };
}