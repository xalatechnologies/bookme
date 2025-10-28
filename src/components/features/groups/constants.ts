/**
 * Groups Domain Constants
 */

export const GROUP_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
} as const;

export const INVITATION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
} as const;

export const I18N_NAMESPACE = 'groups' as const;

export const GROUPS_I18N_KEYS = {
  TITLE: 'title',
  CREATE_GROUP: 'createGroup',
  MY_GROUPS: 'myGroups',
  MEMBERS: 'members',
  INVITATIONS: 'invitations',
} as const;

export const GROUPS_PERMISSIONS = {
  CREATE_GROUP: ['user', 'facility_manager', 'admin'],
  MANAGE_GROUP: ['owner', 'admin'],
  INVITE_MEMBERS: ['owner', 'admin'],
  REMOVE_MEMBERS: ['owner', 'admin'],
} as const;

export function hasGroupPermission(
  userRole: string,
  requiredPermission: keyof typeof GROUPS_PERMISSIONS
): boolean {
  const allowedRoles = GROUPS_PERMISSIONS[requiredPermission];
  return allowedRoles.includes(userRole as never);
}

export const GROUPS_DESIGN = {
  CARD: {
    BASE: 'bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6',
    HOVER: 'hover:shadow-md transition-shadow cursor-pointer',
  },
  ROLE_COLORS: {
    owner: 'bg-purple-100 text-purple-800',
    admin: 'bg-blue-100 text-blue-800',
    member: 'bg-gray-100 text-gray-800',
  },
} as const;

export const GROUPS_ANIMATIONS = {
  DURATION: {
    CARD_HOVER: 200,
  },
} as const;

export const GROUPS_PERFORMANCE = {
  CACHE_TIMES: {
    GROUPS_LIST: 5 * 60 * 1000,
    GROUP_DETAILS: 3 * 60 * 1000,
  },
  PAGINATION: {
    GROUPS_PER_PAGE: 12,
    MEMBERS_PER_PAGE: 20,
  },
} as const;
