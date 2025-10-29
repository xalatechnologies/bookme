# Translation Key Structure - Complete Reference

## Overview

This document provides a complete reference for all translation keys used in the BookMe application, organized by namespace and category.

## File Structure

```
/public/locales/
├── en/
│   ├── common.json       # Shared translations across the app
│   ├── facility.json     # Facility-specific translations
│   └── booking.json      # Booking-specific translations
└── no/
    ├── common.json       # Norwegian shared translations
    ├── facility.json     # Norwegian facility translations
    └── booking.json      # Norwegian booking translations
```

## Namespace Usage

### How to Use Translations

```typescript
import { useTranslation } from 'react-i18next';

// Single namespace
const { t } = useTranslation('facility');
t('fields.name'); // Access facility.fields.name

// Multiple namespaces
const { t } = useTranslation(['facility', 'common']);
t('facility:fields.name');    // Facility namespace
t('common:actions.save');     // Common namespace
t('actions.save', { ns: 'common' }); // Alternative syntax
```

---

## 1. Common Namespace (`common.json`)

### Actions (`actions.*`)
General action buttons and interactions used throughout the app.

**Keys:**
- `save`, `cancel`, `delete`, `edit`, `view`, `add`, `remove`
- `search`, `filter`, `sort`, `export`, `import`
- `download`, `upload`, `print`, `share`, `copy`, `paste`, `cut`
- `submit`, `confirm`, `back`, `next`, `previous`, `close`, `open`
- `select`, `selectAll`, `clear`, `reset`, `refresh`, `retry`
- `undo`, `redo`, `expand`, `collapse`, `more`, `less`
- `loading`, `processing`
- `book`, `bookNow`, `book_now`, `reserve`, `checkout`, `pay`
- `continue`, `finish`, `start`, `stop`, `pause`, `resume`
- `login`, `applyFilters`, `like`, `contact_us`

### View Modes (`view_modes.*`)
Display options for content presentation.

**Keys:**
- `grid` - Grid View
- `list` - List View
- `map` - Map View

### Status (`status.*`)
Generic status indicators.

**Keys:**
- `active`, `inactive`, `pending`, `approved`, `rejected`
- `completed`, `cancelled`, `confirmed`, `draft`, `published`
- `archived`, `deleted`, `expired`, `scheduled`
- `inProgress`, `onHold`, `failed`, `success`

### Common Fields (`common.*`)
Frequently used field labels and values.

**Keys:**
- `yes`, `no`, `ok`
- `name`, `email`, `phone`, `address`, `city`, `postalCode`, `country`
- `language`, `currency`, `date`, `time`, `dateTime`
- `from`, `to`, `between`, `and`, `or`, `all`, `none`, `other`, `unknown`
- `optional`, `required`, `description`, `notes`, `comments`, `tags`
- `category`, `type`, `price`, `quantity`
- `subject`, `recipient`, `landlord`, `tenant`, `attachment`, `attachments`
- `characters`, `total`, `subtotal`, `tax`, `discount`, `shipping`
- `payment`, `invoice`, `receipt`, `order`, `orderNumber`, `reference`
- `id`, `code`, `password`, `confirmPassword`, `newPassword`, `oldPassword`
- `rememberMe`, `forgotPassword`, `signIn`, `signOut`, `signUp`, `register`
- `login`, `logout`, `profile`, `settings`, `preferences`
- `notifications`, `messages`, `dashboard`, `home`, `help`, `support`
- `documentation`, `faq`, `contactUs`, `about`
- `termsOfService`, `privacyPolicy`, `cookiePolicy`
- `loading`, `select_option`, `no_options`, `system_messages`
- `view_details`, `all_bookings_completed`, `status`

### Navigation (`navigation.*`)
Navigation elements and pagination.

**Keys:**
- `menu`, `sidebar`, `breadcrumb`, `pagination`
- `firstPage`, `lastPage`, `nextPage`, `previousPage`
- `pageOf` - "Page {{current}} of {{total}}"
- `showing` - "Showing {{from}} to {{to}} of {{total}}"
- `goToPage`, `previous`, `next`

### Breadcrumbs (`breadcrumbs.*`)
Navigation breadcrumb labels.

**Keys:**
- `home` - Home
- `facilities` - Facilities
- `book_facility_for` - "Book {{name}}"

### Search (`search.*`)
Search functionality labels.

**Keys:**
- `placeholder`, `search_facilities`, `search_admin`, `search_venues`
- `no_results`, `found_results`, `recent_searches`, `clear_search`
- `group_facilities`, `group_locations`, `group_categories`
- `group_users`, `group_bookings`, `group_documents`
- `available_count` - "{{count}} venues available"
- `capacity` - "Capacity: {{count}}"

### Filters (`filters.*`)
Filter controls and options.

**Keys:**
- `title`, `apply`, `clear`, `clearAll`, `active_filters`
- `results_count`, `results_filtered`, `no_results`
- `sort_by`, `filter_by`, `date_range`, `all`
- `facility`, `all_facilities`, `select_facility`
- `date_period`, `status`, `priority`

### Sort Options (`sort.*`)
Sorting options.

**Keys:**
- `relevance`, `name_asc`, `name_desc`
- `price_asc`, `price_desc`, `date_asc`, `date_desc`
- `capacity_asc`, `capacity_desc`
- `created_asc`, `created_desc`

### Date Range (`dateRange.*`)
Pre-defined date range filters.

**Keys:**
- `all`, `today`, `week`, `month`, `upcoming`, `past`

### Notifications (`notifications.*`)
Notification system labels.

**Keys:**
- `title`, `no_notifications`, `mark_all_read`, `mark_as_read`
- `view_all`, `unread_count`, `notification_read`, `all_read`
- `failed_mark_read`, `failed_mark_all_read`

**Types:**
- `types.booking_confirmed`, `types.booking_reminder`, `types.booking_cancelled`
- `types.system_update`, `types.high_load`, `types.backup_complete`

### Time (`time.*`)
Time-related labels.

**Keys:**
- `seconds`, `minute`, `minutes`, `hour`, `hours`
- `day`, `days`, `week`, `weeks`, `month`, `months`, `year`, `years`
- `today`, `yesterday`, `tomorrow`
- `thisWeek`, `lastWeek`, `nextWeek`
- `thisMonth`, `lastMonth`, `nextMonth`
- `thisYear`, `lastYear`, `nextYear`
- `morning`, `afternoon`, `evening`, `night`, `midnight`, `noon`
- `ago` - "{{time}} ago"
- `in` - "in {{time}}"

**Weekdays:**
- `weekdays.monday`, `weekdays.tuesday`, `weekdays.wednesday`
- `weekdays.thursday`, `weekdays.friday`, `weekdays.saturday`, `weekdays.sunday`

**Months:**
- `months.january` through `months.december`

### Messages (`messages.*`)
System messages and notifications.

**Keys:**
- `success`, `error`, `warning`, `info`
- `confirmDelete`, `deleteSuccess`, `deleteFailed`
- `saveSuccess`, `saveFailed`, `updateSuccess`, `updateFailed`
- `createSuccess`, `createFailed`, `loadingFailed`
- `noData`, `noResults`, `searchNoResults`, `unsavedChanges`
- `sessionExpired`, `networkError`, `serverError`, `validationError`
- `unauthorized`, `forbidden`, `notFound`
- `comingSoon`, `underConstruction`, `maintenanceMode`
- `logout_success`, `logout_failed`
- `language_changed`, `language_change_failed`

**Messaging-specific:**
- `noAvailableContacts`, `noBookingsYetTenant`, `noBookingsYetLandlord`
- `selectFacilityInfo`, `lowPriority`, `mediumPriority`, `highPriority`
- `message`, `addAttachment`, `dragDropFiles`, `selectFiles`
- `cancel`, `sendMessage`, `sending`
- `sendToLandlord`, `sendToTenant`, `needBookedVenues`

### Placeholders (`placeholders.*`)
Input field placeholders.

**Keys:**
- `search`, `email`, `password`, `name`, `phone`, `message`
- `selectOption`, `selectDate`, `selectTime`, `selectFile`
- `dragDropFile`, `noOptions`
- `threadSubject`, `threadMessage`, `messageSearch`
- `groupBookingPurpose`, `selectTimeSlot`, `selectWeek`
- `selectDay`, `selectEndDate`, `selectVenue`
- `selectLandlord`, `selectTenant`
- `fieldExample`, `fieldKey`

### ARIA Labels (`aria.*`)
Accessibility labels.

**Keys:**
- `logo`, `go_to_home`, `search`, `search_input`, `sort_dropdown`
- `notifications`, `open_notifications`, `profile_menu`, `profile_image`
- `language_toggle`, `cart`, `mobile_menu`
- `close_modal`, `open_menu`, `close_menu`
- `remove_filter` - "Remove {{label}} filter"

### Accessibility (`accessibility.*`)
Accessibility features.

**Keys:**
- `skipToContent`, `skipToNavigation`, `closeModal`
- `openMenu`, `closeMenu`, `toggleDarkMode`
- `increaseTextSize`, `decreaseTextSize`, `highContrast`
- `screenReader`, `keyboardNavigation`

### Validation (`validation.*`)
Form validation messages.

**Keys:**
- `required_field`, `invalid_email`, `invalid_phone`
- `password_too_short`, `passwords_must_match`, `select_requires_options`

### FAQ (`faq.*`)
Frequently Asked Questions.

**Keys:**
- `title` - Frequently Asked Questions
- `food_drinks`, `food_drinks_answer`
- `booking_time`, `booking_time_answer`
- `cancellation`, `cancellation_answer`
- `parking`, `parking_available`, `parking_contact`

### Loading States (`loading.*`)
Loading indicators.

**Keys:**
- `facility` - Loading facility...
- `please_wait` - Please wait...

### Tabs (`tabs.*`)
Tab navigation labels.

**Keys:**
- `general`, `zones`, `facilities`, `rules`, `faq`

### Rules (`rules.*`)
Facility rules and guidelines.

**Keys:**
- `smoking_not_allowed`, `cleanup_required_desc`
- `noise_after_hours`, `noise_after_hours_desc`
- `cancellation`, `cancellation_desc`

### Miscellaneous
- `about` - About
- `available_zones` - Available zones
- `entire_facility` - Entire Facility
- `book_entire_facility` - Book Entire Facility

---

## 2. Facility Namespace (`facility.json`)

### Basic Info
- `title` - Facilities
- `subtitle` - Explore and book available facilities

### Fields (`fields.*`)
Facility property labels.

**Keys:**
- `name`, `description`, `type`, `category`, `capacity`, `area`
- `location`, `address`, `building`, `floor`, `room`, `zone`
- `price`, `price_per_hour`, `pricePerHour`, `price_range`
- `min_price`, `max_price`, `amenities`, `equipment`
- `accessibility`, `parking`, `wifi`, `projector`, `whiteboard`
- `soundSystem`, `airConditioning`, `heating`, `naturalLight`
- `windows`, `doors`, `ceilingHeight`, `floorType`, `wallColor`
- `opening_hours`, `available_from`, `available_until`
- `image`, `images`, `thumbnail`
- `contact_person`, `contact_email`, `contact_phone`
- `rules`, `policies`, `cancellation_policy`
- `min_booking_duration`, `max_booking_duration`, `advance_booking_days`
- `popular`, `featured`, `rating`, `reviewCount`, `reviews`

### Types (`types.*`)
Facility type classifications.

**Keys:**
- `sports_hall`, `gym`, `conference_room`, `auditorium`, `classroom`
- `sports_field`, `tennis_court`, `swimming_pool`, `parking`
- `library`, `studio`, `kitchen`, `outdoor_area`, `workshop`, `other`

### Amenities (`amenities.*`)
Available amenities and features.

**Keys:**
- `available_title`, `equipment_title`, `suitable_for`, `no_amenities`
- `wifi`, `projector`, `whiteboard`, `sound_system`, `microphone`
- `air_conditioning`, `heating`, `kitchen_access`, `parking`
- `wheelchair_accessible`, `changing_rooms`, `showers`, `lockers`
- `reception`, `security`, `catering`, `video_conference`
- `tv_screen`, `natural_light`, `outdoor_access`

### Accessibility (`accessibility.*`)
Accessibility features.

**Keys:**
- `wheelchair`, `elevator`, `automatic_doors`, `disabled_parking`
- `braille_signage`, `hearing_loop`, `accessible_restroom`
- `ramp`, `wide_doorways`, `accessible_counter`

### Status (`status.*`)
Facility availability status.

**Keys:**
- `available`, `unavailable`, `occupied`, `maintenance`, `closed`
- `coming_soon`, `fully_booked`, `limited_availability`
- `available_now`, `available_soon`, `open_now`

### Actions (`actions.*`)
Facility-related actions.

**Keys:**
- `book`, `book_now`, `view_details`, `view_availability`, `check_availability`
- `add_to_favorites`, `remove_from_favorites`, `share`, `report`, `contact`
- `get_directions`, `view_on_map`, `view_photos`, `write_review`
- `compare`, `suggest_edit`, `toggle_map_view`, `toggle_list_view`
- `go_back`, `go_home`, `like`, `liked`

### Filters (`filters.*`)
Facility filtering options.

**Keys:**
- `all`, `search`, `by_type`, `by_location`, `by_capacity`
- `by_price`, `by_amenities`, `by_availability`
- `available_only`, `with_wifi`, `wheelchair_accessible`
- `sort_by`, `sort_by_name`, `sort_by_price`, `sort_by_capacity`
- `sort_by_rating`, `sort_by_popularity`
- `sort_ascending`, `sort_descending`

### Details (`details.*`)
Facility detail sections.

**Keys:**
- `overview`, `specifications`, `amenities_equipment`
- `availability`, `pricing`, `reviews`, `location`, `policies`
- `contact_info`, `similar_facilities`
- `capacity_info` - "{{count}} person"
- `capacity_info_plural` - "{{count}} people"
- `area_info` - "{{area}} m²"
- `hourly_rate` - "{{price}} kr/hour"
- `rating_info` - "{{rating}} out of 5"
- `reviews_count` - "{{count}} review"
- `reviews_count_plural` - "{{count}} reviews"
- `quick_info`, `opening_hours_today`, `facilities`
- `book_facility`, `per_hour`, `people`

### Messages (`messages.*`)
Facility-related messages.

**Success:**
- `success.added_to_favorites`, `success.removed_from_favorites`
- `success.review_submitted`, `success.report_submitted`
- `success.facility_updated`, `success.images_uploaded`

**Errors:**
- `error.load_failed`, `error.not_found`, `error.unavailable`
- `error.add_favorite_failed`, `error.review_failed`
- `error.facility_not_found`, `error.facility_not_found_desc`
- `error.load_facility_error`, `error.something_went_wrong`

**Empty States:**
- `empty.no_facilities`, `empty.no_results`, `empty.no_favorites`
- `empty.try_different_filters`

**Confirmations:**
- `confirm.remove_favorite`

### Zones (`zones.*`)
Facility zone management.

**Keys:**
- `title`, `zone`, `select_zone`, `available_zones`
- `zone_details`, `zone_capacity`, `zone_price`
- `zone_amenities`, `zone_availability`, `no_zones`

### Booking Info (`booking_info.*`)
Booking constraints and requirements.

**Keys:**
- `min_duration` - "Minimum duration: {{duration}} hour(s)"
- `max_duration` - "Maximum duration: {{duration}} hour(s)"
- `advance_notice` - "Must be booked {{days}} days in advance"
- `instant_booking`, `approval_required`
- `cancellation_notice` - "Cancellation must be made {{hours}} hours in advance"

### Card Display (`card.*`)
Facility card display labels.

**Keys:**
- `people`, `squareMeters`, `pricePerHour`, `outOf5`, `reviewCount`
- `yes`, `no`
- `viewDetailsFor` - "View details for {{name}} at {{address}}"
- `addToFavorites`, `removeFavorites`, `shareFacility`
- `moreAmenities`, `more`

### Availability (`availability.*`)
Quick availability indicators.

**Keys:**
- `available_today`, `fully_booked_weekend`, `fully_booked`

### Buttons (`buttons.*`)
Facility action buttons.

**Keys:**
- `view_details`, `book_now`

### Share (`share.*`)
Sharing functionality.

**Keys:**
- `check_out` - "Check out {{name}} on BookMe..."
- `facility_shared`, `link_copied`, `share_failed`

### Search (`search.*`)
Facility search.

**Keys:**
- `placeholder`, `filter`, `sort_name`, `sort_price`, `sort_popularity`
- `type_label`, `availability_label`, `available_now`

### Facility Types (`facility_types.*`)
Facility type categories.

**Keys:**
- `all_types`, `sports_hall`, `cultural_center`
- `meeting_room`, `fitness_center`, `outdoor`

### Contact (`contact.*`)
Contact information and communication.

**Keys:**
- `contact_info_for` - "Contact information for {{name}}:"
- `phone`, `email`, `facility`, `location`
- `open_email_client`, `contact_copied`, `contact_error`, `booking_failed`
- `inquiry_about` - "Inquiry about {{name}}"
- `email_template` - Email template with {{name}} parameter

### Mobile Panel (`mobile_panel.*`)
Mobile-specific UI elements.

**Keys:**
- `see_booking_options`, `booking_coming_soon`
- `capacity_area` - "Capacity: {{capacity}} | Area: {{area}} m²"
- `opening_hours_label` - "Opening hours: {{hours}}"
- `book_now_coming_soon`

### Header (`header.*`)
Facility header elements.

**Keys:**
- `more_images`, `capacity_label` - "Capacity: {{capacity}} people"
- `reviews`, `add_to_favorites`, `remove_from_favorites`

### Rules (`rules.*`)
Facility rules display.

**Keys:**
- `title`, `noSmoking`, `cleanupRequired`

### Gallery (`gallery.*`)
Image gallery controls.

**Keys:**
- `close`, `previous`, `next`
- `image_count` - "Image {{current}} of {{total}}"

### Errors (`errors.*`)
Detailed error messages.

**Keys:**
- `facility_not_found`, `facility_not_found_desc`
- `load_facility_error`, `something_went_wrong`

---

## 3. Booking Namespace (`booking.json`)

### Basic Info
- `title` - Bookings
- `subtitle` - Manage your bookings
- `my_bookings`, `all_bookings`

### Fields (`fields.*`)
Booking data fields.

**Keys:**
- `booking_id`, `facility`, `zone`, `date`, `start_date`, `end_date`
- `time`, `start_time`, `end_time`, `duration`
- `participants`, `attendees`, `purpose`, `activity_type`, `actor_type`
- `booker`, `contact_person`, `contact_email`, `contact_phone`
- `organization`, `department`, `cost_center`, `reference_number`
- `internal_notes`, `special_requests`, `equipment_needed`, `catering`
- `setup_type`, `price`, `total_price`, `deposit`
- `payment_status`, `payment_method`, `invoice_number`, `confirmation_number`
- `created_at`, `updated_at`, `cancelled_at`, `terms_accepted`

### Types (`types.*`)
Booking types.

**Keys:**
- `one_time`, `recurring`, `single`, `group`
- `event`, `meeting`, `training`, `conference`, `workshop`
- `private`, `public`

### Actor Types (`actor_types.*`)
Types of booking actors.

**Keys:**
- `private_person`, `lag_foreninger`, `paraply`
- `private_firma`, `kommunale_enheter`

### Status (`status.*`)
Booking status values.

**Keys:**
- `pending`, `confirmed`, `approved`, `rejected`, `cancelled`
- `completed`, `in_progress`, `no_show`
- `checked_in`, `checked_out`
- `pending_payment`, `paid`, `refunded`, `overdue`, `awaiting_approval`

### Payment Status (`payment_status.*`)
Payment-specific status.

**Keys:**
- `unpaid`, `paid`, `partially_paid`, `refunded`
- `pending`, `failed`, `processing`

### Actions (`actions.*`)
Booking-related actions.

**Keys:**
- `create`, `create_new`, `view`, `view_details`
- `edit`, `modify`, `cancel`, `reschedule`, `extend`, `duplicate`
- `check_in`, `check_out`, `confirm`, `approve`, `reject`
- `add_to_cart`, `proceed_to_checkout`
- `download_confirmation`, `send_reminder`, `add_to_calendar`
- `share`, `report_issue`, `request_refund`, `leave_review`
- `clear_all`, `complete_booking`

### Recurring Bookings (`recurring.*`)
Recurring booking options.

**Keys:**
- `title`, `pattern`, `frequency`
- `daily`, `weekly`, `biweekly`, `monthly`, `custom`
- `repeat_every`, `repeat_on`, `ends`, `end_date`
- `after_occurrences` - "After {{count}} occurrence"
- `after_occurrences_plural` - "After {{count}} occurrences"
- `never`, `occurrences`, `next_occurrence`, `all_occurrences`
- `this_occurrence`, `following_occurrences`, `series_info`
- `edit_series`, `edit_single`, `cancel_series`, `cancel_single`

### Filters (`filters.*`)
Booking filtering options.

**Keys:**
- `all`, `search`, `by_status`, `by_date`, `by_facility`, `by_user`
- `upcoming`, `past`, `today`, `this_week`, `this_month`, `date_range`
- `active`, `pending_approval`, `requires_payment`
- `sort_by`, `sort_by_date`, `sort_by_status`, `sort_by_facility`, `sort_by_price`
- `sort_newest`, `sort_oldest`

### Details (`details.*`)
Booking detail sections.

**Keys:**
- `summary`, `booking_details`, `facility_info`
- `time_slot`, `time_slots`, `selected_slots`, `pricing_breakdown`
- `customer_info`, `payment_info`, `additional_info`
- `booking_history`, `timeline`, `documents`, `invoice`, `receipt`, `confirmation`
- `duration_hours` - "{{count}} hour"
- `duration_hours_plural` - "{{count}} hours"
- `total_cost`, `per_hour`, `includes_vat`, `excludes_vat`
- `selected_slots_pricing`, `select_slots_pricing`
- `recurring_slots_pricing`, `select_pattern`

### Pricing (`pricing.*`)
Price calculation labels.

**Keys:**
- `base_price`, `vat_25`, `total_incl_vat`

### Labels (`labels.*`)
Miscellaneous labels.

**Keys:**
- `occurrences`

### Cart (`cart.*`)
Shopping cart functionality.

**Keys:**
- `title`, `your_cart`, `items`
- `item_count` - "{{count}} item"
- `item_count_plural` - "{{count}} items"
- `empty_cart`, `add_more`, `remove`, `clear_cart`
- `subtotal`, `total`, `checkout`, `continue_booking`

### Checkout (`checkout.*`)
Checkout process.

**Keys:**
- `title`, `review_booking`, `payment_details`, `billing_info`
- `terms_and_conditions`, `accept_terms`, `complete_booking`
- `processing`, `secure_checkout`

### Messages (`messages.*`)
Booking-related messages.

**Success:**
- `success.created`, `success.updated`, `success.cancelled`
- `success.confirmed`, `success.approved`, `success.rejected`
- `success.checked_in`, `success.checked_out`, `success.payment_successful`
- `success.added_to_cart`, `success.removed_from_cart`
- `success.reminder_sent`, `success.review_submitted`

**Errors:**
- `error.load_failed`, `error.create_failed`, `error.update_failed`
- `error.cancel_failed`, `error.payment_failed`, `error.not_found`
- `error.already_booked`, `error.not_available`, `error.past_date`
- `error.conflict`, `error.insufficient_capacity`
- `error.minimum_duration`, `error.maximum_duration`, `error.advance_booking`

**Empty States:**
- `empty.no_bookings`, `empty.no_upcoming`, `empty.no_past`, `empty.no_results`

**Confirmations:**
- `confirm.cancel`, `confirm.cancel_series`, `confirm.delete`
- `confirm.reschedule`, `confirm.checkout`

**Warnings:**
- `warnings.cancellation_fee`, `warnings.no_refund`
- `warnings.approval_required`, `warnings.payment_due`, `warnings.upcoming`
- `warning_title_text` - Approval required message

### Notifications (`notifications.*`)
Booking notifications.

**Keys:**
- `new_booking`, `booking_confirmed`, `booking_cancelled`
- `booking_reminder`, `payment_reminder`, `booking_updated`
- `approval_needed`, `approved`, `rejected`

### Statistics (`statistics.*`)
Booking statistics.

**Keys:**
- `total_bookings`, `active_bookings`, `upcoming_bookings`
- `completed_bookings`, `cancelled_bookings`, `total_revenue`
- `average_duration`, `popular_times`, `booking_rate`, `cancellation_rate`

### Activity Types (`activity_types.*`)
Types of activities.

**Keys:**
- `sport`, `culture`, `meeting`, `event`, `training`

### Form (`form.*`)
Booking form labels.

**Keys:**
- `purpose_label`, `purpose_placeholder`
- `attendees_label`, `activity_type_label`, `activity_type_placeholder`
- `actor_type_label`, `actor_type_placeholder`
- `additional_info_label`, `additional_info_placeholder`

### Validation (`validation.*`)
Booking-specific validation.

**Keys:**
- `form_incomplete`, `fill_required_fields`
- `terms_required`, `accept_terms_message`, `processing`
- `select_weekdays`, `select_time_slots`

### Booking Types (`booking_types.*`)
Booking type selection.

**Keys:**
- `one_time_label`, `one_time_description`
- `recurring_label`, `recurring_description`
- `select_label` - "Select {{type}}"

### Button Labels (`button_labels.*`)
Specific button labels.

**Keys:**
- `add_to_cart`, `complete_booking`, `new_booking`
- `cancel_selected`, `cancel`, `cancel_booking`

### Delete Confirmation (`delete_confirm.*`)
Deletion confirmation dialogs.

**Keys:**
- `title_single`, `title_multiple`
- `message_single`, `message_multiple` - "...{{count}} bookings?"
- `cancel_all`, `canceling`
- `success_single`, `success_multiple`

### Toast Messages (`toast.*`)
Toast notification messages.

**Keys:**
- `booking_submitted`, `calendar_added`, `info_copied`, `recurring_coming_soon`

### Details Modal (`details.*`)
Booking details modal.

**Keys:**
- `title`, `unknownVenue`, `statusLabel`, `dateLabel`
- `timeLabel`, `durationLabel`, `totalPriceLabel`, `notesLabel`
- `bookingIdLabel`, `actionsLabel`
- `editBooking`, `cancelBooking`, `shareBooking`, `addToCalendar`, `close`

### Time (`time.*`)
Time labels.

**Keys:**
- `hour`, `hours`

### Steps (`steps.*`)
Booking process steps.

**Calendar:**
- `calendar.title`, `calendar.description`

**Recurrence:**
- `recurrence.title`, `recurrence.description`

**Details:**
- `details.title`, `details.description`

**Terms:**
- `terms.title`, `terms.description`

**Actions:**
- `actions.title`, `actions.description`
- `actions.ready`, `actions.all_filled`

**Progress:**
- `progress.title`, `progress.current` - "Step {{current}} of {{total}}"
- `progress.current_step`, `progress.completed`, `progress.upcoming`

### Page (`page.*`)
Page-level translations.

**Keys:**
- `user_title`, `user_subtitle`, `admin_title`, `admin_subtitle`
- `loading`, `error_loading`, `error_message`, `try_again`
- `no_match`, `no_match_message`, `explore_facilities`
- `showing_count` - "Showing {{count}} of {{total}} bookings"
- `select_all` - "Select all ({{count}})"
- `selected_count` - "{{count}} selected"
- `all_status`

### Terms (`terms.*`)
Terms and conditions.

**Keys:**
- `title`, `accept_label`, `accept_terms_and_privacy`, `and`
- `privacy_policy`, `for_use`, `rules_title`

**Rules:**
- `rules.cleaning`, `rules.key_pickup`, `rules.free_cancellation`, `rules.no_show_fee`

**Privacy:**
- `privacy_title`, `privacy_text`

**Cancellation:**
- `cancellation_title`, `cancellation_text`

**Warning:**
- `warning_title`, `warning_text`

### Navigation (`navigation.*`)
Booking navigation.

**Keys:**
- `previous`, `next`, `previous_week`, `next_week`
- `step_of` - "Step {{current}} of {{total}}"

### Sidebar (`sidebar.*`)
Booking sidebar.

**Keys:**
- `title`, `zone_selector`, `booking_type`, `time_slots_title`
- `clear_all_slots`, `template_for_recurrence`
- `recurring_instances` - "...{{count}} total):"
- `and_more` - "...and {{count}} more"
- `no_slots_selected`, `one_hour`, `hours` - "{{count}} hours"
- `recurring_slots_and_price`, `slots_and_price_select_pattern`
- `selected_slots_and_price`, `select_slots_get_price`
- `select_slots_pricing`, `recurring_slots_and_price` (duplicate)

### Weekdays (`weekdays.*`)
Day names.

**Keys:**
- `sunday`, `monday`, `tuesday`, `wednesday`
- `thursday`, `friday`, `saturday`

### Recurrence Pattern (`recurrence.*`)
Detailed recurrence options.

**Keys:**
- `title`, `select_pattern`, `weekly`, `weekly_desc`
- `biweekly`, `biweekly_desc`, `monthly`, `monthly_desc`
- `custom`, `custom_desc`, `select_days`, `which_week`, `which_day`
- `interval_days`, `max_occurrences`, `pattern`, `errors_title`
- `first`, `second`, `third`, `fourth`, `last`

---

## Usage Examples

### Basic Translation

```typescript
// Single key
t('facility:fields.name') // "Name"

// With parameter
t('facility:details.capacity_info', { count: 50 }) // "50 people"

// Pluralization
t('facility:details.reviews_count', { count: 1 }) // "1 review"
t('facility:details.reviews_count', { count: 5 }) // "5 reviews"
```

### Multiple Namespaces

```typescript
const { t } = useTranslation(['booking', 'facility', 'common']);

// Explicit namespace
t('booking:status.confirmed')
t('facility:actions.book_now')
t('common:actions.cancel')

// With ns parameter
t('status.confirmed', { ns: 'booking' })
```

### Complex Parameters

```typescript
// Multiple parameters
t('facility:share.check_out', {
  name: 'Sports Hall',
  type: 'Indoor facility',
  capacity: 100
})

// Date formatting
t('booking:navigation.step_of', {
  current: 2,
  total: 5
})
```

---

## Translation Key Conventions

### Naming Conventions
1. **Use snake_case** for key names
2. **Group related keys** using dots (.)
3. **Use descriptive names** that indicate purpose
4. **Keep hierarchy shallow** (max 3-4 levels)

### Parameter Conventions
1. **Use {{paramName}}** for interpolation
2. **Use _plural suffix** for pluralization keys
3. **Include context** in parameter names

### Organization Patterns
1. **Group by feature** (fields, actions, status)
2. **Separate by concern** (labels vs messages)
3. **Common elements** in common.json
4. **Feature-specific** in dedicated files

---

## Maintenance Guidelines

### Adding New Keys
1. Determine the correct namespace (common, facility, booking)
2. Find the appropriate category or create a new one
3. Add the key in English first
4. Add corresponding Norwegian translation
5. Document parameter usage if applicable
6. Update this document

### Removing Keys
1. Search codebase for usage
2. Remove from both EN and NO files
3. Update this documentation
4. Create migration guide if widely used

### Modifying Keys
1. Check for existing usage
2. Consider backward compatibility
3. Update all language files
4. Update documentation
5. Test in all contexts

---

## Best Practices

### Do's
- ✅ Use existing keys when possible
- ✅ Keep translations consistent
- ✅ Provide context in key names
- ✅ Use parameters for dynamic content
- ✅ Support pluralization
- ✅ Document new patterns

### Don'ts
- ❌ Don't hardcode text in components
- ❌ Don't create duplicate keys
- ❌ Don't use overly generic names
- ❌ Don't nest keys too deeply
- ❌ Don't forget Norwegian translations
- ❌ Don't use translation keys as IDs

---

## Testing Translations

### Manual Testing
1. Switch language between EN and NO
2. Verify all text appears correctly
3. Check parameter substitution
4. Test pluralization rules
5. Validate formatting

### Automated Testing
```typescript
// Example test
import i18n from '@/lib/i18n';

describe('Translations', () => {
  it('should have all required booking keys', () => {
    const requiredKeys = [
      'booking:status.confirmed',
      'booking:actions.create',
      'booking:fields.facility'
    ];

    requiredKeys.forEach(key => {
      expect(i18n.exists(key)).toBe(true);
    });
  });
});
```

---

## Language-Specific Notes

### English (en)
- Use American English spelling
- Keep sentences concise
- Use title case for headings

### Norwegian (no)
- Use Bokmål variant
- Follow Norwegian grammar rules
- Maintain formal tone for official content
- Use informal tone for user-facing content

---

## Complete Key Count

- **Common**: ~500 keys
- **Facility**: ~200 keys
- **Booking**: ~400 keys
- **Total**: ~1100+ translation keys

---

## Related Documentation

- `/docs/TYPE_SAFETY_LINTING_ISSUES.md` - Type safety guidelines
- `/docs/ARCHITECTURE_README.md` - System architecture
- `/README.md` - Project overview

---

*Last Updated: 2025-10-29*
*Maintained by: Development Team*
