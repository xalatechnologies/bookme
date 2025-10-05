"use client";

import React, { useState, useMemo } from "react";
import { RequireRole } from "@/components/admin/guards/RequireRole";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

const UserActionDropdown = ({ user, onEdit, onDeactivate, onDelete, onResendInvitation, onResetPassword }: IUserActionDropdownProps): JSX.Element => {
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
              Endre rolle
            </button>
            <button
              onClick={() => {
                onResetPassword(user.id);
                setIsOpen(false);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Key className="h-4 w-4 mr-2" />
              Tilbakestill passord
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
                Send invitasjon på nytt
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
              Fjern tilgang
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
                Slett bruker
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const UserModal = ({ user, isOpen, onClose, onSave, isEditing }: IUserModalProps): JSX.Element => {
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
              {isEditing ? "Rediger bruker" : "Ny bruker"}
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Navn
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Fullt navn"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                E-post
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="bruker@example.com"
                disabled={isEditing}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Rolle
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">Velg rolle</option>
                <option value="admin">Admin</option>
                <option value="saksbehandler">Saksbehandler</option>
                <option value="redaktor">Redaktør</option>
                <option value="lesetilgang">Lesetilgang</option>
              </select>
            </div>

            {isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as IUser["status"] })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="active">Aktiv</option>
                  <option value="inactive">Deaktivert</option>
                  <option value="invitation_sent">Invitasjon sendt</option>
                </select>
              </div>
            )}

            {isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tildelte tillatelser
                </label>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {user?.permissions.join(", ") || "Ingen spesielle tillatelser"}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="outline" onClick={onClose}>
              Avbryt
            </Button>
            <Button onClick={handleSave}>
              {isEditing ? "Lagre endringer" : "Send invitasjon"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const RoleModal = ({ role, isOpen, onClose, onSave, isEditing }: IRoleModalProps): JSX.Element => {
  const [formData, setFormData] = useState({
    name: role?.name || "",
    description: role?.description || "",
    permissions: role?.permissions || []
  });

  React.useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description,
        permissions: role.permissions
      });
    } else {
      setFormData({
        name: "",
        description: "",
        permissions: []
      });
    }
  }, [role]);

  const permissionGroups = [
    {
      group: "Lokaler",
      permissions: [
        { id: "facilities.create", label: "Opprette" },
        { id: "facilities.edit", label: "Redigere" },
        { id: "facilities.publish", label: "Publisere" },
        { id: "facilities.delete", label: "Slette" }
      ]
    },
    {
      group: "Bookinger",
      permissions: [
        { id: "bookings.view", label: "Se" },
        { id: "bookings.approve", label: "Godkjenne" },
        { id: "bookings.reject", label: "Avvise" }
      ]
    },
    {
      group: "Rapporter",
      permissions: [
        { id: "reports.view", label: "Se" },
        { id: "reports.export", label: "Eksportere" }
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
    onSave(formData);
    onClose();
  };

  if (!isOpen) return <></>;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {isEditing ? "Rediger rolle" : "Ny rolle"}
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Rollenavn
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="F.eks. Saksbehandler"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Beskrivelse
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Beskriv hva denne rollen kan gjøre..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Tilganger
              </label>
              <div className="space-y-4">
                {permissionGroups.map(group => (
                  <div key={group.group} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">{group.group}</h4>
                    <div className="space-y-2">
                      {group.permissions.map(permission => (
                        <label key={permission.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.permissions.includes(permission.id)}
                            onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{permission.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="outline" onClick={onClose}>
              Avbryt
            </Button>
            <Button onClick={handleSave}>
              {isEditing ? "Lagre endringer" : "Opprett rolle"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserRow = ({ user, onEdit, onDeactivate, onDelete, onResendInvitation, isSelected, onSelect }: IUserRowProps): JSX.Element => {
  const getStatusBadge = (status: IUser["status"]): JSX.Element => {
    const statusConfig = {
      active: { label: "Aktiv", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300", icon: null },
      inactive: { label: "Deaktivert", className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300", icon: null },
      invitation_sent: { 
        label: user.invitationSentAt ? `Invitasjon sendt – ${formatTimeAgo(user.invitationSentAt)}` : "Invitasjon sendt", 
        className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
        icon: <Clock className="h-3 w-3 mr-1" />
      }
    };
    const config = statusConfig[status];
    return (
      <Badge className={config.className}>
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "Aldri";
    return new Date(dateString).toLocaleDateString('nb-NO');
  };

  return (
    <tr className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
      isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
    }`}>
      <td className="px-6 py-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(user.id, e.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
        {user.createdBy}
      </td>
      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
        {formatDate(user.lastLogin)}
      </td>
      <td className="px-6 py-4">
        {getStatusBadge(user.status)}
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
  return (
    <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
      <td className="px-6 py-4">
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{role.name}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{role.description}</div>
        </div>
      </td>
      <td className="px-6 py-4">
        <Badge variant="outline">{role.userCount} brukere</Badge>
      </td>
      <td className="px-6 py-4">
        <Badge className={role.isActive ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"}>
          {role.isActive ? "Aktiv" : "Deaktivert"}
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
            Rediger
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewUsers(role.id)}
          >
            <Eye className="h-4 w-4 mr-1" />
            Se brukere
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDeactivate(role.id)}
            className={role.isActive ? "text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20" : "text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"}
          >
            {role.isActive ? "Deaktiver" : "Aktiver"}
          </Button>
        </div>
      </td>
    </tr>
  );
};

const UsersRolesPage = (): JSX.Element => {
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

  // Mock data - replace with real data from API
  const users: readonly IUser[] = [
    {
      id: "1",
      name: "Amin Ismail",
      email: "amin@bookme.com",
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
      name: "Redaktør",
      description: "Kan redigere lokaler, ikke godkjenne",
      userCount: 1,
      permissions: ["facilities.create", "facilities.edit", "facilities.publish"],
      isActive: true
    },
    {
      id: "4",
      name: "Lesetilgang",
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
    // TODO: Implement save user logic
  };

  const handleSaveRole = (roleData: Partial<IRole>): void => {
    // TODO: Implement save role logic
  };

  const handleDeactivateUser = (userId: string): void => {
    // TODO: Implement deactivate user logic
  };

  const handleDeleteUser = (userId: string): void => {
    // TODO: Implement delete user logic
  };

  const handleResendInvitation = (userId: string): void => {
    // TODO: Implement resend invitation logic
  };

  const handleDeactivateRole = (roleId: string): void => {
    // TODO: Implement deactivate role logic
  };

  const handleViewUsers = (roleId: string): void => {
    // TODO: Implement view users with role logic
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
    // TODO: Implement bulk actions
  };

  return (
    <RequireRole roles={["system-admin", "org-admin"]}>
      <div className="space-y-6">
        {/* Header */}
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Brukere og roller
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Administrer brukere, roller og tilgangsnivåer i systemet.
          </p>
        </header>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === "users"
                ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Users className="h-4 w-4 mr-2 inline" />
            Brukere
          </button>
          <button
            onClick={() => setActiveTab("roles")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === "roles"
                ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Shield className="h-4 w-4 mr-2 inline" />
            Roller
          </button>
        </div>
        
        {/* Tab descriptions */}
        <div className="mt-2">
          {activeTab === "users" && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Se, opprett og administrer brukerkontoer i BookMe.
            </p>
          )}
          {activeTab === "roles" && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Definer rettigheter og tilgangsnivåer for ulike roller i systemet.
            </p>
          )}
        </div>

        {/* Users Tab */}
        {activeTab === "users" && (
          <Card>
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div>
                  <CardTitle>Brukere</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Administrer systembrukere og deres tilganger
                  </p>
                </div>
                <Button onClick={handleNewUser}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Ny bruker
                </Button>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Søk etter navn, e-post eller rolle..."
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
                  <option value="all">Alle roller</option>
                  <option value="admin">Admin</option>
                  <option value="saksbehandler">Saksbehandler</option>
                  <option value="redaktor">Redaktør</option>
                  <option value="lesetilgang">Lesetilgang</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="all">Alle statuser</option>
                  <option value="active">Aktiv</option>
                  <option value="inactive">Deaktivert</option>
                  <option value="invitation_sent">Invitasjon sendt</option>
                </select>
              </div>

              {/* Bulk Actions */}
              {selectedUsers.size > 0 && (
                <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    {selectedUsers.size} bruker(e) valgt
                  </span>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleBulkAction("change-role")}>
                      Endre rolle
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleBulkAction("resend-invitation")}>
                      Send invitasjon på nytt
                    </Button>
                  </div>
                </div>
              )}
            </CardHeader>

            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Bruker
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Rolle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Opprettet av
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Sist innlogget
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Handlinger
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            Ingen brukere funnet
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400">
                            {searchQuery ? "Prøv å endre søkekriteriene" : "Det er ingen brukere å vise for øyeblikket"}
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
                        />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Roles Tab */}
        {activeTab === "roles" && (
          <Card>
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div>
                  <CardTitle>Roller og tilgangsnivåer</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Definer og administrer systemroller og deres rettigheter
                  </p>
                </div>
                <Button onClick={handleNewRole}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ny rolle
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Rolle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Antall brukere
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Handlinger
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {roles.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center">
                          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            Ingen roller funnet
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400">
                            Opprett din første rolle for å komme i gang
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
        )}

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
      </div>
    </RequireRole>
  );
};

export default UsersRolesPage;
