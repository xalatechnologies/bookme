# Security Model

This document describes the security architecture and model for the Booknor application, including authentication, authorization, data access control, and security best practices.

## Overview

Booknor implements a multi-layered security model that combines:
- **Supabase Row Level Security (RLS)** for database-level access control
- **Role-Based Access Control (RBAC)** for application-level permissions
- **Client-side route protection** for UI security
- **Organization-based multi-tenancy** for data isolation

## Security Layers

### 1. Database Security (Supabase RLS)

**Primary Security Boundary**: All data access is controlled by PostgreSQL Row Level Security policies.

#### RLS Policy Structure

RLS policies are defined in Supabase migrations and enforce:
- **Organization isolation**: Users can only access data from their organization
- **Role-based permissions**: Different roles have different access levels
- **User ownership**: Users can only modify their own data (where applicable)

#### Example RLS Policies

```sql
-- Facilities: Users can read published facilities from their org
CREATE POLICY "org_read_published_facilities"
ON facilities FOR SELECT
USING (
  status = 'published' AND
  org_id IN (
    SELECT org_id FROM memberships
    WHERE user_id = auth.uid()
  )
);

-- Bookings: Users can read their own bookings
CREATE POLICY "users_read_own_bookings"
ON bookings FOR SELECT
USING (
  user_id = auth.uid() OR
  org_id IN (
    SELECT org_id FROM memberships
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'admin', 'case_handler')
  )
);

-- Memberships: Only admins can manage memberships
CREATE POLICY "admins_manage_memberships"
ON memberships FOR ALL
USING (
  org_id IN (
    SELECT org_id FROM memberships
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'admin')
  )
);
```

### 2. Authentication

**Provider**: Supabase Auth

#### Supported Authentication Methods

- **Email/Password**: Standard email and password authentication
- **Magic Links**: Passwordless email-based authentication
- **OAuth** (future): Google, Microsoft, etc.

#### Session Management

- **JWT Tokens**: Supabase issues JWT tokens for authenticated users
- **Token Refresh**: Automatic token refresh before expiration
- **Session Storage**: Tokens stored securely in browser storage
- **Logout**: Complete session cleanup on logout

#### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### 3. Authorization (RBAC)

**Implementation**: Role-based access control with hierarchical roles

#### Role Hierarchy

```
Platform Admin (system-wide)
  └─ Organization Roles:
      ├─ Owner (100)
      │   └─ Admin (80)
      │       ├─ Case Handler (60)
      │       │   └─ Read Only (20)
      │       │       └─ Customer (10)
      │       └─ Editor (40)
      │           └─ Read Only (20)
      │               └─ Customer (10)
```

#### Role Permissions

See [`ROLES_AND_PERMISSIONS.md`](./ROLES_AND_PERMISSIONS.md) for detailed role permissions.

**Key Principles**:
- Higher roles inherit permissions from lower roles
- Roles are organization-scoped (except platform admin)
- Users can have different roles in different organizations
- Role changes are logged in audit logs

### 4. Multi-Tenancy

**Model**: Organization-based multi-tenancy with shared database

#### Data Isolation

- **Organization ID**: All tenant-scoped data includes `org_id`
- **RLS Enforcement**: Policies filter by `org_id` automatically
- **Membership Verification**: User's org membership verified on every request
- **Cross-org Prevention**: Users cannot access data from other organizations

#### Organization Structure

```typescript
organizations
├── id (uuid)
├── name (text)
├── settings (jsonb)
└── created_at (timestamp)

memberships
├── id (uuid)
├── user_id (uuid) → profiles.id
├── org_id (uuid) → organizations.id
├── role (org_role enum)
└── created_at (timestamp)
```

## Security Best Practices

### 1. Input Validation

**Client-Side**:
- Form validation using React Hook Form + Zod
- Type-safe validation schemas
- User-friendly error messages

**Server-Side**:
- PostgreSQL constraints and triggers
- RLS policies prevent unauthorized access
- Input sanitization in database functions

### 2. XSS Prevention

- **React's Built-in Protection**: React escapes all values by default
- **No `dangerouslySetInnerHTML`**: Avoided unless absolutely necessary
- **Content Security Policy**: Configured in deployment
- **Sanitization**: User-generated content sanitized before rendering

### 3. CSRF Protection

- **SameSite Cookies**: Cookies set with `SameSite=Lax`
- **Token-based Auth**: JWT tokens instead of session cookies
- **Origin Validation**: API requests validate origin headers

### 4. SQL Injection Prevention

- **Parameterized Queries**: All queries use parameterized statements
- **Supabase Client**: Built-in SQL injection prevention
- **RLS Policies**: Additional layer of protection
- **No Raw SQL**: Avoid raw SQL in client code

### 5. Sensitive Data Protection

**In Transit**:
- HTTPS enforced for all connections
- TLS 1.2+ required
- Secure WebSocket connections for realtime

**At Rest**:
- Database encryption at rest (Supabase default)
- Encrypted backups
- Secure file storage (Supabase Storage)

**In Application**:
- No sensitive data in localStorage (only user preferences)
- Tokens stored securely
- No logging of sensitive information

### 6. File Upload Security

**Restrictions**:
- File type validation (images only for avatars/facilities)
- File size limits (5MB for images)
- Virus scanning (future enhancement)
- Secure storage in Supabase Storage

**Storage Policies**:
```sql
-- Only authenticated users can upload
CREATE POLICY "authenticated_upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Users can only delete their own files
CREATE POLICY "users_delete_own"
ON storage.objects FOR DELETE
TO authenticated
USING (owner = auth.uid());
```

## Security Features

### 1. Audit Logging

**What is Logged**:
- User authentication events (login, logout, failed attempts)
- Role changes and permission updates
- Data modifications (create, update, delete)
- Administrative actions
- Security-relevant events

**Log Storage**:
- Stored in `audit_logs` table
- Retention: 90 days (configurable)
- Accessible only to admins and owners

### 2. Rate Limiting

**Implementation** (future):
- Login attempts: 5 per 15 minutes
- API requests: 100 per minute per user
- File uploads: 10 per hour

### 3. Session Security

- **Session Timeout**: 24 hours of inactivity
- **Concurrent Sessions**: Allowed (can be restricted)
- **Session Invalidation**: On password change or security events
- **Remember Me**: Optional, extends session to 30 days

### 4. Two-Factor Authentication (2FA)

**Status**: Planned for future implementation

**Methods**:
- TOTP (Time-based One-Time Password)
- SMS (optional)
- Email verification codes

## Data Privacy and GDPR Compliance

### 1. Data Collection

**Personal Data Collected**:
- Name and email (required for account)
- Phone number (optional)
- Organization membership
- Booking history
- Usage analytics (anonymized)

**Legal Basis**:
- Contract performance (booking services)
- Legitimate interest (service improvement)
- Consent (optional features)

### 2. User Rights

**Right to Access**:
- Users can view all their personal data
- Export functionality available in profile settings

**Right to Erasure**:
- Account deletion available in settings
- Data anonymization after deletion
- Retention for legal requirements (bookings, payments)

**Right to Rectification**:
- Users can update their profile information
- Admins can correct data on behalf of users

**Right to Data Portability**:
- Export personal data in JSON format
- Export booking history as CSV

### 3. Data Retention

**Active Data**:
- User profiles: Until account deletion
- Bookings: 7 years (legal requirement)
- Audit logs: 90 days

**Deleted Data**:
- Soft delete for 30 days (recovery period)
- Hard delete after 30 days
- Anonymization of required retained data

## Security Incident Response

### 1. Incident Detection

**Monitoring**:
- Failed login attempts
- Unusual access patterns
- Database query anomalies
- Error rate spikes

**Alerting**:
- Email notifications for admins
- Slack/Teams integration (future)
- Dashboard alerts

### 2. Incident Response Plan

1. **Detection**: Automated monitoring and manual reports
2. **Assessment**: Determine severity and scope
3. **Containment**: Isolate affected systems
4. **Eradication**: Remove threat and vulnerabilities
5. **Recovery**: Restore normal operations
6. **Lessons Learned**: Document and improve

### 3. Breach Notification

**Timeline**:
- Internal notification: Immediate
- User notification: Within 72 hours (GDPR requirement)
- Authority notification: Within 72 hours (if required)

**Communication**:
- Email to affected users
- In-app notifications
- Public disclosure (if widespread)

## Security Testing

### 1. Automated Testing

- **Dependency Scanning**: npm audit, Snyk
- **SAST**: Static application security testing
- **Linting**: ESLint security rules
- **Type Safety**: TypeScript strict mode

### 2. Manual Testing

- **Penetration Testing**: Annual third-party assessment
- **Code Review**: Security-focused code reviews
- **Access Control Testing**: Role and permission verification
- **RLS Policy Testing**: Database-level security testing

### 3. Security Checklist

- [ ] All RLS policies tested and verified
- [ ] Role-based access control working correctly
- [ ] Input validation on all forms
- [ ] XSS prevention measures in place
- [ ] CSRF protection enabled
- [ ] HTTPS enforced
- [ ] Sensitive data encrypted
- [ ] Audit logging functional
- [ ] Session management secure
- [ ] File upload restrictions enforced

## Security Contacts

**Security Issues**:
- Report via internal security channel
- Email: security@xalatechnologies.com (if configured)
- Encrypted communication preferred

**Responsible Disclosure**:
- 90-day disclosure timeline
- Acknowledgment within 48 hours
- Coordinated disclosure process

## Security Updates

**Dependency Updates**:
- Weekly automated dependency updates
- Monthly security patch review
- Critical patches applied immediately

**Security Advisories**:
- Subscribe to Supabase security advisories
- Monitor React and npm security bulletins
- Track CVE database for used libraries

## Compliance and Standards

### Standards Followed

- **OWASP Top 10**: Protection against common vulnerabilities
- **GDPR**: EU data protection compliance
- **WCAG 2.1 AA**: Accessibility standards
- **ISO 27001**: Information security management (future)

### Certifications

- **SOC 2** (future): Service organization controls
- **ISO 27001** (future): Information security certification

## Related Documentation

- [Roles and Permissions](./ROLES_AND_PERMISSIONS.md)
- [Entity Model](../data/ENTITY_MODEL.md)
- [State Management](../dev/STATE_MANAGEMENT.md)
- [CI/CD Setup](../dev/CI_SETUP.md)

## References

- Supabase RLS: `supabase/migrations/*rls_policies*.sql`
- Role constants: `src/constants/roles.ts`
- Auth context: `src/contexts/AuthContext.tsx`
- Protected routes: `src/components/features/auth/components/ProtectedRoute.tsx`
