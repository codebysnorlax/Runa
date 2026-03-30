import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

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
  const sentWelcomeEmails = useRef(new Set<string>());

  // Convex mutation for initializing default profile (only creates if new)
  const initProfile = useMutation(api.profile.initIfNew);

  useEffect(() => {
    if (isLoaded && user) {
      const username = user.id;
      const firstName = user.firstName || user.username || "User";
      const userEmail = user.primaryEmailAddress?.emailAddress || undefined;
      setCurrentUser(firstName);
      const welcomeEmailSentKey = `${user.id}-welcome-email-sent`;
      const hasReceivedWelcome = localStorage.getItem(welcomeEmailSentKey);

      // Initialize default profile in Convex if this is a new user
      initProfile({
        userId: username,
        userEmail,
        name: firstName,
      }).catch(() => {
        // Silently handle — profile likely already exists
      });
      
      if (!hasReceivedWelcome && user.primaryEmailAddress?.emailAddress && !sentWelcomeEmails.current.has(user.id)) {
        sentWelcomeEmails.current.add(user.id);
        localStorage.setItem(welcomeEmailSentKey, "true");
        import("@/services/emailService").then(({ sendWelcomeEmail }) => {
          sendWelcomeEmail(user.primaryEmailAddress!.emailAddress, firstName)
            .then(ok => {
              if (!ok) {
                localStorage.removeItem(welcomeEmailSentKey);
                sentWelcomeEmails.current.delete(user.id);
                console.error("Welcome email failed to send");
              }
            });
        }).catch(err => {
          console.error("Failed to import emailService", err);
          sentWelcomeEmails.current.delete(user.id);
          localStorage.removeItem(welcomeEmailSentKey);
        });
      }

      setLoading(false);
    } else if (isLoaded) {
      setLoading(false);
    }
  }, [user, isLoaded, initProfile]);

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

// It's a common pattern to export the consumer hook alongside the provider.
// eslint-disable-next-line react-refresh/only-export-components
export const useAppCore = () => {
  const context = useContext(AppCoreContext);
  if (context === undefined) {
    throw new Error("useAppCore must be used within an AppCoreProvider");
  }
  return context;
};
