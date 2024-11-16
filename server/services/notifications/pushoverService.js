import fetch from 'node-fetch';

const send = async (credentials, message) => {
  const response = await fetch('https://api.pushover.net/1/messages.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: credentials.app_token,
      user: credentials.user_key,
      title: message.subject,
      message: message.body,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to send Pushover notification');
  }
};

export default { send }; 