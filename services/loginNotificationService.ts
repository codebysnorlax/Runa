const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;

interface LocationData {
  ip: string;
  country: string;
  city: string;
  region: string;
}

const getLocationData = async (): Promise<LocationData> => {
  try {
    const response = await fetch('http://ip-api.com/json/');
    const data = await response.json();
    return {
      ip: data.query || 'Unknown',
      country: data.country || 'Unknown',
      city: data.city || 'Unknown',
      region: data.regionName || 'Unknown'
    };
  } catch {
    return { ip: 'Unknown', country: 'Unknown', city: 'Unknown', region: 'Unknown' };
  }
};

const getDeviceInfo = () => {
  const userAgent = navigator.userAgent;

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

  return {
    os,
    browser,
    platform: navigator.platform,
    language: navigator.language,
    screen: `${window.screen.width}x${window.screen.height}`
  };
};

export const sendLoginNotification = async (user: any) => {
  try {
    const currentTime = new Date();
    const locationData = await getLocationData();
    const deviceInfo = getDeviceInfo();

    const message = `🎉 NEW USER LOGGED IN RUNA🎉

👤 USER INFORMATION
• Name: ${user.firstName || 'Unknown'} ${user.lastName || ''}
• Email: ${user.primaryEmailAddress?.emailAddress || 'Not provided'}
• User ID: ${user.id}

📅 LOGIN TIME
• Date: ${currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
• Time: ${currentTime.toLocaleTimeString('en-IN', { hour12: true, timeZone: 'Asia/Calcutta' })} GMT+5:30
• Timezone: Asia/Calcutta

🌍 LOCATION & NETWORK
• IP Address: ${locationData.ip}
• Country: ${locationData.country}
• City: ${locationData.city}
• Region: ${locationData.region}
• Language: ${deviceInfo.language}

💻 DEVICE INFORMATION
• OS: ${deviceInfo.os}
• Browser: ${deviceInfo.browser}
• Platform: ${deviceInfo.platform}
• Screen: ${deviceInfo.screen}

⏰ Logged in at: ${currentTime.toLocaleString('en-IN', { timeZone: 'Asia/Calcutta' })}`;

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to send login notification`);
    }

    console.log('Login notification sent successfully');
    return { success: true };

  } catch (error) {
    console.error('Failed to send login notification:', error);
    return { success: false, error };
  }
};
