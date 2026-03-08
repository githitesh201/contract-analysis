import axios from "axios";

export const getApiBaseUrl = () => {
  const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (configuredApiUrl && configuredApiUrl.trim().length > 0) {
    return configuredApiUrl.replace(/\/+$/, "");
  }

  if (typeof window !== "undefined") {
    if (process.env.NODE_ENV === "production") {
      throw new Error("NEXT_PUBLIC_API_URL is required in production.");
    }
    return `${window.location.protocol}//${window.location.hostname}:8080`;
  }

  return "http://localhost:8080";
};

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
});

export const logout = async () => {
  const response = await api.get("/auth/logout");
  return response.data;
};
