import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { API_URL } from "@/lib/config";

console.log("API base URL:", API_URL);

const API = axios.create({
  baseURL: API_URL, // Base URL for the API
  headers: {
    "Content-Type": "application/json",
    // Add ngrok bypass headers
    "ngrok-skip-browser-warning": "true",
    "Access-Control-Allow-Origin": "*",
  },
  timeout: 10000, // 10 second timeout
});

// Attach JWT token to requests
API.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    let token: string | null = null;

    // Check if we're in a browser environment
    if (typeof window !== "undefined") {
      token = localStorage.getItem("authToken"); // Get token from storage
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(
      `API Request: ${config.method?.toUpperCase()} ${config.baseURL}${
        config.url
      }`
    );
    return config;
  },
  (error: AxiosError) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
API.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`API Response: ${response.status} from ${response.config.url}`);
    return response;
  },
  (error: AxiosError) => {
    console.error("API Response Error:", error.message);
    if (error.response) {
      console.error("Error status:", error.response.status);
      console.error("Error data:", error.response.data);

      // Handle specific error types
      switch (error.response.status) {
        case 404:
          console.error(`Resource not found: ${error.config?.url}`);
          console.error("Request method:", error.config?.method);
          console.error("Request data:", error.config?.data);
          break;
        case 401:
          console.error("Authentication failed - please login again");
          // Optionally redirect to login page or clear auth token
          if (typeof window !== "undefined") {
            localStorage.removeItem("authToken");
          }
          break;
        case 403:
          console.error("Access forbidden - insufficient permissions");
          break;
        case 500:
          if (
            typeof error.response.data === "string" &&
            error.response.data.includes("Foreign key constraint violated")
          ) {
            console.error("Database constraint error:", error.response.data);
            console.error("Request:", error.config?.method, error.config?.url);
            console.error("Request data:", error.config?.data);
          }
          break;
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received:", error.request);
    } else {
      // Something happened in setting up the request
      console.error("Request setup error:", error);
    }

    // You can implement custom retry logic for certain errors here
    // For example, retry on network errors or 5xx server errors

    return Promise.reject(error);
  }
);

export default API;
