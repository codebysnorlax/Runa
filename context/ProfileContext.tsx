import React, { createContext, useContext, ReactNode } from "react";
import { useUser } from "@clerk/clerk-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Profile } from "@/types";

interface ProfileContextType {
  profile: Profile | null;
  updateProfile: (newProfile: Profile) => void;
  isLoading: boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isLoaded } = useUser();
  const userId = isLoaded && user ? user.id : undefined;

  const convexProfile = useQuery(
    api.profile.getByUser,
    userId ? { userId } : "skip"
  );

  const upsertMutation = useMutation(api.profile.upsert);

  // Map Convex document to the existing Profile shape
  const profile: Profile | null = convexProfile
    ? {
        name: convexProfile.name,
        height_cm: convexProfile.height_cm,
        weight_kg: convexProfile.weight_kg,
        age: convexProfile.age,
      }
    : null;

  const isLoading = convexProfile === undefined;

  const updateProfile = (newProfile: Profile) => {
    if (!userId) return;
    upsertMutation({
      userId,
      name: newProfile.name,
      height_cm: newProfile.height_cm,
      weight_kg: newProfile.weight_kg,
      age: newProfile.age,
    });
  };

  return (
    <ProfileContext.Provider value={{ profile, updateProfile, isLoading }}>
      {children}
    </ProfileContext.Provider>
  );
};

// It's a common pattern to export the consumer hook alongside the provider.
// eslint-disable-next-line react-refresh/only-export-components
export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};
