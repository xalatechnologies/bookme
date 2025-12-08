# Roles and Permissions

**Version**: 1.0.0  
**Last Updated**: 2024-12-08  
**Status**: Production Ready

---

## Overview

This document describes the role-based access control (RBAC) system used in BookMe. The system implements a hierarchical role structure with four distinct roles, each granting different levels of access to system features.

---

## Role Hierarchy

The roles are organized in a hierarchy where higher-level roles inherit all permissions of lower-level roles:

```
Owner (Highest)
 ↓
Admin
 ↓
Staff
 ↓
Customer (Lowest)
```

### Role Descriptions

| Role | Description | Typical Users |
|------|-------------|---------------|
| **Owner** | Organization owner with full administrative rights | Business owners, facility managers |
| **Admin** | Administrative user with most system permissions | Office administrators, system managers |
| **Staff** | Operational user with day-to-day permissions | Receptionists, service staff |
| **Customer** | End-user with limited access | Booking customers, clients |

---

## Menu Access Rights

### Admin Dashboard Menu Structure

#### Overview Section
| Menu Item | Path | Required Role | Description |
|-----------|------|---------------|-------------|
| Dashboard | /admin/overview | Staff | Main administrative dashboard |

#### Administration Section
| Menu Item | Path | Required Role | Description |
|-----------|------|---------------|-------------|
| Rooms/Facilities | /admin/facilities | Admin | Manage facilities and zones |
| Bookings | /admin/bookings | Staff | View and manage bookings |
| Users & Roles | /admin/users-roles | Admin | Manage organization users and roles |

#### Communication Section
| Menu Item | Path | Required Role | Description |
|-----------|------|---------------|-------------|
| Messages | /admin/messages | Staff | Internal messaging system |
| Alerts | /admin/notifications | Staff | System notifications and alerts |

#### System Section
| Menu Item | Path | Required Role | Description |
|-----------|------|---------------|-------------|
| Reports | /admin/reports | Admin | System analytics and reporting |
| Integrations | /admin/integrations | Admin | Third-party integrations |
| Audit Log | /admin/audit-logs | Admin | System activity logs |
| Data Retention | /admin/data-retention | Admin | Data cleanup policies |
| Localization | /admin/localization | Admin | Language and translation settings |

---

## CRUD Operations by Role

### Facilities Management
| Operation | Customer | Staff | Admin | Owner |
|-----------|----------|-------|-------|-------|
| View facilities | ✓ | ✓ | ✓ | ✓ |
| Create facility | ✗ | ✗ | ✓ | ✓ |
| Edit facility | ✗ | ✗ | ✓ | ✓ |
| Delete facility | ✗ | ✗ | ✗ | ✓ |
| Manage zones | ✗ | ✗ | ✓ | ✓ |

### Bookings Management
| Operation | Customer | Staff | Admin | Owner |
|-----------|----------|-------|-------|-------|
| View own bookings | ✓ | ✓ | ✓ | ✓ |
| Create booking | ✓ | ✓ | ✓ | ✓ |
| Edit any booking | ✗ | ✓ | ✓ | ✓ |
| Cancel any booking | ✗ | ✓ | ✓ | ✓ |
| Delete booking | ✗ | ✓ | ✓ | ✓ |
| Bulk operations | ✗ | ✗ | ✓ | ✓ |

### User Management
| Operation | Customer | Staff | Admin | Owner |
|-----------|----------|-------|-------|-------|
| View profile | ✓ | ✓ | ✓ | ✓ |
| Edit profile | ✓ | ✓ | ✓ | ✓ |
| View users | ✗ | ✗ | ✓ | ✓ |
| Invite users | ✗ | ✗ | ✓ | ✓ |
| Edit user roles | ✗ | ✗ | ✗ | ✓ |
| Delete users | ✗ | ✗ | ✗ | ✓ |

### System Configuration
| Operation | Customer | Staff | Admin | Owner |
|-----------|----------|-------|-------|-------|
| View settings | ✗ | ✗ | ✓ | ✓ |
| Edit basic settings | ✗ | ✗ | ✓ | ✓ |
| Configure integrations | ✗ | ✗ | ✗ | ✓ |
| Manage permissions | ✗ | ✗ | ✗ | ✓ |
| System maintenance | ✗ | ✗ | ✗ | ✓ |

---

## Role Matching with RLS Policies

The role-based access control is reinforced by Row Level Security (RLS) policies in the database:

### Organizations Table
- **Owner/Admin**: Can view and manage all organization data
- **Staff**: Can only view organization data for their assigned organization
- **Customer**: Limited to their own user data within organizations

### Facilities Table
- **Owner/Admin**: Full CRUD access to all facilities in their organization
- **Staff**: Read access to facilities, limited write access
- **Customer**: Read-only access to published facilities

### Bookings Table
- **Owner/Admin**: Full access to all bookings in their organization
- **Staff**: Access to bookings for facilities they manage
- **Customer**: Access only to their own bookings

### Users Table
- **Owner/Admin**: Access to all users in their organization
- **Staff**: Limited access to user information
- **Customer**: Access only to their own profile

---

## Implementation Details

### Role Assignment
Roles are assigned through the membership system where each user can have different roles in different organizations.

### Permission Checking
Permissions are checked at multiple levels:
1. **Frontend**: Menu items and routes are filtered based on user role
2. **Backend Services**: Business logic validates user permissions
3. **Database**: RLS policies enforce data access restrictions

### Role Inheritance
Higher roles automatically inherit all permissions of lower roles:
- Owner inherits Admin, Staff, and Customer permissions
- Admin inherits Staff and Customer permissions
- Staff inherits Customer permissions

---

## Security Considerations

### Defense in Depth
The system implements multiple layers of security:
1. **UI Layer**: Role-based menu filtering
2. **Service Layer**: Permission validation in business logic
3. **Data Layer**: Database-level RLS enforcement

### Audit Trail
All role changes and administrative actions are logged for security auditing.

### Least Privilege Principle
Users are granted the minimum permissions necessary to perform their duties.

---

## Version History

- **v1.0.0** (2024-12-08): Initial roles and permissions documentation

---

**Maintained By**: BookMe Security Team  
**Questions**: Contact security@bookme.example.com
