-- Migration: Seed Enum Translations
-- Description: Adds translations for database enums (booking_status, ticket_status, org_role, etc.)

-- Booking Status Translations
INSERT INTO localized_db_values (entity_type, entity_key, language_code, label, description, sort_order, is_active) VALUES
-- English booking statuses
('booking_status', 'pending', 'en', 'Pending', 'Booking is pending approval', 1, true),
('booking_status', 'awaiting_payment', 'en', 'Awaiting Payment', 'Payment is required', 2, true),
('booking_status', 'paid', 'en', 'Confirmed', 'Booking is confirmed and paid', 3, true),
('booking_status', 'cancelled', 'en', 'Cancelled', 'Booking has been cancelled', 4, true),
('booking_status', 'expired', 'en', 'Expired', 'Booking has expired', 5, true),
('booking_status', 'completed', 'en', 'Completed', 'Booking is completed', 6, true),
('booking_status', 'refunded', 'en', 'Refunded', 'Booking has been refunded', 7, true),

-- Norwegian booking statuses
('booking_status', 'pending', 'no', 'Ventende', 'Booking venter på godkjenning', 1, true),
('booking_status', 'awaiting_payment', 'no', 'Venter betaling', 'Betaling påkrevd', 2, true),
('booking_status', 'paid', 'no', 'Bekreftet', 'Booking er bekreftet og betalt', 3, true),
('booking_status', 'cancelled', 'no', 'Avlyst', 'Booking er avlyst', 4, true),
('booking_status', 'expired', 'no', 'Utløpt', 'Booking har utløpt', 5, true),
('booking_status', 'completed', 'no', 'Fullført', 'Booking er fullført', 6, true),
('booking_status', 'refunded', 'no', 'Refundert', 'Booking er refundert', 7, true)
ON CONFLICT (entity_type, entity_key, language_code) DO UPDATE
SET label = EXCLUDED.label, description = EXCLUDED.description, sort_order = EXCLUDED.sort_order;

-- Ticket Status Translations
INSERT INTO localized_db_values (entity_type, entity_key, language_code, label, description, sort_order, is_active) VALUES
-- English ticket statuses
('ticket_status', 'open', 'en', 'Open', 'Ticket is open', 1, true),
('ticket_status', 'in-progress', 'en', 'In Progress', 'Ticket is being worked on', 2, true),
('ticket_status', 'waiting-user', 'en', 'Waiting for User', 'Waiting for user response', 3, true),
('ticket_status', 'resolved', 'en', 'Resolved', 'Ticket has been resolved', 4, true),
('ticket_status', 'closed', 'en', 'Closed', 'Ticket is closed', 5, true),

-- Norwegian ticket statuses
('ticket_status', 'open', 'no', 'Åpen', 'Sak er åpen', 1, true),
('ticket_status', 'in-progress', 'no', 'Pågår', 'Sak behandles', 2, true),
('ticket_status', 'waiting-user', 'no', 'Venter på bruker', 'Venter på brukerens svar', 3, true),
('ticket_status', 'resolved', 'no', 'Løst', 'Sak er løst', 4, true),
('ticket_status', 'closed', 'no', 'Lukket', 'Sak er lukket', 5, true)
ON CONFLICT (entity_type, entity_key, language_code) DO UPDATE
SET label = EXCLUDED.label, description = EXCLUDED.description, sort_order = EXCLUDED.sort_order;

-- Ticket Priority Translations
INSERT INTO localized_db_values (entity_type, entity_key, language_code, label, description, sort_order, is_active) VALUES
-- English priorities
('ticket_priority', 'low', 'en', 'Low', 'Low priority', 1, true),
('ticket_priority', 'medium', 'en', 'Medium', 'Medium priority', 2, true),
('ticket_priority', 'high', 'en', 'High', 'High priority', 3, true),
('ticket_priority', 'urgent', 'en', 'Urgent', 'Urgent priority', 4, true),

-- Norwegian priorities
('ticket_priority', 'low', 'no', 'Lav', 'Lav prioritet', 1, true),
('ticket_priority', 'medium', 'no', 'Middels', 'Middels prioritet', 2, true),
('ticket_priority', 'high', 'no', 'Høy', 'Høy prioritet', 3, true),
('ticket_priority', 'urgent', 'no', 'Haster', 'Høy prioritet', 4, true)
ON CONFLICT (entity_type, entity_key, language_code) DO UPDATE
SET label = EXCLUDED.label, description = EXCLUDED.description, sort_order = EXCLUDED.sort_order;

-- Ticket Category Translations
INSERT INTO localized_db_values (entity_type, entity_key, language_code, label, description, sort_order, is_active) VALUES
-- English categories
('ticket_category', 'booking', 'en', 'Booking', 'Booking-related issue', 1, true),
('ticket_category', 'technical', 'en', 'Technical', 'Technical issue', 2, true),
('ticket_category', 'billing', 'en', 'Billing', 'Billing-related issue', 3, true),
('ticket_category', 'feedback', 'en', 'Feedback', 'User feedback', 4, true),
('ticket_category', 'other', 'en', 'Other', 'Other issue', 5, true),

-- Norwegian categories
('ticket_category', 'booking', 'no', 'Booking', 'Booking-relatert problem', 1, true),
('ticket_category', 'technical', 'no', 'Teknisk', 'Teknisk problem', 2, true),
('ticket_category', 'billing', 'no', 'Fakturering', 'Fakturering-relatert problem', 3, true),
('ticket_category', 'feedback', 'no', 'Tilbakemelding', 'Brukertilbakemelding', 4, true),
('ticket_category', 'other', 'no', 'Annet', 'Annet problem', 5, true)
ON CONFLICT (entity_type, entity_key, language_code) DO UPDATE
SET label = EXCLUDED.label, description = EXCLUDED.description, sort_order = EXCLUDED.sort_order;

