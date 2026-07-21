import { useAuth } from "react-oidc-context";
import "./App.css";

import Chat from "./components/Chat";
import AuthModal from "./components/AuthModal";

function App() {
  const auth = useAuth();
  
  if (auth.isLoading)
    return <div>Loading...</div>;

  if (auth.error)
    return <div>Error: {auth.error.message}</div>;

  if (!auth.isAuthenticated) {
    return <AuthModal />;
  }

  return (
    <Chat />
  );
}

export default App;