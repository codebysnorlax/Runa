import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { sendLoginNotification } from '@/services/loginNotificationService';

const NOTIFIED_USERS_KEY = 'runa_notified_users';

export const useLoginNotification = () => {
  const { user, isSignedIn } = useUser();

  useEffect(() => {
    if (isSignedIn && user) {
      const notifiedUsers = JSON.parse(localStorage.getItem(NOTIFIED_USERS_KEY) || '[]');
      
      // Check if this user has already been notified
      if (!notifiedUsers.includes(user.id)) {
        const minimalUser = {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.primaryEmailAddress?.emailAddress,
        };

        sendLoginNotification(minimalUser)
          .then((result) => {
            if (result?.success) {
              notifiedUsers.push(user.id);
              localStorage.setItem(NOTIFIED_USERS_KEY, JSON.stringify(notifiedUsers));
            }
          })
          .catch((error) => {
            console.error('Failed to send login notification:', error);
          });
      }
    }
  }, [isSignedIn, user]);
};
