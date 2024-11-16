import prisma from './db.js';
import notificationService from '../services/notifications/index.js';

export const getNotificationSettings = async (userId) => {
  const providers = await prisma.notificationProviders.findMany({
    where: { userId },
  });

  const types = await prisma.notificationTypes.findMany({
    where: { userId },
    include: {
      providers: {
        include: {
          provider: true,
        },
      },
    },
  });

  return {
    providers: providers.reduce((acc, provider) => ({
      ...acc,
      [provider.provider_type]: {
        isEnabled: provider.is_enabled,
        ...provider.credentials,
      },
    }), {}),
    notificationTypes: types.reduce((acc, type) => ({
      ...acc,
      [type.type]: {
        isEnabled: type.is_enabled,
        ...type.settings,
        providers: type.providers.map(p => p.provider.provider_type),
      },
    }), {}),
  };
};

export const updateNotificationProvider = async (userId, providerType, settings) => {
  const { isEnabled, ...credentials } = settings;

  return await prisma.notificationProviders.upsert({
    where: {
      userId_provider_type: {
        userId,
        provider_type: providerType,
      },
    },
    update: {
      is_enabled: isEnabled,
      credentials,
    },
    create: {
      userId,
      provider_type: providerType,
      is_enabled: isEnabled,
      credentials,
    },
  });
};

export const updateNotificationType = async (userId, type, settings) => {
  const { isEnabled, providers, ...typeSettings } = settings;

  const notificationType = await prisma.notificationTypes.upsert({
    where: {
      userId_type: {
        userId,
        type,
      },
    },
    update: {
      is_enabled: isEnabled,
      settings: typeSettings,
    },
    create: {
      userId,
      type,
      is_enabled: isEnabled,
      settings: typeSettings,
    },
  });

  if (providers) {
    // Update provider mappings
    await prisma.provider_type_mapping.deleteMany({
      where: { typeId: notificationType.id },
    });

    if (providers.length > 0) {
      const providerRecords = await prisma.notificationProviders.findMany({
        where: {
          userId,
          provider_type: { in: providers },
        },
      });

      await prisma.provider_type_mapping.createMany({
        data: providerRecords.map(provider => ({
          userId,
          providerId: provider.id,
          typeId: notificationType.id,
        })),
      });
    }
  }

  return notificationType;
};

export const testNotificationProvider = async (userId, providerType) => {
  const provider = await prisma.notificationProviders.findFirst({
    where: {
      userId,
      provider_type: providerType,
    },
  });

  if (!provider || !provider.is_enabled) {
    throw new Error('Provider not found or not enabled');
  }

  await notificationService.testProvider({
    type: providerType,
    credentials: provider.credentials,
  });
};

export default {
  getNotificationSettings,
  updateNotificationProvider,
  updateNotificationType,
  testNotificationProvider,
}; 