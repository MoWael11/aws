import { useEffect, useState } from "react";
import Message from "./Message";
import { useWebSocket } from "../hooks/useWebsocket";
import { useAuth } from "react-oidc-context";
import Header from "./Header";
import type { ChatMessage } from "../types/chat";
import { config } from "../config";

export default function Chat() {
  const auth = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const { send, connected } =
    useWebSocket({ tokenId: auth.user!.id_token!, setMessages, email: auth.user!.profile.email! });

  const [text, setText] = useState("");

  const signOutRedirect = async () => {
    const clientId = config.CONGITO_CLIENT_ID;
    const logoutUri = config.APP_URL;
    const cognitoDomain = config.CONGITO_DOMAIN;

    auth.removeUser();
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  const handleGetMessages = async () => {
    try {
      const response = await fetch(config.REST_ENDPOINT + "/messages", {
        headers: {
          Authorization: `Bearer ${auth.user!.id_token}`,
        },
      });

      const data = await response.json();
      
      setMessages(data.messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSend = () => {
    if (!text.trim()) return;

    send(text);

    setText("");
  };

  useEffect(() => {
    handleGetMessages();
  }, []);

  return (
    <div className="chat">
      <Header
        user={auth.user!}
        connected={connected}
        onLogout={() => signOutRedirect()}
      />
      <div className="messages">
        {messages.map((m, i) => (
          <Message key={i} message={m} email={auth.user!.profile.email!} />
        ))}
      </div>

      <div className="controls">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type your message..."
        />

        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}