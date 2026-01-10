import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { sendLoginNotification } from '../services/loginNotificationService';

const NOTIFIED_USERS_KEY = 'runa_notified_users';

export const useLoginNotification = () => {
  const { user, isSignedIn } = useUser();

  useEffect(() => {
    if (isSignedIn && user) {
      const notifiedUsers = JSON.parse(localStorage.getItem(NOTIFIED_USERS_KEY) || '[]');
      
      // Check if this user has already been notified
      if (!notifiedUsers.includes(user.id)) {
        sendLoginNotification(user).then((result) => {
          if (result.success) {
            notifiedUsers.push(user.id);
            localStorage.setItem(NOTIFIED_USERS_KEY, JSON.stringify(notifiedUsers));
          }
        });
      }
    }
  }, [isSignedIn, user]);
};
