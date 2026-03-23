import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useUser } from "@clerk/clerk-react";
import { Profile } from "@/types";
import * as storage from "@/services/storageService";

interface ProfileContextType {
  profile: Profile | null;
  updateProfile: (newProfile: Profile) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isLoaded } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const loadProfile = () => {
      if (isLoaded && user) {
        setProfile(storage.getProfile(user.id));
      }
    };
    loadProfile();
    window.addEventListener("appDataRefresh", loadProfile);
    return () => window.removeEventListener("appDataRefresh", loadProfile);
  }, [user, isLoaded]);

  const updateProfile = (newProfile: Profile) => {
    if (!user) return;
    setProfile(newProfile);
    storage.saveProfile(newProfile, user.id);
  };

  return (
    <ProfileContext.Provider value={{ profile, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};
