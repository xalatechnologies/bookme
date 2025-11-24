"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { RequireRole } from "@/components/features/auth/components/RequireRole";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { 
  Search, 
  Filter, 
  Users, 
  Shield, 
  Plus,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Mail,
  Eye,
  MoreHorizontal,
  Check,
  X,
  Settings,
  UserPlus,
  ChevronDown,
  Clock,
  Copy,
  Key,
  Ban,
  AlertTriangle,
  Info,
  ArrowUpDown,
  User,
  Crown,
  Briefcase,
  PenTool,
  Eye as EyeIcon
} from "lucide-react";

import { supabase } from '@/lib/clients/supabase';
import type { Database } from '@/types/database';
import { useAuth } from '@/contexts/hooks/useAuth';
import { useRole } from '@/hooks/auth/useRole';
import { ORG_ROLES, getAvailableRoles, normalizeRole } from '@/constants/roles';
import { validateRoleChange } from '@/services/business/user.business.service';
import type { OrgRole } from '@/constants/roles';

interface IUser {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: string;
  readonly status: "active" | "inactive" | "invitation_sent";
  readonly lastLogin?: string;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly invitationSentAt?: string;
  readonly permissions: readonly string[];
}

interface IRole {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly userCount: number;
  readonly permissions: readonly string[];
  readonly isActive: boolean;
}

interface IUserModalProps {
  readonly user: IUser | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSave: (userData: Partial<IUser>) => void;
  readonly isEditing: boolean;
}

interface IRoleModalProps {
  readonly role: IRole | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSave: (roleData: Partial<IRole>) => void;
  readonly isEditing: boolean;
}

interface IUserRowProps {
  readonly user: IUser;
  readonly onEdit: (user: IUser) => void;
  readonly onDeactivate: (userId: string) => void;
  readonly onDelete: (userId: string) => void;
  readonly onResendInvitation: (userId: string) => void;
  readonly isSelected: boolean;
  readonly onSelect: (userId: string, selected: boolean) => void;
  readonly onRowClick: (user: IUser) => void;
}

interface IRoleRowProps {
  readonly role: IRole;
  readonly onEdit: (role: IRole) => void;
  readonly onDeactivate: (roleId: string) => void;
  readonly onViewUsers: (roleId: string) => void;
}

interface IUserActionDropdownProps {
  readonly user: IUser;
  readonly onEdit: (user: IUser) => void;
  readonly onDeactivate: (userId: string) => void;
  readonly onDelete: (userId: string) => void;
  readonly onResendInvitation: (userId: string) => void;
  readonly onResetPassword: (userId: string) => void;
}

interface IUserSidePanelProps {
  readonly user: IUser | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onEdit: (user: IUser) => void;
  readonly onDeactivate: (userId: string) => void;
  readonly onDelete: (userId: string) => void;
  readonly onResendInvitation: (userId: string) => void;
}

interface IConfirmationDialogProps {
  readonly isOpen: boolean;
  readonly title: string;
  readonly message: string;
  readonly confirmText: string;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
  readonly variant?: "danger" | "warning";
}

// Helper functions
const getInitials = (name: string): string => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const getRoleColor = (role: string): string => {
  const normalizedRole = normalizeRole(role);
  const roleColors: Record<string, string> = {
    owner: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
    admin: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    staff: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    customer: "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300"
  };
  return roleColors[normalizedRole] || roleColors.staff;
};

const getRoleIcon = (role: string): React.ComponentType<{ className?: string }> => {
  const normalizedRole = normalizeRole(role);
  const roleIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    owner: Crown,
    admin: Crown,
    staff: Briefcase,
    customer: User
  };
  return roleIcons[normalizedRole] || User;
};

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return "I dag";
  if (diffInDays === 1) return "1 dag siden";
  if (diffInDays < 7) return `${diffInDays} dager siden`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} uker siden`;
  return `${Math.floor(diffInDays / 30)} måneder siden`;
};

const getLastActivity = (user: IUser): string => {
  if (user.lastLogin) {
    return `Sist innlogget: ${formatTimeAgo(user.lastLogin)}`;
  } else if (user.invitationSentAt && user.invitationSentAt !== user.createdAt) {
    // Only show invitation sent if it's different from creation date
    return `Sent invitasjon: ${formatTimeAgo(user.invitationSentAt)}`;
  } else {
    // Fallback to showing invitation sent even if it's the same as creation date
    return `Sent invitasjon: ${formatTimeAgo(user.createdAt)}`;
  }
};

const getStatusColor = (status: IUser["status"]): string => {
  return status === "active" || status === "invitation_sent" ? 
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : 
    "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
};

const getStatusText = (status: IUser["status"]): string => {
  return status === "active" ? "Aktiv" : status === "inactive" ? "Inaktiv" : "Invitasjon sendt";
};

const UserActionDropdown = ({ user, onEdit, onDeactivate, onDelete, onResendInvitation, onResetPassword }: IUserActionDropdownProps): JSX.Element => {
  const { t } = useTranslation(["admin", "common"]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 w-8 p-0"
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
          <div className="py-1">
            <button
              onClick={() => {
                onEdit(user);
                setIsOpen(false);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Edit className="h-4 w-4 mr-2" />
              {t('pages.users_roles.actions.edit_role')}
            </button>
            <button
              onClick={() => {
                onResetPassword(user.id);
                setIsOpen(false);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Key className="h-4 w-4 mr-2" />
              {t('pages.users_roles.actions.reset_password')}
            </button>
            {user.status === "invitation_sent" && (
              <button
                onClick={() => {
                  onResendInvitation(user.id);
                  setIsOpen(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Mail className="h-4 w-4 mr-2" />
                {t('pages.users_roles.actions.resend_invitation')}
              </button>
            )}
            <button
              onClick={() => {
                onDeactivate(user.id);
                setIsOpen(false);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Ban className="h-4 w-4 mr-2" />
              {t('pages.users_roles.actions.remove_access')}
            </button>
            {user.status === "invitation_sent" && (
              <button
                onClick={() => {
                  onDelete(user.id);
                  setIsOpen(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t('pages.users_roles.actions.delete_user')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const UserModal = ({ user, isOpen, onClose, onSave, isEditing }: IUserModalProps): JSX.Element => {
  const { t } = useTranslation(["admin", "common"]);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "",
    status: user?.status || "active"
  });

  React.useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      });
    } else {
      setFormData({
        name: "",
        email: "",
        role: "",
        status: "active"
      });
    }
  }, [user]);

  const handleSave = (): void => {
    onSave(formData);
    onClose();
  };

  if (!isOpen) return <></>;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {isEditing ? t('pages.users_roles.modals.user.title_edit') : t('pages.users_roles.modals.user.title_new')}
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('pages.users_roles.modals.user.name_label')}
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('pages.users_roles.modals.user.name_placeholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('pages.users_roles.modals.user.email_label')}
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={t('pages.users_roles.modals.user.email_placeholder')}
                disabled={isEditing}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('pages.users_roles.modals.user.role_label')}
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">{t('pages.users_roles.modals.user.role_placeholder')}</option>
                <option value={ORG_ROLES.OWNER}>{t('roles.owner', 'Owner')}</option>
                <option value={ORG_ROLES.ADMIN}>{t('roles.admin', 'Administrator')}</option>
                <option value={ORG_ROLES.STAFF}>{t('roles.staff', 'Staff')}</option>
                <option value={ORG_ROLES.CUSTOMER}>{t('roles.customer', 'Customer')}</option>
              </select>
            </div>

            {isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('pages.users_roles.modals.user.status_label')}
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as IUser["status"] })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="active">{t('pages.users_roles.filters.status_active')}</option>
                  <option value="inactive">{t('pages.users_roles.filters.status_inactive')}</option>
                  <option value="invitation_sent">{t('pages.users_roles.filters.status_invitation_sent')}</option>
                </select>
              </div>
            )}

            {isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('pages.users_roles.modals.user.permissions_label')}
                </label>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {user?.permissions.join(", ") || t('pages.users_roles.modals.user.no_permissions')}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="outline" onClick={onClose}>
              {t('pages.users_roles.modals.user.cancel')}
            </Button>
            <Button onClick={handleSave}>
              {isEditing ? t('pages.users_roles.modals.user.save') : t('pages.users_roles.modals.user.send_invitation')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const RoleModal = ({ role, isOpen, onClose, onSave, isEditing }: IRoleModalProps): JSX.Element => {
  const { t } = useTranslation(["admin", "common"]);
  const [formData, setFormData] = useState({
    name: role?.name || "",
    description: role?.description || "",
    permissions: role?.permissions || [],
    isActive: role?.isActive ?? true
  });

  React.useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description,
        permissions: role.permissions,
        isActive: role.isActive
      });
    } else {
      setFormData({
        name: "",
        description: "",
        permissions: [],
        isActive: true
      });
    }
  }, [role]);

  const permissionGroups = [
    {
      group: t('pages.users_roles.permissions.facilities'),
      permissions: [
        { id: "facilities.create", label: t('pages.users_roles.permissions.facilities_create') },
        { id: "facilities.edit", label: t('pages.users_roles.permissions.facilities_edit') },
        { id: "facilities.publish", label: t('pages.users_roles.permissions.facilities_publish') },
        { id: "facilities.delete", label: t('pages.users_roles.permissions.facilities_delete') }
      ]
    },
    {
      group: t('pages.users_roles.permissions.bookings'),
      permissions: [
        { id: "bookings.view", label: t('pages.users_roles.permissions.bookings_view') },
        { id: "bookings.approve", label: t('pages.users_roles.permissions.bookings_approve') },
        { id: "bookings.reject", label: t('pages.users_roles.permissions.bookings_reject') }
      ]
    },
    {
      group: t('pages.users_roles.permissions.reports'),
      permissions: [
        { id: "reports.view", label: t('pages.users_roles.permissions.reports_view') },
        { id: "reports.export", label: t('pages.users_roles.permissions.reports_export') }
      ]
    }
  ];

  const handlePermissionChange = (permissionId: string, checked: boolean): void => {
    const newPermissions = checked
      ? [...formData.permissions, permissionId]
      : formData.permissions.filter(p => p !== permissionId);
    
    setFormData({ ...formData, permissions: newPermissions });
  };

  const handleSave = (): void => {
    onSave({ ...formData, isActive: formData.isActive });
    onClose();
  };

  if (!isOpen) return <></>;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {isEditing ? t('pages.users_roles.modals.role.title_edit') : t('pages.users_roles.modals.role.title_new')}
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('pages.users_roles.modals.role.name_label')}
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('pages.users_roles.modals.role.name_placeholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('pages.users_roles.modals.role.description_label')}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('pages.users_roles.modals.role.description_placeholder')}
                className="w-full px-33 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {t('pages.users_roles.modals.role.permissions_label')}
              </label>
              <div className="space-y-4">
                {permissionGroups.map(group => (
                  <div key={group.group} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">{group.group}</h4>
                    <div className="space-y-2">
                      {group.permissions.map(permission => (
                        <label key={permission.id} className="flex items-center space-x-2">
                          <Checkbox
                            checked={formData.permissions.includes(permission.id)}
                            onCheckedChange={(checked) => handlePermissionChange(permission.id, !!checked)}
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{permission.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <Checkbox
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: !!checked })}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{t('pages.users_roles.table.status_badges.active')}</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="outline" onClick={onClose}>
              {t('pages.users_roles.modals.role.cancel')}
            </Button>
            <Button onClick={handleSave}>
              {isEditing ? t('pages.users_roles.modals.role.save') : t('pages.users_roles.modals.role.create')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserRow = ({ user, onEdit, onDeactivate, onDelete, onResendInvitation, isSelected, onSelect, onRowClick }: IUserRowProps): JSX.Element => {
  const { t } = useTranslation(["admin", "common"]);

  return (
    <tr 
      className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer ${
        isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
      }`}
      onClick={() => onRowClick(user)}
    >
      <td className="px-6 py-4">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => {
            onSelect(user.id, !!checked);
          }}
        />
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-300">
            {getInitials(user.name)}
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <Badge className={getRoleColor(user.role)}>
          {React.createElement(getRoleIcon(user.role), { className: "h-3 w-3 mr-1" })}
          {user.role}
        </Badge>
      </td>
      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
        {getLastActivity(user)}
      </td>
      <td className="px-6 py-4">
        <Badge className={getStatusColor(user.status)}>
          {user.status === 'active' ? t('pages.users_roles.table.status_badges.active') : user.status === 'inactive' ? t('pages.users_roles.table.status_badges.inactive') : t('pages.users_roles.table.status_badges.invitation_sent')}
        </Badge>
      </td>
      <td className="px-6 py-4">
        <UserActionDropdown
          user={user}
          onEdit={onEdit}
          onDeactivate={onDeactivate}
          onDelete={onDelete}
          onResendInvitation={onResendInvitation}
          onResetPassword={() => {}}
        />
      </td>
    </tr>
  );
};

const RoleRow = ({ role, onEdit, onDeactivate, onViewUsers }: IRoleRowProps): JSX.Element => {
  const { t } = useTranslation(["admin", "common"]);
  // Format permissions for display
  const formatPermissions = (permissions: readonly string[]): string => {
    if (permissions.includes("all")) {
      // Instead of showing "All modules", show the three specific modules
      return t('pages.users_roles.permissions.facilities') + ", " + 
             t('pages.users_roles.permissions.bookings') + ", " + 
             t('pages.users_roles.permissions.reports');
    }
    
    const permissionMap: Record<string, string> = {
      "facilities": t('pages.users_roles.permissions.facilities'),
      "bookings": t('pages.users_roles.permissions.bookings'),
      "reports": t('pages.users_roles.permissions.reports'),
      "users": t('pages.users_roles.table.user')
    };
    
    const modules = new Set<string>();
    permissions.forEach(permission => {
      const module = permission.split(".")[0];
      if (module in permissionMap) {
        modules.add(permissionMap[module]);
      }
    });
    
    return modules.size > 0 ? Array.from(modules).join(", ") : t('pages.users_roles.modals.user.no_permissions');
  };

  return (
    <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
      <td className="px-6 py-4">
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{role.name}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{role.description}</div>
        </div>
      </td>
      <td className="px-6 py-4">
        <Badge variant="outline">{t('pages.users_roles.table.users_count', { count: role.userCount })}</Badge>
      </td>
      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
        {formatPermissions(role.permissions)}
      </td>
      <td className="px-6 py-4">
        <Badge className={role.isActive ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"}>
          {role.isActive ? t('pages.users_roles.table.status_badges.active') : t('pages.users_roles.table.status_badges.inactive')}
        </Badge>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(role)}
          >
            <Edit className="h-4 w-4 mr-1" />
            {t('pages.users_roles.actions.edit')}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewUsers(role.id)}
          >
            <Eye className="h-4 w-4 mr-1" />
            {t('pages.users_roles.actions.view_users')}
          </Button>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {role.isActive ? t('pages.users_roles.table.status_badges.active') : t('pages.users_roles.table.status_badges.inactive')}
            </span>
            <Switch
              checked={role.isActive}
              onCheckedChange={() => onDeactivate(role.id)}
            />
          </div>
        </div>
      </td>
    </tr>
  );
};

const UserSidePanel = ({ user, isOpen, onClose, onEdit, onDeactivate, onDelete, onResendInvitation }: IUserSidePanelProps): JSX.Element => {
  const { t } = useTranslation(["admin", "common"]);
  if (!isOpen || !user) return <></>;

  const handleDeactivate = (): void => {
    if (window.confirm(t('pages.users_roles.confirmations.deactivate_user'))) {
      onDeactivate(user.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-xl overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t('pages.users_roles.modals.user.title_edit')}
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-xl font-medium text-gray-600 dark:text-gray-300">
                {getInitials(user.name)}
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{user.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Rolle</p>
                <Badge className={getRoleColor(user.role)}>
                  {React.createElement(getRoleIcon(user.role), { className: "h-3 w-3 mr-1" })}
                  {user.role}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                <Badge className={getStatusColor(user.status)}>
                  {user.status === 'active' ? t('pages.users_roles.table.status_badges.active') : user.status === 'inactive' ? t('pages.users_roles.table.status_badges.inactive') : t('pages.users_roles.table.status_badges.invitation_sent')}
                </Badge>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Sist aktivitet</p>
              <p className="text-gray-900 dark:text-white">{getLastActivity(user)}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Opprettet av</p>
              <p className="text-gray-900 dark:text-white">{user.createdBy}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Opprettet</p>
              <p className="text-gray-900 dark:text-white">{new Date(user.createdAt).toLocaleDateString('nb-NO')}</p>
            </div>

            {user.lastLogin && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Sist innlogget</p>
                <p className="text-gray-900 dark:text-white">{new Date(user.lastLogin).toLocaleString('nb-NO')}</p>
              </div>
            )}

            {user.invitationSentAt && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('pages.users_roles.table.status_badges.invitation_sent')}</p>
                <p className="text-gray-900 dark:text-white">{new Date(user.invitationSentAt).toLocaleString('nb-NO')}</p>
              </div>
            )}

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Handlinger</h4>
              <div className="space-y-2">
                <Button 
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => {
                    onEdit(user);
                    onClose();
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {t('pages.users_roles.actions.edit')}
                </Button>
                {user.status === "invitation_sent" && (
                  <Button 
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => {
                      onResendInvitation(user.id);
                      onClose();
                    }}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    {t('pages.users_roles.actions.resend_invitation')}
                  </Button>
                )}
                <Button 
                  className="w-full justify-start"
                  variant="outline"
                  onClick={handleDeactivate}
                >
                  <Ban className="h-4 w-4 mr-2" />
                  {t('pages.users_roles.actions.deactivate')}
                </Button>
                {user.status === "invitation_sent" && (
                  <Button 
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => {
                      if (window.confirm(t('pages.users_roles.confirmations.delete_user'))) {
                        onDelete(user.id);
                        onClose();
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t('pages.users_roles.actions.delete_user')}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const UsersRolesPage = (): JSX.Element => {
  const { t } = useTranslation(["admin", "common"]);
  const { currentOrgId, user: currentUser } = useAuth();
  const { role: currentUserRole } = useRole(currentOrgId || undefined);
  const [searchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [userModal, setUserModal] = useState<{ isOpen: boolean; user: IUser | null; isEditing: boolean }>({
    isOpen: false,
    user: null,
    isEditing: false
  });
  const [roleModal, setRoleModal] = useState<{ isOpen: boolean; role: IRole | null; isEditing: boolean }>({
    isOpen: false,
    role: null,
    isEditing: false
  });
  const [sidePanel, setSidePanel] = useState<{ isOpen: boolean; user: IUser | null }>({
    isOpen: false,
    user: null
  });
  const [users, setUsers] = useState<readonly IUser[]>([]);
  const [roles, setRoles] = useState<readonly IRole[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize filters from URL query parameters
  useEffect(() => {
    const filterParam = searchParams.get('filter');
    if (filterParam === 'no-role') {
      // Show all users when filter=no-role
      setRoleFilter('all');
    } else if (filterParam && filterParam !== null) {
      // Set role filter if a specific role is provided
      setRoleFilter(filterParam);
    }
  }, [searchParams]);

  // Fetch users and roles from Supabase
  useEffect(() => {
    const fetchData = async () => {
      if (!currentOrgId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // First fetch ALL memberships for the current organization (we'll filter customers later)
        // This helps us debug what roles are actually in the database
        const { data: membershipsData, error: membershipsError } = await supabase
          .from('memberships')
          .select('user_id, org_id, role, created_at')
          .eq('org_id', currentOrgId);

        // Fetch last login information for all users
        let lastLoginData: { actor_id: string; created_at: string }[] | null = null;
        if (membershipsData && membershipsData.length > 0) {
          try {
            const userIds = membershipsData.map(m => m.user_id);
            const { data, error } = await supabase
              .from('audit_events')
              .select('actor_id, created_at')
              .eq('action', 'user_login')
              .in('actor_id', userIds)
              .order('created_at', { ascending: false });
            
            if (!error && data) {
              // Get the most recent login for each user
              const latestLogins = new Map<string, string>();
              data.forEach(event => {
                // Skip events with null actor_id
                if (event.actor_id && !latestLogins.has(event.actor_id)) {
                  latestLogins.set(event.actor_id, event.created_at);
                }
              });
              lastLoginData = Array.from(latestLogins.entries()).map(([actor_id, created_at]) => ({
                actor_id,
                created_at
              }));
            } else if (error) {
              console.warn('Could not fetch last login data from audit_events (might be due to permissions):', error);
              
              // Fallback to localStorage if we can't fetch from database
              const localStorageLogins = new Map<string, string>();
              userIds.forEach(userId => {
                const lastLogin = localStorage.getItem(`last_login_${userId}`);
                if (lastLogin) {
                  localStorageLogins.set(userId, lastLogin);
                }
              });
              
              if (localStorageLogins.size > 0) {
                lastLoginData = Array.from(localStorageLogins.entries()).map(([actor_id, created_at]) => ({
                  actor_id,
                  created_at
                }));
              }
            }
          } catch (error) {
            console.warn('Error fetching last login data:', error);
            
            // Fallback to localStorage if we get an error
            const userIds = membershipsData.map(m => m.user_id);
            const localStorageLogins = new Map<string, string>();
            userIds.forEach(userId => {
              const lastLogin = localStorage.getItem(`last_login_${userId}`);
              if (lastLogin) {
                localStorageLogins.set(userId, lastLogin);
              }
            });
            
            if (localStorageLogins.size > 0) {
              lastLoginData = Array.from(localStorageLogins.entries()).map(([actor_id, created_at]) => ({
                actor_id,
                created_at
              }));
            }
          }
        }

        if (membershipsError) {
          throw new Error(membershipsError.message);
        }

        console.log('ALL memberships (before filtering):', membershipsData?.length || 0);
        console.log('ALL memberships data:', JSON.stringify(membershipsData, null, 2));

        console.log('Memberships fetched:', membershipsData?.length || 0);
        console.log('Memberships data:', JSON.stringify(membershipsData, null, 2));
        
        // Log all unique roles found
        const uniqueRoles = new Set(membershipsData?.map(m => m.role) || []);
        console.log('Unique roles in memberships:', Array.from(uniqueRoles));

        // Create a map of last login data for quick lookup
        const lastLoginMap = new Map(lastLoginData?.map(login => [login.actor_id, login.created_at]) || []);

        // Also fetch profiles by default_org to catch users who might not have explicit memberships
        const { data: profilesByDefaultOrg, error: profilesByOrgError } = await supabase
          .from('profiles')
          .select('*')
          .eq('default_org', currentOrgId);

        if (profilesByOrgError) {
          console.warn('Error fetching profiles by default_org:', profilesByOrgError);
        }

        console.log('Profiles by default_org:', profilesByDefaultOrg?.length || 0);

        // Extract user IDs from memberships
        const userIdsFromMemberships = membershipsData?.map(membership => membership.user_id) || [];
        const userIdsFromProfiles = profilesByDefaultOrg?.map(profile => profile.user_id) || [];
        
        // Combine and deduplicate user IDs
        const allUserIds = Array.from(new Set([...userIdsFromMemberships, ...userIdsFromProfiles]));

        console.log('All user IDs to fetch:', allUserIds.length, allUserIds);

        // Then fetch profiles for those users
        let usersData: Database['public']['Tables']['profiles']['Row'][] | null = [];
        if (allUserIds.length > 0) {
          const { data, error: profilesError } = await supabase
            .from('profiles')
            .select('*')
            .in('user_id', allUserIds);

          if (profilesError) {
            throw new Error(profilesError.message);
          }
          usersData = data || [];
          console.log('Profiles fetched:', usersData.length);
        }

        // Combine profiles with memberships
        // Create a map of memberships for quick lookup (use original role from DB)
        const membershipMap = new Map(
          (membershipsData || []).map(m => [m.user_id, m.role])
        );

        console.log('Membership map size:', membershipMap.size);
        console.log('Membership map entries:', Array.from(membershipMap.entries()));

        const transformedUsers: IUser[] = (usersData as Database['public']['Tables']['profiles']['Row'][]).map(profile => {
          // Get role from membership
          let role = membershipMap.get(profile.user_id);
          
          console.log(`Processing profile ${profile.user_id} (${profile.email}): role from membership = ${role}`);
          
          // If user doesn't have a membership but has default_org set, 
          // try to infer role from email
          if (!role) {
            // Check if user has default_org set (they're part of the organization)
            const hasDefaultOrg = profile.default_org === currentOrgId;
            
            if (hasDefaultOrg) {
              // Try to infer role from email (for users that should have memberships but don't)
              const emailLower = (profile.email || '').toLowerCase();
              if (emailLower.includes('owner') || emailLower.includes('eier')) {
                role = 'owner';
                console.log(`  -> Inferred role 'owner' from email`);
              } else if (emailLower.includes('admin') || emailLower.includes('administrator')) {
                role = 'admin';
                console.log(`  -> Inferred role 'admin' from email`);
              } else if (emailLower.includes('staff') || emailLower.includes('saksbehandler') || emailLower.includes('case')) {
                role = 'staff';
                console.log(`  -> Inferred role 'staff' from email`);
              } else {
                // If we can't infer a role and they don't have a membership,
                // they might be a customer who shouldn't be in the admin UI
                console.log(`  -> Cannot infer role, skipping user without explicit membership`);
                return null;
              }
            } else {
              // User doesn't have default_org set and no membership - skip them
              console.log(`  -> Skipping: no membership and no default_org`);
              return null;
            }
          }
          
          // Use the original role from database (don't normalize for storage, only for comparison)
          const normalizedRole = normalizeRole(role);
          console.log(`  -> Original role: ${role}, normalized: ${normalizedRole}`);
          
          // Exclude customers from the users list - only show admin, owner, staff, etc.
          if (normalizedRole === 'customer') {
            console.log(`  -> Skipping: customer role`);
            return null;
          }
          
          console.log(`  -> Including user with role: ${role}`);
          
          // Find membership data for this user to get additional information
          const userMembership = membershipsData?.find(m => m.user_id === profile.user_id);
          
          return {
            id: profile.user_id,
            name: profile.display_name || profile.email || 'Unknown User',
            email: profile.email || '',
            role: role, // Store original role from DB
            status: 'active', // TODO: Implement proper status handling
            lastLogin: lastLoginMap.get(profile.user_id), // Get actual last login time
            invitationSentAt: userMembership?.created_at, // Use membership creation date as invitation sent date
            createdAt: profile.created_at,
            createdBy: 'System', // TODO: Implement proper creator tracking
            // Set permissions based on role
            permissions: getPermissionsForRole(role)
          };
        }).filter((user): user is Exclude<typeof user, null> => user !== null) as IUser[];

        console.log('Transformed users count:', transformedUsers.length);
        console.log('Transformed users:', transformedUsers.map(u => ({ id: u.id, email: u.email, role: u.role })));

        // Fetch roles from constants - only the organizational roles (excluding customers)
        const orgRoles = [
          { id: ORG_ROLES.OWNER, name: t('roles.owner', 'Eier'), description: t('roles.descriptions.owner', 'Full tilgang til hele organisasjonen') },
          { id: ORG_ROLES.ADMIN, name: t('roles.admin', 'Administrator'), description: t('roles.descriptions.admin', 'Full tilgang til organisasjonen') },
          { id: ORG_ROLES.STAFF, name: t('roles.staff', 'Ansatt'), description: t('roles.descriptions.staff', 'Operasjonell rolle for håndtering av bookinger og oppgaver') }
        ];

        // Transform roles to match our interface with proper permissions
        const transformedRoles: IRole[] = orgRoles.map(role => ({
          id: role.id,
          name: role.name as string,
          description: role.description,
          userCount: transformedUsers.filter(u => u.role === role.id).length,
          // Set permissions based on role
          permissions: getPermissionsForRole(role.id),
          isActive: true
        }));

        setUsers(transformedUsers);
        setRoles(transformedRoles);
      } catch (err: any) {
        console.error('Failed to fetch data:', err);
        setError(err.message || 'Failed to load users and roles');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentOrgId]);

  // Helper function to get permissions based on role
  const getPermissionsForRole = (role: string): string[] => {
    const normalizedRole = normalizeRole(role);
    
    switch (normalizedRole) {
      case 'owner':
      case 'admin':
        // Owners and admins have all permissions
        return [
          "facilities.create", "facilities.edit", "facilities.publish", "facilities.delete",
          "bookings.view", "bookings.approve", "bookings.reject",
          "reports.view", "reports.export"
        ];
      case 'staff':
        // Staff can view and manage bookings, but limited facility access
        return [
          "facilities.view", "facilities.edit",
          "bookings.view", "bookings.approve", "bookings.reject",
          "reports.view"
        ];
      case 'customer':
        // Customers can view facilities and create bookings
        return [
          "facilities.view",
          "bookings.view", "bookings.create"
        ];
      default:
        // Default to read-only permissions
        return [
          "facilities.view",
          "bookings.view",
          "reports.view"
        ];
    }
  };

  const filteredUsers = useMemo(() => {
    let filtered = users;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query)
      );
    }

    // Filter by role
    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    return filtered;
  }, [users, searchQuery, roleFilter, statusFilter]);

  const handleNewUser = (): void => {
    setUserModal({ isOpen: true, user: null, isEditing: false });
  };

  const handleEditUser = (user: IUser): void => {
    setUserModal({ isOpen: true, user, isEditing: true });
  };

  const handleNewRole = (): void => {
    setRoleModal({ isOpen: true, role: null, isEditing: false });
  };

  const handleEditRole = (role: IRole): void => {
    setRoleModal({ isOpen: true, role, isEditing: true });
  };

  const handleSaveUser = async (userData: Partial<IUser>): Promise<void> => {
    try {
      if (!currentOrgId || !currentUser || !currentUserRole) {
        throw new Error('No organization selected or user not authenticated');
      }

      if (userModal.isEditing && userModal.user) {
        // Validate role change
        const newRole = normalizeRole(userData.role || 'customer') as OrgRole;
        const validation = validateRoleChange(
          currentUserRole as OrgRole,
          userModal.user.id,
          currentUser.id,
          newRole
        );

        if (!validation.canChange) {
          alert(validation.reason || 'Cannot change role');
          return;
        }

        // Update existing user
        const { error } = await supabase
          .from('memberships')
          .update({ role: newRole as Database['public']['Enums']['org_role'] })
          .eq('user_id', userModal.user.id)
          .eq('org_id', currentOrgId);

        if (error) {
          throw new Error(error.message);
        }

        // Refresh the data
        // Trigger a re-fetch of the data
        const { data: membershipsData, error: membershipsError } = await supabase
          .from('memberships')
          .select('user_id, org_id, role, created_at')
          .eq('org_id', currentOrgId);

        // Fetch last login information for all users
        let lastLoginData: { actor_id: string; created_at: string }[] | null = null;
        if (membershipsData && membershipsData.length > 0) {
          try {
            const userIds = membershipsData.map(m => m.user_id);
            const { data, error } = await supabase
              .from('audit_events')
              .select('actor_id, created_at')
              .eq('action', 'user_login')
              .in('actor_id', userIds)
              .order('created_at', { ascending: false });
              
            if (!error && data) {
              // Get the most recent login for each user
              const latestLogins = new Map<string, string>();
              data.forEach(event => {
                // Skip events with null actor_id
                if (event.actor_id && !latestLogins.has(event.actor_id)) {
                  latestLogins.set(event.actor_id, event.created_at);
                }
              });
              lastLoginData = Array.from(latestLogins.entries()).map(([actor_id, created_at]) => ({
                actor_id,
                created_at
              }));
            } else if (error) {
              console.warn('Could not fetch last login data from audit_events (might be due to permissions):', error);
            }
          } catch (error) {
            console.warn('Error fetching last login data:', error);
          }
        }

        // Create a map of last login data for quick lookup
        const lastLoginMap = new Map(lastLoginData?.map(login => [login.actor_id, login.created_at]) || []);

        if (membershipsError) {
          throw new Error(membershipsError.message);
        }

        // Extract user IDs from memberships
        const userIds = membershipsData.map(membership => membership.user_id);

        // Then fetch profiles for those users
        let usersData: Database['public']['Tables']['profiles']['Row'][] | null = [];
        if (userIds.length > 0) {
          const { data, error: profilesError } = await supabase
            .from('profiles')
            .select('*')
            .in('user_id', userIds);

          if (profilesError) {
            throw new Error(profilesError.message);
          }
          usersData = data || [];
        }

        // Combine profiles with memberships
        const membershipMap = new Map(
          (membershipsData || []).map(m => [m.user_id, m.role])
        );

        const transformedUsers: IUser[] = (usersData as Database['public']['Tables']['profiles']['Row'][]).map(profile => {
          const role = membershipMap.get(profile.user_id);
          
          // Skip users without a membership or with customer role
          if (!role) {
            return null;
          }
          
          const normalizedRole = normalizeRole(role);
          
          // Exclude customers from the users list - only show admin, owner, staff, etc.
          if (normalizedRole === 'customer') {
            return null;
          }
          
          return {
            id: profile.user_id,
            name: profile.display_name || profile.email || 'Unknown User',
            email: profile.email || '',
            role: role,
            status: 'active',
            lastLogin: lastLoginMap.get(profile.user_id), // Get actual last login time
            invitationSentAt: membershipsData.find(m => m.user_id === profile.user_id)?.created_at, // Use membership creation date as invitation sent date
            createdAt: profile.created_at,
            createdBy: 'System',
            // Set permissions based on role
            permissions: getPermissionsForRole(role)
          };
        }).filter((user): user is Exclude<typeof user, null> => user !== null) as IUser[];

        setUsers(transformedUsers);
        alert(t('pages.users_roles.confirmations.user_updated'));
      } else {
        // Create new user - in a real implementation, this would involve:
        // 1. Creating/inviting the user
        // 2. Creating a profile
        // 3. Creating a membership
        alert(t('pages.users_roles.confirmations.invitation_resent'));
      }
    } catch (error: any) {
      console.error('Failed to save user:', error);
      alert(error.message || t('pages.users_roles.confirmations.error_save'));
    }
  };

  const handleSaveRole = async (roleData: Partial<IRole>): Promise<void> => {
    try {
      // Since roles are defined by the org_role enum, we can't create new roles
      // We can only update role descriptions or metadata if we had a roles table
      if (roleModal.isEditing && roleModal.role) {
        // Update existing role - this would require a roles table
        alert(t('pages.users_roles.confirmations.role_updated'));
      } else {
        // Create new role - this would require a roles table
        alert(t('pages.users_roles.confirmations.role_created'));
      }
      
      // Refresh roles data - all available organization roles
      const orgRoles = [
        { id: ORG_ROLES.OWNER, name: t('roles.owner', 'Eier'), description: t('roles.descriptions.owner', 'Full tilgang til hele organisasjonen') },
        { id: ORG_ROLES.ADMIN, name: t('roles.admin', 'Administrator'), description: t('roles.descriptions.admin', 'Full tilgang til organisasjonen') },
        { id: ORG_ROLES.CASE_HANDLER, name: t('roles.case_handler', 'Saksbehandler'), description: t('roles.descriptions.case_handler', 'Hovedoperasjonell rolle for håndtering av bookinger') },
        { id: ORG_ROLES.EDITOR, name: t('roles.editor', 'Redaktør'), description: t('roles.descriptions.editor', 'Innholdsbehandlingsrolle') },
        { id: ORG_ROLES.READ_ONLY, name: t('roles.read_only', 'Kun lesing'), description: t('roles.descriptions.read_only', 'Skrivebeskyttet tilgang') },
        { id: ORG_ROLES.CUSTOMER, name: t('roles.customer', 'Kunde'), description: t('roles.descriptions.customer', 'Standard kundetilgang') },
        { id: ORG_ROLES.STAFF, name: t('roles.staff_deprecated', 'Ansatt (avviklet)'), description: t('roles.descriptions.staff_deprecated', 'Avviklet rolle - kartlegges til saksbehandler') }
      ];

      // Transform roles to match our interface with proper permissions
      const transformedRoles: IRole[] = orgRoles.map(role => ({
        id: role.id,
        name: role.name as string,
        description: role.description,
        userCount: users.filter(u => u.role === role.id).length,
        // Set permissions based on role
        permissions: getPermissionsForRole(role.id),
        isActive: true
      }));

      setRoles(transformedRoles);
    } catch (error) {
      console.error('Failed to save role:', error);
      alert(t('pages.users_roles.confirmations.error_save'));
    }
  };

  const handleDeactivateRole = async (roleId: string): Promise<void> => {
    try {
      // In a real implementation, we would update the role's status
      alert(t('pages.users_roles.confirmations.role_status_changed'));
      
      // Refresh roles data - all available organization roles
      const orgRoles = [
        { id: ORG_ROLES.OWNER, name: t('roles.owner', 'Eier'), description: t('roles.descriptions.owner', 'Full tilgang til hele organisasjonen') },
        { id: ORG_ROLES.ADMIN, name: t('roles.admin', 'Administrator'), description: t('roles.descriptions.admin', 'Full tilgang til organisasjonen') },
        { id: ORG_ROLES.CASE_HANDLER, name: t('roles.case_handler', 'Saksbehandler'), description: t('roles.descriptions.case_handler', 'Hovedoperasjonell rolle for håndtering av bookinger') },
        { id: ORG_ROLES.EDITOR, name: t('roles.editor', 'Redaktør'), description: t('roles.descriptions.editor', 'Innholdsbehandlingsrolle') },
        { id: ORG_ROLES.READ_ONLY, name: t('roles.read_only', 'Kun lesing'), description: t('roles.descriptions.read_only', 'Skrivebeskyttet tilgang') },
        { id: ORG_ROLES.CUSTOMER, name: t('roles.customer', 'Kunde'), description: t('roles.descriptions.customer', 'Standard kundetilgang') },
        { id: ORG_ROLES.STAFF, name: t('roles.staff_deprecated', 'Ansatt (avviklet)'), description: t('roles.descriptions.staff_deprecated', 'Avviklet rolle - kartlegges til saksbehandler') }
      ];

      // Transform roles to match our interface with proper permissions
      const transformedRoles: IRole[] = orgRoles.map(role => ({
        id: role.id,
        name: role.name as string,
        description: role.description,
        userCount: users.filter(u => u.role === role.id).length,
        // Set permissions based on role
        permissions: getPermissionsForRole(role.id),
        isActive: role.id !== roleId // Toggle the active status for the selected role
      }));

      setRoles(transformedRoles);
    } catch (error) {
      console.error('Failed to toggle role status:', error);
      alert(t('pages.users_roles.confirmations.error_role_status'));
    }
  };

  const handleResendInvitation = async (userId: string): Promise<void> => {
    try {
      // In a real implementation, we would resend the user invitation
      // For now, we'll just show a success message
      alert(t('pages.users_roles.confirmations.invitation_resent'));
    } catch (error) {
      console.error('Failed to resend invitation:', error);
      alert(t('pages.users_roles.confirmations.error_invitation'));
    }
  };

  const handleDeactivateUser = async (userId: string): Promise<void> => {
    if (window.confirm(t('pages.users_roles.confirmations.deactivate_user'))) {
      try {
        if (!currentOrgId) {
          throw new Error('No organization selected');
        }

        // Remove user's membership (deactivate access)
        const { error } = await supabase
          .from('memberships')
          .delete()
          .eq('user_id', userId)
          .eq('org_id', currentOrgId);

        if (error) {
          throw new Error(error.message);
        }

        // Refresh the data
        if (currentOrgId) {
          // First fetch memberships for the current organization
          const { data: membershipsData, error: membershipsError } = await supabase
            .from('memberships')
            .select('user_id, org_id, role, created_at')
            .eq('org_id', currentOrgId);

          // Fetch last login information for all users
          let lastLoginData: { actor_id: string; created_at: string }[] | null = null;
          if (membershipsData && membershipsData.length > 0) {
            try {
              const userIds = membershipsData.map(m => m.user_id);
              const { data, error } = await supabase
                .from('audit_events')
                .select('actor_id, created_at')
                .eq('action', 'user_login')
                .in('actor_id', userIds)
                .order('created_at', { ascending: false });
              
              if (!error && data) {
                // Get the most recent login for each user
                const latestLogins = new Map<string, string>();
                data.forEach(event => {
                  // Skip events with null actor_id
                  if (event.actor_id && !latestLogins.has(event.actor_id)) {
                    latestLogins.set(event.actor_id, event.created_at);
                  }
                });
                lastLoginData = Array.from(latestLogins.entries()).map(([actor_id, created_at]) => ({
                  actor_id,
                  created_at
                }));
              } else if (error) {
                console.warn('Could not fetch last login data from audit_events (might be due to permissions):', error);
                
                // Fallback to localStorage if we can't fetch from database
                const localStorageLogins = new Map<string, string>();
                userIds.forEach(userId => {
                  const lastLogin = localStorage.getItem(`last_login_${userId}`);
                  if (lastLogin) {
                    localStorageLogins.set(userId, lastLogin);
                  }
                });
                
                if (localStorageLogins.size > 0) {
                  lastLoginData = Array.from(localStorageLogins.entries()).map(([actor_id, created_at]) => ({
                    actor_id,
                    created_at
                  }));
                }
              }
            } catch (error) {
              console.warn('Error fetching last login data:', error);
              
              // Fallback to localStorage if we get an error
              const localStorageLogins = new Map<string, string>();
              membershipsData.forEach(membership => {
                const lastLogin = localStorage.getItem(`last_login_${membership.user_id}`);
                if (lastLogin) {
                  localStorageLogins.set(membership.user_id, lastLogin);
                }
              });
              
              if (localStorageLogins.size > 0) {
                lastLoginData = Array.from(localStorageLogins.entries()).map(([actor_id, created_at]) => ({
                  actor_id,
                  created_at
                }));
              }
            }
          }

          // Create a map of last login data for quick lookup
          const lastLoginMap = new Map(lastLoginData?.map(login => [login.actor_id, login.created_at]) || []);

          if (membershipsError) {
            throw new Error(membershipsError.message);
          }

          // Extract user IDs from memberships
          const userIds = membershipsData.map(membership => membership.user_id);

          // Then fetch profiles for those users
          let usersData: Database['public']['Tables']['profiles']['Row'][] | null = [];
          if (userIds.length > 0) {
            const { data, error: profilesError } = await supabase
              .from('profiles')
              .select('*')
              .in('user_id', userIds);

            if (profilesError) {
              throw new Error(profilesError.message);
            }
            usersData = data || [];
          }

          // Combine profiles with memberships
          const transformedUsers: IUser[] = (usersData as Database['public']['Tables']['profiles']['Row'][]).map(profile => {
            const membership = membershipsData.find(m => m.user_id === profile.user_id);
            return {
              id: profile.user_id,
              name: profile.display_name || profile.email || 'Unknown User',
              email: profile.email || '',
              role: membership?.role || 'staff',
              status: 'active',
              lastLogin: lastLoginMap.get(profile.user_id), // Get actual last login time
              invitationSentAt: membership?.created_at, // Use membership creation date as invitation sent date
              createdAt: profile.created_at,
              createdBy: 'System',
              // Set permissions based on role
              permissions: getPermissionsForRole(membership?.role || 'staff')
            };
          });

          setUsers(transformedUsers);
        }
        alert(t('pages.users_roles.confirmations.user_deactivated'));
      } catch (error: any) {
        console.error('Failed to deactivate user:', error);
        alert(error.message || t('pages.users_roles.confirmations.error_deactivate'));
      }
    }
  };

  const handleDeleteUser = async (userId: string): Promise<void> => {
    if (window.confirm(t('pages.users_roles.confirmations.delete_user'))) {
      try {
        // In a real implementation, we would delete the user's membership
        // For now, we'll just show a success message
        alert(t('pages.users_roles.confirmations.user_deleted'));
        
        // Refresh the data
        if (currentOrgId) {
          // First fetch memberships for the current organization
          const { data: membershipsData, error: membershipsError } = await supabase
            .from('memberships')
            .select('user_id, org_id, role, created_at')
            .eq('org_id', currentOrgId);

          // Fetch last login information for all users
          let lastLoginData: { actor_id: string; created_at: string }[] | null = null;
          if (membershipsData && membershipsData.length > 0) {
            try {
              const userIds = membershipsData.map(m => m.user_id);
              const { data, error } = await supabase
                .from('audit_events')
                .select('actor_id, created_at')
                .eq('action', 'user_login')
                .in('actor_id', userIds)
                .order('created_at', { ascending: false });
              
              if (!error && data) {
                // Get the most recent login for each user
                const latestLogins = new Map<string, string>();
                data.forEach(event => {
                  // Skip events with null actor_id
                  if (event.actor_id && !latestLogins.has(event.actor_id)) {
                    latestLogins.set(event.actor_id, event.created_at);
                  }
                });
                lastLoginData = Array.from(latestLogins.entries()).map(([actor_id, created_at]) => ({
                  actor_id,
                  created_at
                }));
              } else if (error) {
                console.warn('Could not fetch last login data from audit_events (might be due to permissions):', error);
                
                // Fallback to localStorage if we can't fetch from database
                const localStorageLogins = new Map<string, string>();
                userIds.forEach(userId => {
                  const lastLogin = localStorage.getItem(`last_login_${userId}`);
                  if (lastLogin) {
                    localStorageLogins.set(userId, lastLogin);
                  }
                });
                
                if (localStorageLogins.size > 0) {
                  lastLoginData = Array.from(localStorageLogins.entries()).map(([actor_id, created_at]) => ({
                    actor_id,
                    created_at
                  }));
                }
              }
            } catch (error) {
              console.warn('Error fetching last login data:', error);
              
              // Fallback to localStorage if we get an error
              const localStorageLogins = new Map<string, string>();
              membershipsData.forEach(membership => {
                const lastLogin = localStorage.getItem(`last_login_${membership.user_id}`);
                if (lastLogin) {
                  localStorageLogins.set(membership.user_id, lastLogin);
                }
              });
              
              if (localStorageLogins.size > 0) {
                lastLoginData = Array.from(localStorageLogins.entries()).map(([actor_id, created_at]) => ({
                  actor_id,
                  created_at
                }));
              }
            }
          }

          // Create a map of last login data for quick lookup
          const lastLoginMap = new Map(lastLoginData?.map(login => [login.actor_id, login.created_at]) || []);

          if (membershipsError) {
            throw new Error(membershipsError.message);
          }

          // Extract user IDs from memberships
          const userIds = membershipsData.map(membership => membership.user_id);

          // Then fetch profiles for those users
          let usersData: Database['public']['Tables']['profiles']['Row'][] | null = [];
          if (userIds.length > 0) {
            const { data, error: profilesError } = await supabase
              .from('profiles')
              .select('*')
              .in('user_id', userIds);

            if (profilesError) {
              throw new Error(profilesError.message);
            }
            usersData = data || [];
          }

          // Combine profiles with memberships
          const transformedUsers: IUser[] = (usersData as Database['public']['Tables']['profiles']['Row'][]).map(profile => {
            const membership = membershipsData.find(m => m.user_id === profile.user_id);
            return {
              id: profile.user_id,
              name: profile.display_name || profile.email || 'Unknown User',
              email: profile.email || '',
              role: membership?.role || 'staff',
              status: 'active',
              lastLogin: lastLoginMap.get(profile.user_id), // Get actual last login time
              invitationSentAt: membership?.created_at, // Use membership creation date as invitation sent date
              createdAt: profile.created_at,
              createdBy: 'System',
              // Set permissions based on role
              permissions: getPermissionsForRole(membership?.role || 'staff')
            };
          });

          setUsers(transformedUsers);
        }
      } catch (error) {
        console.error('Failed to delete user:', error);
        alert(t('pages.users_roles.confirmations.error_delete'));
      }
    }
  };

  return (
    <RequireRole minRole="admin">
      <div className="p-4">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('pages.users_roles.title')}
          </h1>
        </div>

        <div className="mb-4">
          <div className="flex items-center space-x-2">
            <Input
              placeholder={t('pages.users_roles.search.placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">{t('pages.users_roles.filters.all_roles')}</option>
              <option value={ORG_ROLES.OWNER}>{t('roles.owner', 'Eier')}</option>
              <option value={ORG_ROLES.ADMIN}>{t('roles.admin', 'Administrator')}</option>
              <option value={ORG_ROLES.STAFF}>{t('roles.staff', 'Ansatt')}</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">{t('pages.users_roles.filters.all_statuses')}</option>
              <option value="active">{t('pages.users_roles.filters.status_active')}</option>
              <option value="inactive">{t('pages.users_roles.filters.status_inactive')}</option>
              <option value="invitation_sent">{t('pages.users_roles.filters.status_invitation_sent')}</option>
            </select>
          </div>
        </div>



        {error && (
          <div className="p-4 mt-4 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-4 text-center">
            <p className="text-gray-500 dark:text-gray-400">{t('common.loading')}</p>
          </div>
        ) : (
          <div className="mt-4">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('pages.users_roles.users_tab.title')}</h2>
                <PrimaryButton onClick={handleNewUser}>
                  <Plus className="h-4 w-4 mr-1" />
                  {t('pages.users_roles.users_tab.new_user')}
                </PrimaryButton>
              </div>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Select</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Navn</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Rolle</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Sist aktivitet</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Handlinger</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <UserRow
                      user={user}
                      onEdit={handleEditUser}
                      onDeactivate={handleDeactivateUser}
                      onDelete={handleDeleteUser}
                      onResendInvitation={handleResendInvitation}
                      isSelected={selectedUsers.has(user.id)}
                      onSelect={(userId, selected) => {
                        if (selected) {
                          setSelectedUsers(prev => new Set(prev).add(userId));
                        } else {
                          setSelectedUsers(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(userId);
                            return newSet;
                          });
                        }
                      }}
                      onRowClick={(user) => {
                        setSidePanel({ isOpen: true, user });
                      }}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('pages.users_roles.roles_tab.title')}</h2>
                <PrimaryButton onClick={handleNewRole}>
                  <Plus className="h-4 w-4 mr-1" />
                  {t('pages.users_roles.roles_tab.new_role')}
                </PrimaryButton>
              </div>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Navn</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Antall brukere</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Tillatelser</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Handlinger</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map(role => (
                    <RoleRow
                      role={role}
                      onEdit={handleEditRole}
                      onDeactivate={handleDeactivateRole}
                      onViewUsers={() => {
                        console.log('View users for role:', role.id);
                      }}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <UserModal
          user={userModal.user}
          isOpen={userModal.isOpen}
          onClose={() => setUserModal({ isOpen: false, user: null, isEditing: false })}
          onSave={handleSaveUser}
          isEditing={userModal.isEditing}
        />

        <RoleModal
          role={roleModal.role}
          isOpen={roleModal.isOpen}
          onClose={() => setRoleModal({ isOpen: false, role: null, isEditing: false })}
          onSave={handleSaveRole}
          isEditing={roleModal.isEditing}
        />

        <UserSidePanel
          user={sidePanel.user}
          isOpen={sidePanel.isOpen}
          onClose={() => setSidePanel({ isOpen: false, user: null })}
          onEdit={handleEditUser}
          onDeactivate={handleDeactivateUser}
          onDelete={handleDeleteUser}
          onResendInvitation={handleResendInvitation}
        />
      </div>
    </RequireRole>
  );
};

export default UsersRolesPage;
