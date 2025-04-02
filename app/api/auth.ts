import API from "@/utils/axiosInstance";
import { useAuthStore } from "../store/authStore";

export const registerUser = async (
  name: string,
  email: string,
  password: string,
  role: string
) => {
  const res = await API.post("/register", { name, email, password, role });
  return res.data;
};

export const loginUser = async (email: string, password: string) => {
  const res = await API.post("/login", { email, password });
  useAuthStore.getState().login(res.data.token, res.data.role); // Update Zustand store
  return res.data;
};

export const logoutUser = () => {
  useAuthStore.getState().logout(); // Logout using Zustand
  window.location.href = "/auth/login"; // Redirect to login page
};
