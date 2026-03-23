import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useUser } from "@clerk/clerk-react";
import * as storage from "@/services/storageService";

interface AppCoreContextType {
  loading: boolean;
  currentUser: string | null;
  refreshData: () => void;
}

const AppCoreContext = createContext<AppCoreContextType | undefined>(undefined);

export const AppCoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && user) {
      const username = user.id;
      const firstName = user.firstName || user.username || "User";
      setCurrentUser(firstName);
      storage.initializeDefaults(username, Object.keys(user).length ? firstName : undefined);
      setLoading(false);
    } else if (isLoaded) {
      setLoading(false);
    }
  }, [user, isLoaded]);

  const refreshData = () => {
    if (user) {
      const firstName = user.firstName || user.username || undefined;
      storage.initializeDefaults(user.id, firstName);
      window.dispatchEvent(new Event("appDataRefresh"));
    }
  };

  return (
    <AppCoreContext.Provider value={{ loading, currentUser, refreshData }}>
      {children}
    </AppCoreContext.Provider>
  );
};

export const useAppCore = () => {
  const context = useContext(AppCoreContext);
  if (context === undefined) {
    throw new Error("useAppCore must be used within an AppCoreProvider");
  }
  return context;
};
