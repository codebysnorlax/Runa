import emailjs from '@emailjs/browser';

export const sendFeedbackConfirmation = async (userEmail: string, userName: string): Promise<boolean> => {
  try {
    const templateParams = {
      to_email: userEmail,
      to_name: userName || 'User',
    };

    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID || '',
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '',
      templateParams,
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY || ''
    );

    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
};
