export const BASE_URL = import.meta.env.VITE_N8N_URL?.replace(/\/$/, "") ?? "https://YOUR_N8N_URL/webhook";
export const START_URL = `${BASE_URL}/moot/start`;
export const UTTERANCE_URL = `${BASE_URL}/moot/utterance`;
export const EVALUATE_URL = `${BASE_URL}/moot/evaluate`;