import { create } from "zustand";

interface AuthState {
  token: string | null;
  role: string | null;
  userName: string | null;
  login: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: typeof window !== "undefined" ? localStorage.getItem("authToken") : null,
  role: typeof window !== "undefined" ? localStorage.getItem("userRole") : null,
  userName: typeof window !== "undefined" ? localStorage.getItem("userName") : null,

  login: (token) => {
    if (typeof window !== "undefined") {
      try {
        const decoded = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload

        localStorage.setItem("authToken", token);
        localStorage.setItem("userRole", decoded.role);
        localStorage.setItem("userName", decoded.name);

        set({ token, role: decoded.role, userName: decoded.name });
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userName");
    }

    set({ token: null, role: null, userName: null });

    // 🔥 Redirect user to login page after logout
    window.location.href = "/auth/login";
  },
}));
