"use client";

import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { RequireRole } from "@/components/features/auth/components/RequireRole";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  const roleColors = {
    admin: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    saksbehandler: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    redaktor: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    lesetilgang: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
  };
  return roleColors[role as keyof typeof roleColors] || roleColors.lesetilgang;
};

const getRoleIcon = (role: string): React.ComponentType<{ className?: string }> => {
  const roleIcons = {
    admin: Crown,
    saksbehandler: Briefcase,
    redaktor: PenTool,
    lesetilgang: EyeIcon
  };
  return roleIcons[role as keyof typeof roleIcons] || EyeIcon;
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
  } else if (user.invitationSentAt) {
    return `Invitasjon sendt: ${formatTimeAgo(user.invitationSentAt)}`;
  } else {
    return "Aldri aktiv – kun invitert";
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
                <option value="admin">{t('pages.users_roles.filters.role_admin')}</option>
                <option value="saksbehandler">{t('pages.users_roles.filters.role_saksbehandler')}</option>
                <option value="redaktor">{t('pages.users_roles.filters.role_redaktor')}</option>
                <option value="lesetilgang">{t('pages.users_roles.filters.role_lesetilgang')}</option>
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
                <span className="text-sm text-gray-700 dark:text-gray-300">{t('pages.users_roles.status_badges.active')}</span>
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
          {user.status === 'active' ? t('pages.users_roles.status_badges.active') : user.status === 'inactive' ? t('pages.users_roles.status_badges.inactive') : t('pages.users_roles.status_badges.invitation_sent')}
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
    if (permissions.includes("all")) return "Alle moduler";
    
    const permissionMap: Record<string, string> = {
      "facilities": "Lokaler",
      "bookings": "Bookinger",
      "reports": "Rapporter",
      "users": "Brukere"
    };
    
    const modules = new Set<string>();
    permissions.forEach(permission => {
      const module = permission.split(".")[0];
      if (module in permissionMap) {
        modules.add(permissionMap[module]);
      }
    });
    
    return modules.size > 0 ? Array.from(modules).join(", ") : "Ingen spesielle tilganger";
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
          {role.isActive ? t('pages.users_roles.status_badges.active') : t('pages.users_roles.status_badges.inactive')}
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
              {role.isActive ? t('pages.users_roles.status_badges.active') : t('pages.users_roles.status_badges.inactive')}
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
                  {user.status === 'active' ? t('pages.users_roles.status_badges.active') : user.status === 'inactive' ? t('pages.users_roles.status_badges.inactive') : t('pages.users_roles.status_badges.invitation_sent')}
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
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('pages.users_roles.status_badges.invitation_sent')}</p>
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
  const [activeTab, setActiveTab] = useState<"users" | "roles">("users");
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

  // Mock data - replace with real data from API
  const users: readonly IUser[] = [
    {
      id: "1",
      name: "Amin Ismail",
      email: "amin@booknor.com",
      role: "admin",
      status: "active",
      lastLogin: "2024-01-15T10:30:00Z",
      createdAt: "2024-01-01T00:00:00Z",
      createdBy: "System",
      permissions: ["all"]
    },
    {
      id: "2",
      name: "Sarah Nilsen",
      email: "sarah@kommune.no",
      role: "saksbehandler",
      status: "active",
      lastLogin: "2024-01-14T15:20:00Z",
      createdAt: "2024-01-05T00:00:00Z",
      createdBy: "Amin Ismail",
      permissions: ["bookings.approve", "bookings.reject", "facilities.view"]
    },
    {
      id: "3",
      name: "Per Hansen",
      email: "per@kommune.no",
      role: "redaktor",
      status: "invitation_sent",
      createdAt: "2024-01-10T00:00:00Z",
      createdBy: "Sarah Nilsen",
      invitationSentAt: "2024-01-10T09:00:00Z",
      permissions: ["facilities.edit", "facilities.create"]
    },
    {
      id: "4",
      name: "Eva Johansen",
      email: "eva@kommune.no",
      role: "lesetilgang",
      status: "active",
      lastLogin: "2024-01-12T08:15:00Z",
      createdAt: "2024-01-08T00:00:00Z",
      createdBy: "Amin Ismail",
      permissions: ["facilities.view", "bookings.view"]
    },
    {
      id: "5",
      name: "Lars Andersen",
      email: "lars@kommune.no",
      role: "saksbehandler",
      status: "inactive",
      lastLogin: "2024-01-05T14:20:00Z",
      createdAt: "2024-01-03T00:00:00Z",
      createdBy: "Sarah Nilsen",
      permissions: ["bookings.approve", "bookings.view", "facilities.view"]
    }
  ];

  const roles: readonly IRole[] = [
    {
      id: "1",
      name: "Admin",
      description: "Full tilgang til hele systemet",
      userCount: 1,
      permissions: ["all"],
      isActive: true
    },
    {
      id: "2",
      name: "Saksbehandler",
      description: "Kan godkjenne og behandle bookinger",
      userCount: 1,
      permissions: ["bookings.view", "bookings.approve", "bookings.reject", "facilities.view"],
      isActive: true
    },
    {
      id: "3",
      name: t('pages.users_roles.filters.role_redaktor'),
      description: "Kan redigere lokaler, ikke godkjenne",
      userCount: 1,
      permissions: ["facilities.create", "facilities.edit", "facilities.publish"],
      isActive: true
    },
    {
      id: "4",
      name: t('pages.users_roles.filters.role_lesetilgang'),
      description: "Kan kun se informasjon",
      userCount: 0,
      permissions: ["facilities.view", "bookings.view"],
      isActive: true
    }
  ];

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

  const handleSaveUser = (userData: Partial<IUser>): void => {
    try {
      // Simulate saving to backend/localStorage
      const users = JSON.parse(localStorage.getItem('adminUsers') || '[]');
      
      if (userModal.isEditing && userModal.user) {
        // Update existing user
        const updatedUsers = users.map((u: IUser) => 
          u.id === userModal.user!.id ? { ...u, ...userData } : u
        );
        localStorage.setItem('adminUsers', JSON.stringify(updatedUsers));
        alert(t('pages.users_roles.confirmations.user_updated'));
      } else {
        // Create new user
        const newUser: IUser = {
          id: Date.now().toString(),
          name: userData.name || '',
          email: userData.email || '',
          role: userData.role || 'lesetilgang',
          status: 'invitation_sent',
          createdAt: new Date().toISOString(),
          createdBy: 'Current Admin',
          invitationSentAt: new Date().toISOString(),
          permissions: []
        };
        users.push(newUser);
        localStorage.setItem('adminUsers', JSON.stringify(users));
        alert(t('pages.users_roles.confirmations.invitation_resent'));
      }
    } catch (error) {
      console.error('Failed to save user:', error);
      alert(t('pages.users_roles.confirmations.error_save'));
    }
  };

  const handleSaveRole = (roleData: Partial<IRole>): void => {
    try {
      // Simulate saving to backend/localStorage
      const roles = JSON.parse(localStorage.getItem('adminRoles') || '[]');
      
      if (roleModal.isEditing && roleModal.role) {
        // Update existing role
        const updatedRoles = roles.map((r: IRole) => 
          r.id === roleModal.role!.id ? { ...r, ...roleData } : r
        );
        localStorage.setItem('adminRoles', JSON.stringify(updatedRoles));
        alert(t('pages.users_roles.confirmations.role_updated'));
      } else {
        // Create new role
        const newRole: IRole = {
          id: Date.now().toString(),
          name: roleData.name || '',
          description: roleData.description || '',
          userCount: 0,
          permissions: roleData.permissions || [],
          isActive: roleData.isActive ?? true
        };
        roles.push(newRole);
        localStorage.setItem('adminRoles', JSON.stringify(roles));
        alert(t('pages.users_roles.confirmations.role_created'));
      }
    } catch (error) {
      console.error('Failed to save role:', error);
      alert(t('pages.users_roles.confirmations.error_save'));
    }
  };

  const handleDeactivateUser = (userId: string): void => {
    if (window.confirm(t('pages.users_roles.confirmations.deactivate_user'))) {
      try {
        const users = JSON.parse(localStorage.getItem('adminUsers') || '[]');
        const updatedUsers = users.map((u: IUser) => 
          u.id === userId ? { ...u, status: 'inactive' as const } : u
        );
        localStorage.setItem('adminUsers', JSON.stringify(updatedUsers));
        alert(t('pages.users_roles.confirmations.user_deactivated'));
      } catch (error) {
        console.error('Failed to deactivate user:', error);
        alert(t('pages.users_roles.confirmations.error_deactivate'));
      }
    }
  };

  const handleDeleteUser = (userId: string): void => {
    if (window.confirm(t('pages.users_roles.confirmations.delete_user'))) {
      try {
        const users = JSON.parse(localStorage.getItem('adminUsers') || '[]');
        const updatedUsers = users.filter((u: IUser) => u.id !== userId);
        localStorage.setItem('adminUsers', JSON.stringify(updatedUsers));
        alert(t('pages.users_roles.confirmations.user_deleted'));
      } catch (error) {
        console.error('Failed to delete user:', error);
        alert(t('pages.users_roles.confirmations.error_delete'));
      }
    }
  };

  const handleResendInvitation = (userId: string): void => {
    try {
      const users = JSON.parse(localStorage.getItem('adminUsers') || '[]');
      const updatedUsers = users.map((u: IUser) => 
        u.id === userId ? { ...u, invitationSentAt: new Date().toISOString() } : u
      );
      localStorage.setItem('adminUsers', JSON.stringify(updatedUsers));
      alert(t('pages.users_roles.confirmations.invitation_resent'));
    } catch (error) {
      console.error('Failed to resend invitation:', error);
      alert(t('pages.users_roles.confirmations.error_invitation'));
    }
  };

  const handleDeactivateRole = (roleId: string): void => {
    try {
      const roles = JSON.parse(localStorage.getItem('adminRoles') || '[]');
      const updatedRoles = roles.map((r: IRole) => 
        r.id === roleId ? { ...r, isActive: !r.isActive } : r
      );
      localStorage.setItem('adminRoles', JSON.stringify(updatedRoles));
      alert(t('pages.users_roles.confirmations.role_status_changed'));
    } catch (error) {
      console.error('Failed to toggle role status:', error);
      alert(t('pages.users_roles.confirmations.error_role_status'));
    }
  };

  const handleViewUsers = (roleId: string): void => {
    const role = roles.find(r => r.id === roleId);
    if (role) {
      const usersWithRole = users.filter(u => u.role === role.name);
      alert(t('pages.users_roles.users_with_role', { role: role.name, users: usersWithRole.map(u => `• ${u.name} (${u.email})`).join('\n') }));
    }
  };

  const handleSelectUser = (userId: string, selected: boolean): void => {
    const newSelected = new Set(selectedUsers);
    if (selected) {
      newSelected.add(userId);
    } else {
      newSelected.delete(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleBulkAction = (action: string): void => {
    if (selectedUsers.size === 0) return;
    
    try {
      const users = JSON.parse(localStorage.getItem('adminUsers') || '[]');
      
      switch (action) {
        case 'change-role':
          const newRole = prompt(t('pages.users_roles.actions.enter_new_role'));
          if (newRole) {
            const updatedUsers = users.map((u: IUser) => 
              selectedUsers.has(u.id) ? { ...u, role: newRole } : u
            );
            localStorage.setItem('adminUsers', JSON.stringify(updatedUsers));
            alert(t('pages.users_roles.bulk_actions.users_updated', { count: selectedUsers.size }));
            setSelectedUsers(new Set());
          }
          break;
        case 'resend-invitation':
          const updatedUsers = users.map((u: IUser) => 
            selectedUsers.has(u.id) ? { ...u, invitationSentAt: new Date().toISOString() } : u
          );
          localStorage.setItem('adminUsers', JSON.stringify(updatedUsers));
          alert(t('pages.users_roles.bulk_actions.invitations_sent', { count: selectedUsers.size }));
          setSelectedUsers(new Set());
          break;
        default:
          alert(t('pages.users_roles.bulk_actions.action_not_implemented'));
      }
    } catch (error) {
      console.error('Failed to perform bulk action:', error);
      alert(t('pages.users_roles.confirmations.error_bulk_action'));
    }
  };

  const openUserSidePanel = (user: IUser): void => {
    setSidePanel({ isOpen: true, user });
  };

  const closeUserSidePanel = (): void => {
    setSidePanel({ isOpen: false, user: null });
  };

  return (
    <RequireRole minRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {t('pages.users_roles.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('pages.users_roles.subtitle')}
          </p>
        </header>

        {/* Primary Level: Users */}
        <Card className="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <CardHeader className="bg-blue-50 dark:bg-blue-900/20 rounded-t-lg">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  <Users className="h-5 w-5 mr-2 inline" />
                  {t('pages.users_roles.users_tab.title')}
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {t('pages.users_roles.users_tab.subtitle')}
                </p>
              </div>
              <Button 
                onClick={handleNewUser}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {t('pages.users_roles.users_tab.new_user')}
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={t('pages.users_roles.search.placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">{t('pages.users_roles.filters.all_roles')}</option>
                <option value="admin">{t('pages.users_roles.filters.role_admin')}</option>
                <option value="saksbehandler">{t('pages.users_roles.filters.role_saksbehandler')}</option>
                <option value="redaktor">{t('pages.users_roles.filters.role_redaktor')}</option>
                <option value="lesetilgang">{t('pages.users_roles.filters.role_lesetilgang')}</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">{t('pages.users_roles.filters.all_statuses')}</option>
                <option value="active">{t('pages.users_roles.filters.status_active')}</option>
                <option value="inactive">{t('pages.users_roles.filters.status_inactive')}</option>
                <option value="invitation_sent">{t('pages.users_roles.filters.status_invitation_sent')}</option>
              </select>
            </div>

            {/* Bulk Actions */}
            {selectedUsers.size > 0 && (
              <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-4">
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  {t('pages.users_roles.users_tab.selected_count', { count: selectedUsers.size })}
                </span>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction("change-role")}>
                    {t('pages.users_roles.actions.change_role')}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction("resend-invitation")}>
                    {t('pages.users_roles.actions.resend_invitation')}
                  </Button>
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <Checkbox
                        onCheckedChange={(checked) => {
                          const newSelected = new Set<string>();
                          if (checked) {
                            filteredUsers.forEach(user => newSelected.add(user.id));
                          }
                          setSelectedUsers(newSelected);
                        }}
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('pages.users_roles.table.user')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('pages.users_roles.table.role')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('pages.users_roles.table.last_login')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('pages.users_roles.table.status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('pages.users_roles.table.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          {t('pages.users_roles.table.no_users_found')}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {searchQuery ? t('pages.users_roles.table.try_different_criteria') : t('pages.users_roles.table.no_users_description')}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(user => (
                      <UserRow
                        key={user.id}
                        user={user}
                        onEdit={handleEditUser}
                        onDeactivate={handleDeactivateUser}
                        onDelete={handleDeleteUser}
                        onResendInvitation={handleResendInvitation}
                        isSelected={selectedUsers.has(user.id)}
                        onSelect={handleSelectUser}
                        onRowClick={openUserSidePanel}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Secondary Level: Roles and Access Levels */}
        <Card className="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <CardHeader className="bg-gray-50 dark:bg-gray-700/30 rounded-t-lg">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  <Shield className="h-5 w-5 mr-2 inline" />
                  {t('pages.users_roles.roles_tab.title')}
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {t('pages.users_roles.roles_tab.subtitle')}
                </p>
              </div>
              <Button 
                onClick={handleNewRole}
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('pages.users_roles.roles_tab.new_role')}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('pages.users_roles.table.role_name')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('pages.users_roles.table.user_count')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('pages.users_roles.modals.role.permissions_label')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('pages.users_roles.table.status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('pages.users_roles.table.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {roles.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          {t('pages.users_roles.table.no_roles_found')}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {t('pages.users_roles.table.create_first_role')}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    roles.map(role => (
                      <RoleRow
                        key={role.id}
                        role={role}
                        onEdit={handleEditRole}
                        onDeactivate={handleDeactivateRole}
                        onViewUsers={handleViewUsers}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Modals */}
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

        {/* Side Panel */}
        <UserSidePanel
          user={sidePanel.user}
          isOpen={sidePanel.isOpen}
          onClose={closeUserSidePanel}
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