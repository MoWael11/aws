import { User } from "oidc-client-ts";

interface Props {
  user: User | undefined;
  connected: boolean;
  onLogout: () => void;
}

export default function Header({
  user,
  connected,
  onLogout,
}: Props) {
  return (
    <div className="header">
      <div className="profile">
        <h2>Abo7med Chat</h2>
        <small>{user?.profile.email}</small>
        <div className={`status-pill ${connected ? "" : "disconnected"}`}>
          {connected ? "Connected" : "Disconnected"}
        </div>
      </div>

      <button onClick={onLogout}>Logout</button>
    </div>
  );
}