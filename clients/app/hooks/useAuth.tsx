import React, { createContext, useContext, useEffect, useState } from "react";
import setAuthToken from "@/services/api";
import { firebaseAuth } from "@/services/firebase";
import api, { setCurrentUser } from "@/services/api";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  points: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null); // Updated type
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = firebaseAuth.onAuthStateChanged(
      async (firebaseUser) => {
        if (firebaseUser) {
          // User is logged in
          const userData = {
            _id: firebaseUser.uid,
            name: firebaseUser.displayName || "User",
            email: firebaseUser.email,
            role: "citizen",
            points: 250, // Default points, would come from backend in real app
          };

          // SYNC WITH BACKEND: Get user details from MongoDB if available
          try {
            const backendUser = await api.user.getProfile();
            if (backendUser) {
              userData.role = backendUser.role || "citizen";
              userData.points = backendUser.points || 0;
              userData.name = backendUser.name || userData.name;
            }
          } catch (error) {
            console.log(
              "Could not fetch user profile from backend, using Firebase data"
            );
          }

          setUser(userData);
          setCurrentUser(userData); // Synchronize with api.ts
          setIsAuthenticated(true);
        } else {
          // User is logged out
          setUser(null);
          setCurrentUser(null); // Clear currentUser in api.ts
          setIsAuthenticated(false);
        }
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    setCurrentUser(userData); // Synchronize with api.ts
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await firebaseAuth.signOut();
      setUser(null);
      setCurrentUser(null); // Clear currentUser in api.ts
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
