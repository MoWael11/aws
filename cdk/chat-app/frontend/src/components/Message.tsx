import type { ChatMessage } from "../types/chat";

interface Props {
  message: ChatMessage;
  email: string;
}

export default function Message({ message, email }: Props) {
  const isMe = email === message.email;
  const name = isMe ? "You" : message.email && message.email.split("@")[0];
  return (
    <div className={`message ${isMe ? "me" : "other"}`}>
      <strong>{name}</strong>: {message.text}
    </div>
  );
}