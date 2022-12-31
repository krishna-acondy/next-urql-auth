const TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refresh_token";

export interface AuthState {
  token: string;
  refreshToken: string;
}

export const saveAuthState = ({ token, refreshToken }: AuthState) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const getToken = () => {
  if (typeof window === "undefined") return;
  return localStorage.getItem(TOKEN_KEY);
};

export const getRefreshToken = () => {
  if (typeof window === "undefined") return;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const clearAuthState = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};
