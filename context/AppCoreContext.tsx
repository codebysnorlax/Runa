import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useUser } from "@clerk/clerk-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

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

  // Convex mutation for initializing default profile (only creates if new)
  const initProfile = useMutation(api.profile.initIfNew);

  useEffect(() => {
    if (isLoaded && user) {
      const username = user.id;
      const firstName = user.firstName || user.username || "User";
      setCurrentUser(firstName);
      const welcomeEmailSentKey = `${user.id}-welcome-email-sent`;
      const hasReceivedWelcome = localStorage.getItem(welcomeEmailSentKey);

      // Initialize default profile in Convex if this is a new user
      initProfile({
        userId: username,
        name: firstName,
      }).catch(() => {
        // Silently handle — profile likely already exists
      });
      
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
    // With Convex, data is reactive — no manual refresh needed
    // Keeping this method for backward compatibility but it's a no-op now
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
