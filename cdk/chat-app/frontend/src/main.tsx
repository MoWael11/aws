import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from 'react-oidc-context'
import App from './App.tsx'
import './index.css'
import { config } from './config.ts'

const cognitoAuthConfig = {
  authority: config.CONGITO_AUTHORITY,
  client_id: config.CONGITO_CLIENT_ID,
  redirect_uri: config.APP_URL,
  response_type: "code",
  scope: "openid profile email",

  onSigninCallback: () => {
    window.history.replaceState(
      {},
      document.title,
      window.location.pathname
    );
  },
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider
      {...cognitoAuthConfig}
    >
      <App />
    </AuthProvider>
  </StrictMode>,
)
