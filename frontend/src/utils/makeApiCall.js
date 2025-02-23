import axios from "axios";
import { useAuthStore } from "../store/auth";
import config from "../config";

const api = axios.create({
  baseURL: config.GatewayApiUrl,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    console.log(payload)
    const expiryTime = payload.exp * 1000; 
    return Date.now() >= expiryTime; 
  } catch (error) {
    console.error("Error decoding token:", error);
    return true; 
  }
};

const handleLogout = () => {
  const authStore = useAuthStore();
  authStore.logout();
};

api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    const accessToken = authStore.getIdToken;

    if (accessToken) {
      if (isTokenExpired(accessToken)) {
        console.warn("Token expired, logging out user...");
        handleLogout();
        return Promise.reject("Session expired. Please log in again.");
      }
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let errorMessage = "An error occurred. Please try again later.";

    if (error.response) {
      switch (error.response.status) {
        case 401:
          errorMessage = "Unauthorized. Please log in again.";
          handleLogout();
          break;
        case 403:
          errorMessage = "Forbidden. You do not have access to this resource.";
          break;
        case 404:
          errorMessage = "Resource not found.";
          break;
        case 500:
          errorMessage = "Internal server error.";
          break;
        default:
          errorMessage = error.response.data?.message || errorMessage;
      }
    } else if (error.request) {
      errorMessage = "No response from the server. Please check your network.";
    }

    console.error(errorMessage);
    return Promise.reject(errorMessage);
  }
);

// API Helper Functions
const apiGet = (url, params = {}) => api.get(url, { params });
const apiPost = (url, data = {}) => api.post(url, data);
const apiPatch = (url, data = {}) => api.patch(url, data);
const apiPut = (url, data = {}) => api.put(url, data);
const apiDelete = (url) => api.delete(url);

export { apiGet, apiPut, apiPost, apiDelete, apiPatch };
