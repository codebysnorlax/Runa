
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ClerkProvider } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';
import 'lucide-react';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY} 
      afterSignOutUrl="/#/login"
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#ff6300',
          colorBackground: '#1f2937',
          colorInputBackground: '#374151',
          colorInputText: '#ffffff',
          colorText: '#ffffff',
          colorTextSecondary: '#d1d5db',
          colorDanger: '#ef4444',
          borderRadius: '0.75rem',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        },
        elements: {
          rootBox: 'bg-gray-900 rounded-full',
          card: 'bg-gray-800 border border-gray-700',
          headerTitle: 'text-white text-2xl',
          headerSubtitle: 'text-gray-300',
          socialButtonsBlockButton: 'bg-gray-700 border border-gray-600 text-white hover:bg-gray-600',
          socialButtonsBlockButtonText: 'text-white font-medium',
          formButtonPrimary: 'bg-[#ff6300] hover:bg-orange-600 text-white font-semibold',
          footerActionLink: 'text-[#ff6300] hover:text-orange-500',
          formFieldLabel: 'text-gray-200',
          formFieldInput: 'bg-gray-700 border border-gray-600 text-white placeholder:text-gray-400',
          formFieldInputShowPasswordButton: 'text-gray-300',
          identityPreviewText: 'text-white',
          identityPreviewEditButton: 'text-[#ff6300]',
          dividerLine: 'bg-gray-600',
          dividerText: 'text-gray-400',
          otpCodeFieldInput: 'bg-gray-700 border border-gray-600 text-white',
          formResendCodeLink: 'text-[#ff6300]',
          alertText: 'text-white',
          formFieldErrorText: 'text-red-400',
          avatarBox: 'rounded-full',
          userButtonAvatarBox: 'rounded-full',
          userButtonBox: 'rounded-full',
          userButtonTrigger: 'rounded-full',
          userButtonOuterIdentifier: 'rounded-full',
          avatarImage: 'rounded-full',
          userButtonAvatarImage: 'rounded-full',
        }
      }}
    >
      <App />
    </ClerkProvider>
  </React.StrictMode>
);
