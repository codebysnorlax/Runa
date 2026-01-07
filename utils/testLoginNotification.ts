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
  sendLoginNotification(mockUser)
    .then(result => {
      // Test completed
    })
    .catch(error => {
      // Test failed
    });
};

// Make it available globally for console testing
if (typeof window !== 'undefined') {
  (window as any).testLoginNotification = testLoginNotification;
}
