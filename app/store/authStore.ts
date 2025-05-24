import { create } from "zustand";

interface AuthState {
  token: string | null;
  role: string | null;
  userName: string | null;
  login: (token: string, name: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token:
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null,
  role: typeof window !== "undefined" ? localStorage.getItem("userRole") : null,
  userName:
    typeof window !== "undefined" ? localStorage.getItem("userName") : null,

  login: (token, name) => {
    if (typeof window !== "undefined") {
      try {
        const decoded = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
        console.log("Login attempt with name:", name);
        console.log("Decoded token:", decoded);

        localStorage.setItem("authToken", token);
        localStorage.setItem("userRole", decoded.role);
        localStorage.setItem("userName", name);

        console.log("Stored userName in localStorage:", localStorage.getItem("userName"));
        
        set({ token, role: decoded.role, userName: name });
        console.log("Updated auth store state:", { token, role: decoded.role, userName: name });
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  },

  logout: () => {
    if (typeof window !== "undefined") {
      console.log("Logging out. Current userName:", localStorage.getItem("userName"));
      localStorage.removeItem("authToken");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userName");
    }

    set({ token: null, role: null, userName: null });
    console.log("Auth store cleared");

    // 🔥 Redirect user to login page after logout
    window.location.href = "/auth/login";
  },
}));
