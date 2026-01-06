import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { sendLoginNotification } from '../services/loginNotificationService';

const LAST_LOGIN_KEY = 'runa_last_login_notification';

export const useLoginNotification = () => {
  const { user, isSignedIn } = useUser();

  useEffect(() => {
    if (isSignedIn && user) {
      const lastLoginTime = localStorage.getItem(LAST_LOGIN_KEY);
      const currentTime = Date.now();
      
      // Check if this is a new login (more than 5 minutes since last notification)
      const shouldNotify = !lastLoginTime || (currentTime - parseInt(lastLoginTime)) > 5 * 60 * 1000;
      
      if (shouldNotify) {
        sendLoginNotification(user).then(() => {
          localStorage.setItem(LAST_LOGIN_KEY, currentTime.toString());
        });
      }
    }
  }, [isSignedIn, user]);
};
