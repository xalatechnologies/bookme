-- Migration: Add Theme Preference to User Notification Preferences
-- Description: Add theme preference column to store user's theme choice (light, dark, system)

-- Add theme preference column to user_notification_preferences table
alter table user_notification_preferences
  add column if not exists theme text not null default 'system' check (theme in ('light', 'dark', 'system'));

comment on column user_notification_preferences.theme is 'User theme preference: light, dark, or system';

-- Add language preference column to user_notification_preferences table
alter table user_notification_preferences
  add column if not exists language text not null default 'nb-NO' check (language in ('nb-NO', 'en-US'));

comment on column user_notification_preferences.language is 'User language preference: nb-NO or en-US';

-- Update the should_send_notification function to handle the new column if needed
-- (No changes needed for this function as it only handles notifications)

-- Update the create_default_notification_preferences function to include theme
-- (The default value will be used automatically)