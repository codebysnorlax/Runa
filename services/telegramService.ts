const TELEGRAM_BOT_TOKEN = '8274682428:AAEfuyx2Dz_zVnHThmjMh4X3gkOqSfgMYhg';
const TELEGRAM_CHAT_ID = '5442726683';

export const sendFeedbackToTelegram = async (questions: any[], responses: any[], user: any) => {
  try {
    const now = new Date();
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
    const screenRes = `${screen.width}x${screen.height}`;

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

    const message = `RUNA FEEDBACK FROM: ${user.firstName || 'Anonymous'}

          👤 USER INFORMATION
          • Name: ${user.firstName || 'Anonymous'} ${user.lastName || ''}
          • Email: ${user.primaryEmailAddress?.emailAddress || 'Not provided'}
          • User ID: ${user.id}

          📅 DATE & TIME
          • Date: ${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          • Time: ${now.toLocaleTimeString('en-US', { hour12: true, timeZone: 'Asia/Calcutta' })} GMT+5:30
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
          • Overall Experience: ${rating}
          • Most Used Features: ${Array.isArray(features) ? features.join(', ') : features}
          • Navigation Ease: ${ease}
          • Desired Improvements: ${Array.isArray(improvements) ? improvements.join(', ') : improvements}

          💬 MESSAGE CONTENT
          ${comments}

⏰ Received at: ${now.toISOString()}
`;

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message
      })
    });

    return true;
  } catch (error) {
    console.error('Failed to send to Telegram:', error);
    return false;
  }
};
