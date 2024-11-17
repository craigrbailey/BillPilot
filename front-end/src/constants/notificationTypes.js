export const NOTIFICATION_TYPES = {
  BILL_DUE: {
    name: 'Bill Due Reminders',
    description: 'Get notified when bills are coming due',
    settings: [
      { name: 'days_before', label: 'Days Before Due', type: 'number', min: 1, max: 14 },
      { name: 'notification_time', label: 'Notification Time', type: 'time' },
    ],
    icon: '📅',
  },
  BILL_OVERDUE: {
    name: 'Overdue Bills',
    description: 'Get notified when bills are overdue',
    settings: [
      { name: 'notification_time', label: 'Notification Time', type: 'time' },
      { name: 'repeat_frequency', label: 'Repeat Frequency', type: 'select', options: [
        { value: 'DAILY', label: 'Daily' },
        { value: 'WEEKLY', label: 'Weekly' },
        { value: 'NEVER', label: 'Once Only' },
      ]},
    ],
    icon: '⚠️',
  },
  WEEKLY_SUMMARY: {
    name: 'Weekly Summary',
    description: 'Receive a weekly summary of upcoming bills and finances',
    settings: [
      { name: 'day_of_week', label: 'Day of Week', type: 'select', options: [
        { value: 0, label: 'Sunday' },
        { value: 1, label: 'Monday' },
        { value: 2, label: 'Tuesday' },
        { value: 3, label: 'Wednesday' },
        { value: 4, label: 'Thursday' },
        { value: 5, label: 'Friday' },
        { value: 6, label: 'Saturday' },
      ]},
      { name: 'notification_time', label: 'Notification Time', type: 'time' },
    ],
    icon: '📊',
  },
  MONTHLY_SUMMARY: {
    name: 'Monthly Summary',
    description: 'Receive a monthly summary of your financial activity',
    settings: [
      { name: 'day_of_month', label: 'Day of Month', type: 'number', min: 1, max: 31 },
      { name: 'notification_time', label: 'Notification Time', type: 'time' },
    ],
    icon: '📈',
  },
};

export const PROVIDERS = {
  EMAIL: {
    name: 'Gmail',
    fields: [
      { name: 'email', label: 'Email Address', type: 'text' },
      { name: 'app_password', label: 'App Password', type: 'password', helperText: 'Use an App Password from your Google Account' },
    ],
    description: 'Send notifications via Gmail',
    icon: '📧',
  },
  PUSHOVER: {
    name: 'Pushover',
    fields: [
      { name: 'user_key', label: 'User Key', type: 'text' },
      { name: 'app_token', label: 'App Token', type: 'text' },
    ],
    description: 'Receive instant push notifications on your devices',
    icon: '📱',
  },
  DISCORD: {
    name: 'Discord',
    fields: [
      { name: 'webhook_url', label: 'Webhook URL', type: 'text' },
      { name: 'channel_name', label: 'Channel Name (optional)', type: 'text' },
    ],
    description: 'Send notifications to Discord channels',
    icon: '🎮',
  },
  SLACK: {
    name: 'Slack',
    fields: [
      { name: 'webhook_url', label: 'Webhook URL', type: 'text' },
      { name: 'channel', label: 'Channel Name (optional)', type: 'text' },
    ],
    description: 'Send notifications to Slack channels',
    icon: '💬',
  },
}; 