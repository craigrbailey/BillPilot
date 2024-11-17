-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "discordConfig" JSONB,
ADD COLUMN     "discordEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "emailConfig" JSONB,
ADD COLUMN     "emailEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notificationTypes" JSONB,
ADD COLUMN     "pushConfig" JSONB,
ADD COLUMN     "pushEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "slackConfig" JSONB,
ADD COLUMN     "slackEnabled" BOOLEAN NOT NULL DEFAULT false;
