import emailService from './emailService.js';
import pushoverService from './pushoverService.js';
import discordService from './discordService.js';
import slackService from './slackService.js';

const PROVIDERS = {
  EMAIL: emailService,
  PUSHOVER: pushoverService,
  DISCORD: discordService,
  SLACK: slackService,
};

export const sendNotification = async (userId, message, providers) => {
  const errors = [];
  
  for (const provider of providers) {
    try {
      await PROVIDERS[provider.type].send(provider.credentials, message);
    } catch (error) {
      errors.push(`${provider.type}: ${error.message}`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Failed to send notifications: ${errors.join(', ')}`);
  }
};

export const testProvider = async (provider) => {
  const testMessage = {
    subject: 'Test Notification',
    body: 'This is a test notification from your finance app.',
  };

  await PROVIDERS[provider.type].send(provider.credentials, testMessage);
};

export default {
  sendNotification,
  testProvider,
}; 