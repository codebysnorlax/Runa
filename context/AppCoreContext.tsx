import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useUser } from "@clerk/clerk-react";
import * as storage from "@/services/storageService";

interface AppCoreContextType {
  loading: boolean;
  currentUser: string | null;
  refreshData: () => void;
}

const AppCoreContext = createContext<AppCoreContextType | undefined>(undefined);

const sentWelcomeEmails = new Set<string>();

export const AppCoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && user) {
      const username = user.id;
      const firstName = user.firstName || user.username || "User";
      setCurrentUser(firstName);
      const welcomeEmailSentKey = `${user.id}-welcome-email-sent`;
      const hasReceivedWelcome = localStorage.getItem(welcomeEmailSentKey);

      storage.initializeDefaults(username, Object.keys(user).length ? firstName : undefined);
      
      if (!hasReceivedWelcome && user.primaryEmailAddress?.emailAddress && !sentWelcomeEmails.has(user.id)) {
        sentWelcomeEmails.add(user.id);
        localStorage.setItem(welcomeEmailSentKey, "true");
        import("@/services/emailService").then(({ sendWelcomeEmail }) => {
          sendWelcomeEmail(user.primaryEmailAddress!.emailAddress, firstName)
            .then(ok => {
              if (!ok) {
                localStorage.removeItem(welcomeEmailSentKey);
                sentWelcomeEmails.delete(user.id);
                console.error("Welcome email failed to send");
              }
            });
        }).catch(err => {
          console.error("Failed to import emailService", err);
          sentWelcomeEmails.delete(user.id);
          localStorage.removeItem(welcomeEmailSentKey);
        });
      }

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
