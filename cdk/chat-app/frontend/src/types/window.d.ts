export {}

declare global {
  interface Window {
    APP_CONFIG: {
      APP_URL: string
      REST_ENDPOINT: string
      WS_ENDPOINT: string
      CONGITO_AUTHORITY: string
      CONGITO_CLIENT_ID: string
      CONGITO_DOMAIN: string
    }
  }
}