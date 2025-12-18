# Booknor Security Model

This document describes the security architecture of the Booknor application, focusing on multi-tenancy, Row Level Security (RLS) policies, and role-based access control.

## Multi-Tenant Architecture

Booknor implements a strict multi-tenant architecture where each organization (tenant) operates in complete isolation from others:

- **Tenant Isolation**: All data is scoped to organizations via `org_id` foreign keys
- **Cross-Tenant Protection**: Users cannot access data from organizations they don't belong to
- **Platform Administration**: Platform admins have cross-tenant access for maintenance purposes

### Core Tenancy Principles

1. **Data Segregation**: Every table containing tenant data has an `org_id` column
2. **Access Control**: All database access is controlled through RLS policies
3. **Role Enforcement**: Application-level role checking reinforces database-level security
4. **Audit Trail**: All significant actions are logged with organization context

## Role-Based Access Control (RBAC)

Booknor uses a hierarchical role system with four core roles:

### Role Hierarchy

```
Platform Admin (Super User)
│
├── Owner (Organization Owner)
│   ├── Full access to all organization resources
│   └── Can manage organization settings and billing
│
├── Admin (Organization Administrator)
│   ├── Manage facilities, bookings, users, and settings
│   └── Cannot modify organization-level settings
│
├── Staff (Operational Staff)
│   ├── Manage daily operations (bookings, availability)
│   └── Cannot modify organization structure or billing
│
└── Customer (End Users)
    ├── Create and manage their own bookings
    └── View published facilities and make reservations
```

### Role Permissions Matrix

| Resource | Owner | Admin | Staff | Customer |
|----------|-------|-------|-------|----------|
| Facilities | CRUD | CRUD | CRUD | R |
| Bookings | CRUD | CRUD | CRUD | CRUD (own) |
| Users/Roles | CRUD | CRUD | R | - |
| Organization Settings | CRUD | - | - | - |
| Billing | CRUD | - | - | - |
| Reports | R | R | R | - |
| Audit Logs | R | - | - | - |

Legend: C=Create, R=Read, U=Update, D=Delete, -=No Access

## Row Level Security (RLS) Policies

All database tables implement RLS policies to enforce tenant isolation and role-based access.

### Core RLS Principles

1. **Zero Trust**: No table allows unrestricted access (`using(true)` policies have been eliminated)
2. **Tenant Scoping**: All policies include `org_id` checks
3. **Role Validation**: Policies check user roles using helper functions
4. **Platform Override**: Platform admins can access all data for administrative purposes

### Key RLS Policies

#### Organizations Table
```sql
-- Only platform admins or organization members can read organization data
create policy org_read_scoped on organizations
for select using (
  is_platform_admin()
  or exists (
    select 1 from memberships m
    where m.org_id = id
    and m.user_id = auth.uid()
  )
);
```

#### Tags Table
```
-- Only allow reading tags associated with accessible facilities
create policy tags_read on tags for select using (
  EXISTS (
    SELECT 1 FROM facility_tags ft
    JOIN facilities f ON ft.tag_id = tags.id AND ft.facility_id = f.id
    WHERE f.status = 'published' 
       OR is_org_member(f.org_id, 'staff')
       OR is_platform_admin()
  )
);
```

#### Facilities Table
```
-- Published facilities are public; others require organization membership or platform admin
create policy facilities_read_published on facilities
for select using (status = 'published' or is_org_member(org_id, 'staff') or is_platform_admin());

-- Staff can manage facilities in their organization
create policy facilities_staff_write on facilities
for all using (is_org_staff(org_id) or is_platform_admin());
```

#### Bookings Table
```
-- Users can see their own bookings, staff can see org bookings, published facilities are public
create policy bookings_read_scoped on bookings
for select using (
  user_id = auth.uid()
  or is_org_member(org_id,'staff')
  or is_platform_admin()
  or exists (select 1 from facilities f where f.id = facility_id and f.status='published')
);
```

### Helper Functions

Booknor uses PostgreSQL functions to simplify RLS policy implementation:

- `is_platform_admin()` - Check if user is platform administrator
- `is_org_member(org_id, min_role)` - Check if user has minimum role in organization
- `is_org_staff(org_id)` - Check if user is staff member in organization
- `get_user_org_role(org_id)` - Get user's specific role in organization

## Recently Tightened Policies

### Organizations Policy (December 2025)
- **Before**: `using (true)` - Allowed anyone to read all organizations
- **After**: Scoped to organization members and platform admins
- **Impact**: Prevents enumeration of organizations by unauthorized users

### Tags Policy (December 2025)
- **Before**: `using (true)` - Allowed anyone to read all tags
- **After**: Scoped to tags associated with accessible facilities
- **Impact**: Prevents enumeration of tags and maintains data privacy

## Security Best Practices

### Application Layer
1. **Defense in Depth**: RLS policies are reinforced by application-level authorization
2. **Principle of Least Privilege**: Users only receive minimum required permissions
3. **Secure by Default**: New features implement security from the start
4. **Regular Auditing**: Security policies are reviewed and updated regularly

### Database Layer
1. **No Direct Access**: Applications connect via restricted service accounts
2. **Encrypted Connections**: All database connections use SSL/TLS
3. **Regular Backups**: Automated backups with encryption at rest
4. **Monitoring**: All database access is logged and monitored

### Authentication
1. **Multi-Factor Authentication**: Available for admin roles
2. **Session Management**: Secure session handling with timeouts
3. **Password Policies**: Strong password requirements and rotation
4. **OAuth Integration**: Support for external identity providers

## Compliance Considerations

### GDPR
- **Data Minimization**: Only collect necessary user information
- **Right to Erasure**: Support for user data deletion requests
- **Data Portability**: Ability to export user data in standard formats
- **Privacy by Design**: Security measures built into the application architecture

### SOC 2
- **Security**: Protection of system assets and data
- **Availability**: System uptime and reliability commitments
- **Processing Integrity**: Accuracy and completeness of processing
- **Confidentiality**: Protection of sensitive information
- **Privacy**: Personal information protection

## Incident Response

### Detection
- Real-time monitoring of suspicious activities
- Automated alerts for policy violations
- Regular security scanning and penetration testing

### Response
- Immediate isolation of affected systems
- Detailed incident logging and analysis
- Notification of affected parties as required
- Post-incident review and improvement

### Recovery
- Restoring from clean backups if necessary
- Implementing additional safeguards to prevent recurrence
- Updating security documentation and training materials
