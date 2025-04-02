import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000/api/auth", // Base URL for the API
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken"); // Get token from storage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // Set Authorization header
  }
  return config;
});

export default API;
