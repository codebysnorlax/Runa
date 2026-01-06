// Test utility for login notifications
// You can call this from browser console to test the notification

import { sendLoginNotification } from '../services/loginNotificationService';

// Mock user data for testing
const mockUser = {
  id: 'user_test123',
  firstName: 'Test',
  lastName: 'User',
  primaryEmailAddress: {
    emailAddress: 'test@example.com'
  }
};

export const testLoginNotification = () => {
  console.log('Testing login notification...');
  sendLoginNotification(mockUser)
    .then(result => {
      console.log('Test notification result:', result);
    })
    .catch(error => {
      console.error('Test notification failed:', error);
    });
};

// Make it available globally for console testing
if (typeof window !== 'undefined') {
  (window as any).testLoginNotification = testLoginNotification;
}
