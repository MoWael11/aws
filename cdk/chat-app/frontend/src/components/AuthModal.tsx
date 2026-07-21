import { useAuth } from "react-oidc-context";

export default function AuthModal() {
  const auth = useAuth();

  return (
    <div style={{ accentColor: "#4CAF50", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <h2 style={{ color: "#333", marginBottom: "1rem" }}>Login to Abo7med Chat</h2>
      <p style={{ color: "#666", marginBottom: "2rem" }}>Sign in with your account to join the secure chat room.</p>
      <button style={{ backgroundColor: "#4CAF50", color: "white", border: "none", padding: "0.5rem 1rem", borderRadius: "0.25rem", cursor: "pointer" }} onClick={() => auth.signinRedirect({
        state: { returnTo: window.location.pathname }
      })}>Login</button>
    </div>
  );
}
