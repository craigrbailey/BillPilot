import fetch from 'node-fetch';

const send = async (credentials, message) => {
  const response = await fetch(credentials.webhook_url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: `**${message.subject}**\n${message.body}`,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to send Discord notification');
  }
};

export default { send }; 