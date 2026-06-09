export const APP_CONFIG = {
  SERVER_URL: import.meta.env.VITE_SERVER_URL,
  API_URL: import.meta.env.VITE_API_URL ?? '/api/v5',

  BULK: import.meta.env.VITE_DEFAULT_BULK,
  KANT: import.meta.env.VITE_DEFAULT_KANT,
  PUB_REFRESH:
    Number(import.meta.env.VITE_PUBDATA_REFRESH_INTERVAL) * 1000 || 35 * 1000, // milseconds
  BALANCE_REFRESH:
    Number(import.meta.env.VITE_BALANCE_REFRESH_INTERVAL) * 1000 || 20 * 1000, // milseconds
  PHONE: import.meta.env.VITE_DEFAULT_PHONE,
  CURID: import.meta.env.VITE_DEFAULT_CURID,
  CHID: import.meta.env.VITE_DEFAULT_CHID, // currency char ID, e.g. "USD"
};
