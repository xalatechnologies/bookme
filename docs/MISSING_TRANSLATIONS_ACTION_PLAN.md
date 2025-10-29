# Missing Translations - Action Plan

**Date**: October 29, 2025
**Status**: 🔴 CRITICAL - 60+ hardcoded strings identified
**Priority**: HIGH - Affects user experience on all pages

## Executive Summary

Comprehensive audit revealed **60+ hardcoded strings** across user-facing components that should be internationalized. This affects:
- User Dashboard (12+ strings)
- User Profile (20+ strings)
- User Notifications (10+ strings)
- User Help/FAQ (12+ strings)
- Feature Components (15+ strings)

## Critical Issues Fixed

### ✅ 1. FacilityCard Namespace Issue (COMPLETED)
**Problem**: FacilityCard component using wrong translation namespace
**Fix**: Changed `facilities:` to `facility:` (singular) across all references
**Files**: `/src/components/features/facilities/components/FacilityCard/index.tsx`
**Lines**: 105-111, 122, 146, 157, 211
**Status**: ✅ FIXED

## Remaining Critical Issues

### 🔴 1. User Dashboard - System Messages (HIGH PRIORITY)

**File**: `/src/pages/user/UserDashboard.tsx`

#### Missing Keys:
```json
{
  "user": {
    "dashboard": {
      "default_username": "Default User",
      "unknown_facility": "Unknown Facility",
      "default_participant": "Default Participant",
      "weather": {
        "cloudy": "Cloudy",
        "sunny": "Sunny",
        "rainy": "Rainy",
        "snowy": "Snowy"
      },
      "system_messages": {
        "booking_updated": "Booking Updated",
        "booking_updated_desc": "Booking for {{facility}} has been updated with new times.",
        "new_regulation": "New Regulations",
        "new_regulation_desc": "New cancellation rules take effect from February 1st.",
        "maintenance": "Maintenance Scheduled",
        "maintenance_desc": "System maintenance scheduled Sunday 08:00–10:00.",
        "booking_confirmed": "Booking Confirmed",
        "booking_confirmed_desc": "Your booking for {{facility}} is confirmed! 🎉"
      }
    }
  }
}
```

#### Norwegian Translation:
```json
{
  "user": {
    "dashboard": {
      "default_username": "Standard bruker",
      "unknown_facility": "Ukjent lokale",
      "default_participant": "Standard deltaker",
      "weather": {
        "cloudy": "Overskyet",
        "sunny": "Solrikt",
        "rainy": "Regnværlig",
        "snowy": "Snøværlig"
      },
      "system_messages": {
        "booking_updated": "Booking oppdatert",
        "booking_updated_desc": "Booking for {{facility}} er oppdatert med nye tider.",
        "new_regulation": "Nytt regelverk",
        "new_regulation_desc": "Nye regler for avbestillinger trer i kraft fra 1. februar.",
        "maintenance": "Vedlikehold planlagt",
        "maintenance_desc": "Vedlikehold av systemet planlagt søndag 08:00–10:00.",
        "booking_confirmed": "Booking bekreftet",
        "booking_confirmed_desc": "Din booking for {{facility}} er bekreftet! 🎉"
      }
    }
  }
}
```

#### Code Changes Required:
```typescript
// Line 113, 130
- "Amin"
+ t('user:dashboard.default_username')

// Line 118, 209, 219
- "Ukjent lokale"
+ t('user:dashboard.unknown_facility')

// Line 144
- "Overskyet"
+ t('user:dashboard.weather.cloudy')

// Line 278
- "Booking oppdatert"
+ t('user:dashboard.system_messages.booking_updated')

// Line 279
- "Booking for Solberghallen er oppdatert med nye tider."
+ t('user:dashboard.system_messages.booking_updated_desc', { facility: 'Solberghallen' })

// Lines 287-288
- "Nytt regelverk" / "Nye regler for avbestillinger..."
+ t('user:dashboard.system_messages.new_regulation')
+ t('user:dashboard.system_messages.new_regulation_desc')

// Lines 296-297
- "Vedlikehold planlagt" / "Vedlikehold av systemet..."
+ t('user:dashboard.system_messages.maintenance')
+ t('user:dashboard.system_messages.maintenance_desc')

// Lines 305-306
- "Booking bekreftet" / "Din booking for..."
+ t('user:dashboard.system_messages.booking_confirmed')
+ t('user:dashboard.system_messages.booking_confirmed_desc', { facility: booking.facilityName })
```

---

### 🔴 2. User Profile - Security & Privacy (HIGH PRIORITY)

**File**: `/src/pages/user/UserProfile.tsx`

#### Missing Keys:
```json
{
  "user": {
    "pages": {
      "profile": {
        "security": {
          "two_factor": {
            "title": "Two-Factor Authentication (2FA)",
            "type": "Email/SMS Authentication",
            "description": "Get a security code via email or SMS when logging in",
            "disable": "Disable",
            "enable": "Enable"
          },
          "login_history": {
            "title": "Login History",
            "columns": {
              "device": "Device",
              "location": "Location",
              "ip": "IP Address",
              "time": "Time"
            }
          },
          "connected_accounts": {
            "title": "Connected Accounts",
            "not_connected": "Not connected",
            "connect": "Connect",
            "disconnect": "Disconnect"
          },
          "providers": {
            "google": "Google",
            "microsoft": "Microsoft",
            "facebook": "Facebook"
          }
        },
        "preferences": {
          "title": "Preferences and Customization",
          "language_theme": {
            "title": "Language and Appearance"
          },
          "language": "Language",
          "theme": "Theme",
          "languages": {
            "nb": "Norwegian (Bokmål)",
            "nn": "Norwegian (Nynorsk)",
            "en": "English"
          },
          "theme_light": "Light",
          "theme_dark": "Dark",
          "theme_system": "System",
          "notifications": {
            "title": "Notification Settings",
            "email": "Email",
            "push": "Push Notifications",
            "sms": "SMS"
          },
          "dashboard_view": {
            "title": "Dashboard View",
            "compact": "Compact",
            "expanded": "Expanded"
          }
        },
        "privacy": {
          "title": "Privacy and Data",
          "data_download": {
            "title": "Download Your Data",
            "description": "Download a copy of all your data, including bookings, profile information, and activity history.",
            "button": "Download Data"
          },
          "deactivate": {
            "title": "Temporarily Deactivate",
            "description": "Hide your profile and suspend your account temporarily. You can reactivate anytime.",
            "button": "Deactivate Account"
          },
          "delete_account": {
            "title": "Permanently Delete Account",
            "description": "This action cannot be undone. All your data, bookings, and history will be permanently deleted.",
            "warning": "Warning: This action is permanent and cannot be reversed.",
            "button": "Delete Account Permanently",
            "confirm_button": "Delete Permanently",
            "cancel_button": "Cancel",
            "confirmation_email": "Confirm your email address to proceed"
          }
        }
      }
    }
  }
}
```

#### Code Changes Required:
```typescript
// Lines 549-564
- "Tofaktorautentisering (2FA)"
+ t('user:pages.profile.security.two_factor.title')

- "E-post/SMS autentisering"
+ t('user:pages.profile.security.two_factor.type')

- "Få en sikkerhetskode på e-post eller SMS ved innlogging"
+ t('user:pages.profile.security.two_factor.description')

- "Deaktiver" / "Aktiver"
+ t('user:pages.profile.security.two_factor.disable')
+ t('user:pages.profile.security.two_factor.enable')

// Lines 642-677 (Preferences)
- "Språk og utseende"
+ t('user:pages.profile.preferences.language_theme.title')

- "Norsk (bokmål)" / "English"
+ t('user:pages.profile.preferences.languages.nb')
+ t('user:pages.profile.preferences.languages.en')

- "Lys" / "Mørk" / "System"
+ t('user:pages.profile.preferences.theme_light')
+ t('user:pages.profile.preferences.theme_dark')
+ t('user:pages.profile.preferences.theme_system')

// Lines 769-830 (Privacy)
- "Personvern og data"
+ t('user:pages.profile.privacy.title')

- "Last ned dine data"
+ t('user:pages.profile.privacy.data_download.title')

- "Slett konto permanent"
+ t('user:pages.profile.privacy.delete_account.button')
```

---

### 🔴 3. User Notifications (HIGH PRIORITY)

**File**: `/src/pages/user/UserNotifications.tsx`

#### Missing Keys:
```json
{
  "user": {
    "pages": {
      "notifications": {
        "preferences": {
          "booking_confirmed": {
            "title": "Booking Confirmed",
            "description": "Notify me when a booking is confirmed"
          },
          "booking_cancelled": {
            "title": "Booking Cancelled",
            "description": "Notify me if a booking is cancelled"
          },
          "booking_reminder": {
            "title": "Booking Reminder",
            "description": "Remind me 24 hours before booking"
          },
          "payment_due": {
            "title": "Payment Due",
            "description": "Notify me about upcoming payments"
          }
        },
        "templates": {
          "booking_cancelled": {
            "title": "Booking Cancelled",
            "subject": "Booking Cancelled - {{facilityName}}",
            "sms_content": "Booking cancelled: {{facilityName}} {{date}} at {{time}}. Refund will be processed within 3-5 business days.",
            "email_content": "Your booking for {{facilityName}} on {{date}} at {{time}} has been cancelled. A full refund will be processed within 3-5 business days."
          }
        }
      }
    }
  }
}
```

---

### 🔴 4. User Help/FAQ (HIGH PRIORITY)

**File**: `/src/pages/user/UserHelp.tsx`

#### Missing Keys:
```json
{
  "user": {
    "pages": {
      "help": {
        "faq": {
          "categories": {
            "all": "All",
            "booking": "Booking",
            "payment": "Payment",
            "receipts": "Receipts",
            "technical": "Technical"
          },
          "booking_question": {
            "question": "How do I book a facility?",
            "answer": "To book a facility, search for available venues, select your desired date and time, and follow the booking process. You'll receive a confirmation via email."
          },
          "edit_cancel_question": {
            "question": "Can I edit or cancel a booking?",
            "answer": "Yes, you can edit or cancel bookings up to 24 hours before the scheduled time. Log in to your account, go to 'My Bookings', and select the booking you wish to modify."
          },
          "payment_methods": {
            "question": "What payment methods are accepted?",
            "answer": "We accept credit cards (Visa, Mastercard, American Express), debit cards, and bank transfers for bookings."
          },
          "advance_booking": {
            "question": "How far in advance can I book?",
            "answer": "You can book facilities up to 6 months in advance, depending on the facility's availability policy."
          },
          "no_show": {
            "question": "What happens if I don't show up?",
            "answer": "If you don't show up for your booking without prior cancellation, you may forfeit your payment and it could affect your booking privileges."
          },
          "receipts": {
            "question": "Can I get a receipt for my bookings?",
            "answer": "Yes, receipts are automatically sent to your registered email after payment. You can also download receipts from the 'Receipts' section in your account."
          }
        }
      }
    }
  }
}
```

---

## Implementation Priority

### Phase 1: Critical User-Facing Strings (Day 1)
1. ✅ Fix FacilityCard namespace (COMPLETED)
2. Add UserDashboard system messages
3. Add UserProfile security strings
4. Test on user pages

### Phase 2: Secondary Strings (Day 2)
1. Add UserNotifications strings
2. Add UserHelp FAQ content
3. Add HistoryPage "unknown_facility" string
4. Test all user flows

### Phase 3: Feature Components (Day 3)
1. Fix RecurringBookingCard "Rediger" button
2. Fix AdminFacilityListItem hardcoded strings
3. Fix dialog titles across components
4. Comprehensive testing

### Phase 4: Quality Assurance (Day 4)
1. Test all language switches (NO ↔ EN)
2. Verify all translation keys load correctly
3. Check for missing keys in browser console
4. Update documentation

---

## Testing Checklist

### Manual Testing Required:
- [ ] User Dashboard displays all translated system messages
- [ ] User Profile settings show correct translations
- [ ] User Notifications preferences are translated
- [ ] User Help FAQ displays in both languages
- [ ] FacilityCard shows all translated labels
- [ ] Language switch works without errors
- [ ] No "missingKey" errors in console

### Automated Testing:
- [ ] Build completes without errors
- [ ] No TypeScript errors
- [ ] i18next namespaces load correctly
- [ ] Translation keys exist in both EN and NO files

---

## Migration Script Template

For bulk replacements, use this script pattern:

```bash
#!/bin/bash

# Example: Replace hardcoded strings in UserDashboard.tsx
sed -i '' 's/"Ukjent lokale"/t("user:dashboard.unknown_facility")/g' src/pages/user/UserDashboard.tsx
sed -i '' 's/"Amin"/t("user:dashboard.default_username")/g' src/pages/user/UserDashboard.tsx
sed -i '' 's/"Overskyet"/t("user:dashboard.weather.cloudy")/g' src/pages/user/UserDashboard.tsx

# Add more replacements as needed
```

---

## Estimated Effort

- **Phase 1**: 2-3 hours (Critical fixes)
- **Phase 2**: 2-3 hours (Secondary strings)
- **Phase 3**: 1-2 hours (Feature components)
- **Phase 4**: 1-2 hours (QA and testing)
- **Total**: 6-10 hours

---

## Success Criteria

✅ **Zero hardcoded strings** in user-facing components
✅ **All translation keys** exist in both EN and NO files
✅ **No console errors** for missing translations
✅ **Language switching** works seamlessly
✅ **User experience** is fully localized

---

## Next Steps

1. **Review this action plan** with team
2. **Prioritize phases** based on business needs
3. **Assign developer** to implement changes
4. **Schedule QA testing** after each phase
5. **Deploy incrementally** to production

---

**Document Status**: Ready for Implementation
**Last Updated**: October 29, 2025
**Next Review**: After Phase 1 completion
