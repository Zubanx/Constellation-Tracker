import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  LoginCredentials,
  RegisterCredentials,
  AuthContextType,
} from "../types";

interface AuthProviderProps {
  children: ReactNode;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Check for existing session on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async (): Promise<void> => {
    try {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));

        // Optionally validate token with backend
        // await validateToken(storedToken);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      // Clear invalid session
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setIsLoading(true);
      const url = "http://localhost:3000";
      const response = await fetch(`${url}/api/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      // Check if login failed
      if (response.status !== 200 || data.status === "failed") {
        throw new Error(
          data.message || "Invalid username or password. Please try again."
        );
      }

      // Backend returns: { status: 'success', token, data: { user } }
      const token: string = data.token;
      const backendUser = data.data.user;

      // Transform backend user to match our User interface
      const user: User = {
        id: backendUser._id || backendUser.id,
        email: backendUser.email,
        firstName: backendUser.firstName,
        lastName: backendUser.lastName,
        createdAt: backendUser.createdAt || new Date().toISOString(),
        updatedAt: backendUser.updatedAt,
      };

      // Store in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Update state
      setToken(token);
      setUser(user);

      // Navigate to dashboard
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      throw new Error(
        error.message || "Login failed. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials): Promise<void> => {
    try {
      setIsLoading(true);
      const url = "http://localhost:3000";
      const { firstName, lastName, email, password, passwordConfirm } =
        credentials;

      const response = await fetch(`${url}/api/user/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: firstName?.trim(),
          lastName: lastName?.trim(),
          email: email.toLowerCase().trim(),
          password,
          passwordConfirm,
        }),
      });

      const data = await response.json();

      // Check if registration failed
      if (response.status !== 201 || data.status === "failed") {
        throw new Error(
          data.message ||
            data.error?.message ||
            "Registration failed. Please try again."
        );
      }

      // ✅ SUCCESS - Don't navigate here, let Register component handle it
      // The Register component will navigate to /email-sent
      
      // Don't show alert anymore - Register component handles the redirect
      
    } catch (error: any) {
      console.error("Registration error:", error);
      throw new Error(
        error.message || "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Clear state
    setToken(null);
    setUser(null);

    // Navigate to login
    navigate("/login");
  };

  const refreshUser = async (): Promise<void> => {
    try {
      if (!token) {
        throw new Error("No token available");
      }

      // TODO: Replace with actual API call to refresh user data
      // You would need to create a /api/user/me endpoint or similar
      const url = "http://localhost:3000";
      const response = await fetch(`${url}/api/user/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to refresh user data");
      }

      const data = await response.json();
      const backendUser = data.data.user;

      const user: User = {
        id: backendUser._id || backendUser.id,
        email: backendUser.email,
        firstName: backendUser.firstName,
        lastName: backendUser.lastName,
        createdAt: backendUser.createdAt || new Date().toISOString(),
        updatedAt: backendUser.updatedAt,
      };

      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));
    } catch (error) {
      console.error("Error refreshing user:", error);
      // If refresh fails, logout
      logout();
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

//Custom hook to use auth context
/* eslint-disable react-refresh/only-export-components */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;