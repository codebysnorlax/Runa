const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;

// Rate limiting - 2 minutes
const RATE_LIMIT_MS = 2 * 60 * 1000; // 2 minutes
const STORAGE_KEY = 'runa_feedback_last_sent';

// Get last sent timestamp from localStorage
const getLastSentTime = (): number => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? parseInt(stored, 10) : 0;
  } catch {
    return 0;
  }
};

// Save last sent timestamp to localStorage
const setLastSentTime = (timestamp: number): void => {
  try {
    localStorage.setItem(STORAGE_KEY, timestamp.toString());
  } catch (error) {
    console.error('Failed to save cooldown time:', error);
  }
};

// Get remaining cooldown time in seconds
export const getRemainingCooldown = (): number => {
  const now = Date.now();
  const lastSent = getLastSentTime();
  
  if (lastSent === 0) return 0;
  
  const elapsed = now - lastSent;
  const remaining = RATE_LIMIT_MS - elapsed;
  
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
};

// Check if user can send feedback
export const canSendFeedback = (): boolean => {
  return getRemainingCooldown() === 0;
};

export const sendFeedbackToTelegram = async (questions: any[], responses: any[], user: any) => {
  try {
    // Check rate limit
    const remainingCooldown = getRemainingCooldown();
    if (remainingCooldown > 0) {
      throw new Error(`Please wait ${remainingCooldown} seconds before sending another feedback`);
    }

    console.log('Starting Telegram send...', { responses, user });
    
    const currentTime = new Date();
    const rating = responses.find(r => r.questionId === 1)?.answer || 'Not provided';
    const features = responses.find(r => r.questionId === 2)?.answer || [];
    const ease = responses.find(r => r.questionId === 3)?.answer || 'Not provided';
    const improvements = responses.find(r => r.questionId === 4)?.answer || [];
    const comments = responses.find(r => r.questionId === 5)?.answer || 'No additional comments';

    // Get IP address
    let ipAddress = 'Unknown';
    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      ipAddress = ipData.ip;
    } catch (error) {
      console.log('Could not fetch IP');
    }

    // Get device info
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    const language = navigator.language;
    const screenRes = `${window.screen.width}x${window.screen.height}`;

    let os = 'Unknown';
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iPhone')) os = 'iOS';

    let browser = 'Unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    const feedbackBlock = `🌟 Overall Experience: ${rating}
⚡ Most Used Features: ${Array.isArray(features) && features.length > 0 ? features.join(', ') : 'None selected'}
🎯 Navigation Ease: ${ease}
🚀 Desired Improvements: ${Array.isArray(improvements) && improvements.length > 0 ? improvements.join(', ') : 'None selected'}`;

    const message = `🏃‍♂️ 💬 NEW RUNA FEEDBACK FROM: ${user.firstName || 'Anonymous'}

👤 USER INFORMATION
• Name: ${user.firstName || 'Anonymous'} ${user.lastName || ''}
• Email: ${user.primaryEmailAddress?.emailAddress || 'Not provided'}
• User ID: ${user.id}

📅 DATE & TIME
• Date: ${currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
• Time: ${currentTime.toLocaleTimeString('en-US', { hour12: true, timeZone: 'Asia/Calcutta' })} GMT+5:30
• Timezone: Asia/Calcutta

🌍 LOCATION & NETWORK
• IP Address: ${ipAddress}
• Country: India
• Language: ${language}

💻 DEVICE INFORMATION
• OS: ${os}
• Browser: ${browser}
• Platform: ${platform}
• Screen: ${screenRes}

📊 RUNA FEEDBACK RESPONSES
\`\`\`
${feedbackBlock}
\`\`\`

💬 MESSAGE CONTENT
${comments && comments.trim() !== '' ? comments : 'No additional comments provided'}

⏰ Received at: ${currentTime.toISOString()}`;

    console.log('Sending message to Telegram...');

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message
      })
    });

    const result = await response.json();
    console.log('Telegram response:', result);

    if (!response.ok) {
      throw new Error(result.description || `HTTP ${response.status}: Failed to send message`);
    }

    // Save timestamp ONLY on successful send
    setLastSentTime(Date.now());
    
    return { success: true, message: 'Feedback sent successfully!' };

  } catch (error) {
    console.error('Failed to send to Telegram:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to send feedback. Please try again.' 
    };
  }
};
