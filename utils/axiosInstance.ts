import axios from "axios";

// Determine the base URL based on environment
const baseURL = "https://0dd7-2401-4900-1cd7-672e-f883-6669-8e54-fbef.ngrok-free.app/api/";

console.log("API base URL:", baseURL);

const API = axios.create({
  baseURL, // Base URL for the API
  headers: { 
    "Content-Type": "application/json",
    // Add ngrok bypass headers
    "ngrok-skip-browser-warning": "true",
    "Bypass-Tunnel-Reminder": "true" 
  },
  timeout: 10000, // 10 second timeout
});

// Attach JWT token to requests
API.interceptors.request.use(
  (config) => {
    let token;

    // Check if we're in a browser environment
    if (typeof window !== "undefined") {
      token = localStorage.getItem("authToken"); // Get token from storage
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Set Authorization header
    }

    console.log(
      `API Request: ${config.method?.toUpperCase()} ${config.baseURL}${
        config.url
      }`
    );
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
API.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} from ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error("API Response Error:", error.message);
    if (error.response) {
      console.error("Error status:", error.response.status);
      console.error("Error data:", error.response.data);

      // Add more detailed logging for specific error types
      if (error.response.status === 404) {
        console.error(`Resource not found: ${error.config.url}`);
        console.error("Request method:", error.config.method);
        console.error("Request data:", error.config.data);
        console.error("Full config:", error.config);
      }
      // Handle specific database constraint errors
      else if (
        error.response.status === 500 &&
        typeof error.response.data === "string" &&
        error.response.data.includes("Foreign key constraint violated")
      ) {
        console.error("Database constraint error:", error.response.data);
        console.error("Request:", error.config.method, error.config.url);
        console.error("Request data:", error.config.data);
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
