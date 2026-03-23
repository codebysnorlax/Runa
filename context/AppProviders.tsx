import React, { ReactNode } from 'react';
import { AppCoreProvider } from '@/context/AppCoreContext';
import { ProfileProvider } from '@/context/ProfileContext';
import { RunsProvider } from '@/context/RunsContext';
import { GoalsProvider } from '@/context/GoalsContext';
import { InsightsProvider } from '@/context/InsightsContext';

export const AppProviders: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <AppCoreProvider>
      <ProfileProvider>
        <RunsProvider>
          <GoalsProvider>
            <InsightsProvider>
              {children}
            </InsightsProvider>
          </GoalsProvider>
        </RunsProvider>
      </ProfileProvider>
    </AppCoreProvider>
  );
};
