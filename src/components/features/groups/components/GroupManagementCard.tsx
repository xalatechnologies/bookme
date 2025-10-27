"use client";

/**
 * GroupManagementCard Component
 *
 * SOLID Principles Applied:
 * - Single Responsibility: Each sub-component handles one specific task
 * - Open/Closed: Components are open for extension through props
 * - Liskov Substitution: All dialog components follow the same interface
 * - Interface Segregation: Props interfaces are specific to each component
 * - Dependency Inversion: Uses i18n for translations
 */

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Users, Settings, Plus, MoreHorizontal, Edit, Trash2, UserPlus, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { BookingGroup, CreateGroupData } from "@/types/group";
import { useGroupStore } from "@/stores/groupStore";
import { getInitials } from "@/utils/card-formatters";

/**
 * Props interfaces following Interface Segregation Principle
 */
interface GroupManagementCardProps {
  readonly groups: readonly BookingGroup[];
  readonly onCreateGroup: (groupData: CreateGroupData) => void;
  readonly onEditGroup: (groupId: string) => void;
  readonly onDeleteGroup: (groupId: string) => void;
  readonly onInviteMember: (groupId: string) => void;
  readonly onViewGroup: (groupId: string) => void;
}

interface CreateGroupDialogProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSubmit: (groupData: CreateGroupData) => void;
}

interface GroupCardProps {
  readonly group: BookingGroup;
  readonly onEdit: (groupId: string) => void;
  readonly onDelete: (groupId: string) => void;
  readonly onInvite: (groupId: string) => void;
  readonly onView: (groupId: string) => void;
}

/**
 * Create group dialog component
 * Single Responsibility: Handles group creation form only
 */
const CreateGroupDialog: React.FC<CreateGroupDialogProps> = ({ isOpen, onClose, onSubmit }) => {
  const { t } = useTranslation('group');
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [allowMemberBookings, setAllowMemberBookings] = useState<boolean>(true);
  const [requireApproval, setRequireApproval] = useState<boolean>(false);
  const [maxBookingsPerMember, setMaxBookingsPerMember] = useState<number>(5);
  const [notificationPreferences, setNotificationPreferences] = useState({
    newBookings: true,
    cancellations: true,
    memberChanges: true
  });

  const handleSubmit = (): void => {
    if (!name.trim()) {
      alert(t('dialog.fillGroupName'));
      return;
    }

    const groupData: CreateGroupData = {
      name: name.trim(),
      description: description.trim(),
      ownerId: "current-user",
      settings: {
        allowMemberBookings,
        requireApproval,
        maxBookingsPerMember,
        notificationPreferences
      }
    };

    onSubmit(groupData);
    onClose();

    // Reset form
    setName("");
    setDescription("");
    setAllowMemberBookings(true);
    setRequireApproval(false);
    setMaxBookingsPerMember(5);
    setNotificationPreferences({
      newBookings: true,
      cancellations: true,
      memberChanges: true
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('dialog.createTitle')}</DialogTitle>
          <DialogDescription>{t('dialog.createDescription')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="group-name" className="text-sm font-medium">
                {t('dialog.groupName')} *
              </Label>
              <Input
                id="group-name"
                placeholder={t('dialog.groupNamePlaceholder')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-describedby="group-name-help"
              />
              <p id="group-name-help" className="text-xs text-muted-foreground">
                {t('dialog.groupNameHelp')}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="group-description" className="text-sm font-medium">
                {t('dialog.description')}
              </Label>
              <Textarea
                id="group-description"
                placeholder={t('dialog.descriptionPlaceholder')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium">{t('dialog.groupSettings')}</h4>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">{t('dialog.allowMemberBookings')}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t('dialog.allowMemberBookingsHelp')}
                  </p>
                </div>
                <Switch
                  checked={allowMemberBookings}
                  onCheckedChange={setAllowMemberBookings}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">{t('dialog.requireApproval')}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t('dialog.requireApprovalHelp')}
                  </p>
                </div>
                <Switch
                  checked={requireApproval}
                  onCheckedChange={setRequireApproval}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-bookings" className="text-sm font-medium">
                  {t('dialog.maxBookingsPerMember')}
                </Label>
                <Input
                  id="max-bookings"
                  type="number"
                  min="1"
                  max="50"
                  value={maxBookingsPerMember}
                  onChange={(e) => setMaxBookingsPerMember(parseInt(e.target.value) || 1)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium">{t('dialog.notificationSettings')}</h4>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">{t('dialog.notifyNewBookings')}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t('dialog.notifyNewBookingsHelp')}
                  </p>
                </div>
                <Switch
                  checked={notificationPreferences.newBookings}
                  onCheckedChange={(checked) =>
                    setNotificationPreferences(prev => ({ ...prev, newBookings: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">{t('dialog.notifyCancellations')}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t('dialog.notifyCancellationsHelp')}
                  </p>
                </div>
                <Switch
                  checked={notificationPreferences.cancellations}
                  onCheckedChange={(checked) =>
                    setNotificationPreferences(prev => ({ ...prev, cancellations: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">{t('dialog.notifyMemberChanges')}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t('dialog.notifyMemberChangesHelp')}
                  </p>
                </div>
                <Switch
                  checked={notificationPreferences.memberChanges}
                  onCheckedChange={(checked) =>
                    setNotificationPreferences(prev => ({ ...prev, memberChanges: checked }))
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('dialog.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim()}>
            {t('dialog.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Group card component for displaying individual groups
 * Single Responsibility: Displays a single group's information
 */
const GroupCard: React.FC<GroupCardProps> = ({ group, onEdit, onDelete, onInvite, onView }) => {
  const { t } = useTranslation('group');
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const isOwner = group.members.find(member => member.role === 'owner')?.userId === "current-user";

  const handleDelete = (): void => {
    onDelete(group.id);
    setShowDeleteDialog(false);
  };

  const getRoleLabel = (role: string): string => {
    const roleMap: Record<string, string> = {
      owner: t('roles.owner'),
      admin: t('roles.admin'),
      member: t('roles.member')
    };
    return roleMap[role] || role;
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>{group.name}</span>
                {isOwner && (
                  <Badge variant="secondary" className="text-xs">
                    {t('card.owner')}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {group.description || t('common:messages.noDescription')}
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">{t('card.openMenu')}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView(group.id)}>
                  <Calendar className="h-4 w-4 mr-2" />
                  {t('card.viewBookings')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onInvite(group.id)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  {t('card.inviteMember')}
                </DropdownMenuItem>
                {isOwner && (
                  <>
                    <DropdownMenuItem onClick={() => onEdit(group.id)}>
                      <Edit className="h-4 w-4 mr-2" />
                      {t('card.editGroup')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t('card.deleteGroup')}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Group Statistics */}
          <div className="grid grid-cols-3 gap-4 p-3 bg-muted rounded-md">
            <div className="text-center">
              <div className="text-lg font-semibold">{group.members.length}</div>
              <div className="text-xs text-muted-foreground">{t('card.members')}</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{group.bookings.length}</div>
              <div className="text-xs text-muted-foreground">{t('card.bookings')}</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{group.invitations.length}</div>
              <div className="text-xs text-muted-foreground">{t('card.invitations')}</div>
            </div>
          </div>

          {/* Members List */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">{t('card.members')}</h4>
            <div className="space-y-1">
              {group.members.slice(0, 3).map((member) => (
                <div key={member.userId} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs text-primary-foreground">
                      {getInitials(member.name)}
                    </div>
                    <span>{member.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {getRoleLabel(member.role)}
                    </Badge>
                  </div>
                </div>
              ))}
              {group.members.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  {t('card.moreMembers', { count: group.members.length - 3 })}
                </p>
              )}
            </div>
          </div>

          {/* Settings Summary */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">{t('card.settings')}</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant={group.settings.allowMemberBookings ? "default" : "secondary"}>
                {group.settings.allowMemberBookings ? t('card.memberBookings') : t('card.ownerBookingsOnly')}
              </Badge>
              <Badge variant={group.settings.requireApproval ? "default" : "secondary"}>
                {group.settings.requireApproval ? t('card.requireApproval') : t('card.autoApproval')}
              </Badge>
              <Badge variant="outline">
                {t('card.maxPerMember', { count: group.settings.maxBookingsPerMember })}
              </Badge>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(group.id)}
              className="flex-1"
            >
              <Calendar className="h-4 w-4 mr-2" />
              {t('card.viewBookings')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onInvite(group.id)}
              className="flex-1"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {t('card.inviteMember')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('dialog.deleteTitle')}</DialogTitle>
            <DialogDescription>
              {t('dialog.deleteDescription', { name: group.name })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              {t('dialog.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              {t('dialog.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

/**
 * Group management card component
 *
 * Displays all user groups with management capabilities including
 * creation, editing, deletion, and member invitation.
 */
export const GroupManagementCard: React.FC<GroupManagementCardProps> = ({
  groups,
  onCreateGroup,
  onEditGroup,
  onDeleteGroup,
  onInviteMember,
  onViewGroup
}) => {
  const { t } = useTranslation('group');
  const [showCreateDialog, setShowCreateDialog] = useState<boolean>(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('card.myGroups')}</h2>
          <p className="text-muted-foreground">
            {t('card.manageGroups')}
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t('card.createGroup')}
        </Button>
      </div>

      {/* Groups Grid */}
      {groups.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('card.noGroups')}</h3>
            <p className="text-muted-foreground text-center mb-4">
              {t('card.noGroupsDescription')}
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t('card.createGroup')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onEdit={onEditGroup}
              onDelete={onDeleteGroup}
              onInvite={onInviteMember}
              onView={onViewGroup}
            />
          ))}
        </div>
      )}

      {/* Create Group Dialog */}
      <CreateGroupDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSubmit={onCreateGroup}
      />
    </div>
  );
};
