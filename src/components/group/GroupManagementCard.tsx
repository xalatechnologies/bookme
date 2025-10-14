"use client";

import React, { useState } from "react";
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

/**
 * Props interface for GroupManagementCard component
 */
interface GroupManagementCardProps {
  readonly groups: readonly BookingGroup[];
  readonly onCreateGroup: (groupData: CreateGroupData) => void;
  readonly onEditGroup: (groupId: string) => void;
  readonly onDeleteGroup: (groupId: string) => void;
  readonly onInviteMember: (groupId: string) => void;
  readonly onViewGroup: (groupId: string) => void;
}

/**
 * Create group dialog component
 */
const CreateGroupDialog: React.FC<{
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSubmit: (groupData: CreateGroupData) => void;
}> = ({ isOpen, onClose, onSubmit }) => {
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
      alert("Vennligst fyll ut gruppenavn");
      return;
    }

    const groupData: CreateGroupData = {
      name: name.trim(),
      description: description.trim(),
      ownerId: "current-user", // This should come from auth context
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
          <DialogTitle>Opprett ny gruppe</DialogTitle>
          <DialogDescription>
            Opprett en ny gruppe for å dele bookinger med andre brukere
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="group-name" className="text-sm font-medium">
                Gruppenavn *
              </Label>
              <Input
                id="group-name"
                placeholder="f.eks. Fotballaget, Arbeidsgruppe, Familie"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-describedby="group-name-help"
              />
              <p id="group-name-help" className="text-xs text-muted-foreground">
                Velg et beskrivende navn for gruppen
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="group-description" className="text-sm font-medium">
                Beskrivelse
              </Label>
              <Textarea
                id="group-description"
                placeholder="Beskriv formålet med gruppen..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Gruppeinnstillinger</h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Tillat medlemsbookinger</Label>
                  <p className="text-xs text-muted-foreground">
                    La medlemmer opprette bookinger på vegne av gruppen
                  </p>
                </div>
                <Switch
                  checked={allowMemberBookings}
                  onCheckedChange={setAllowMemberBookings}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Krev godkjenning</Label>
                  <p className="text-xs text-muted-foreground">
                    Bookinger må godkjennes av gruppeadministrator
                  </p>
                </div>
                <Switch
                  checked={requireApproval}
                  onCheckedChange={setRequireApproval}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-bookings" className="text-sm font-medium">
                  Maksimalt antall bookinger per medlem
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
            <h4 className="text-sm font-medium">Varslingsinnstillinger</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Nye bookinger</Label>
                  <p className="text-xs text-muted-foreground">
                    Varsle om nye bookinger i gruppen
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
                  <Label className="text-sm font-medium">Avlysninger</Label>
                  <p className="text-xs text-muted-foreground">
                    Varsle om avlyste bookinger
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
                  <Label className="text-sm font-medium">Medlemsendringer</Label>
                  <p className="text-xs text-muted-foreground">
                    Varsle om nye medlemmer eller utmeldinger
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
            Avbryt
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim()}>
            Opprett gruppe
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Group card component for displaying individual groups
 */
const GroupCard: React.FC<{
  readonly group: BookingGroup;
  readonly onEdit: (groupId: string) => void;
  readonly onDelete: (groupId: string) => void;
  readonly onInvite: (groupId: string) => void;
  readonly onView: (groupId: string) => void;
}> = ({ group, onEdit, onDelete, onInvite, onView }) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const isOwner = group.members.find(member => member.role === 'owner')?.userId === "current-user";

  const handleDelete = (): void => {
    onDelete(group.id);
    setShowDeleteDialog(false);
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
                    Eier
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {group.description || "Ingen beskrivelse"}
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Åpne meny</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView(group.id)}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Se bookinger
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onInvite(group.id)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Inviter medlem
                </DropdownMenuItem>
                {isOwner && (
                  <>
                    <DropdownMenuItem onClick={() => onEdit(group.id)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Rediger gruppe
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Slett gruppe
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
              <div className="text-xs text-muted-foreground">Medlemmer</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{group.bookings.length}</div>
              <div className="text-xs text-muted-foreground">Bookinger</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{group.invitations.length}</div>
              <div className="text-xs text-muted-foreground">Invitasjoner</div>
            </div>
          </div>

          {/* Members List */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Medlemmer</h4>
            <div className="space-y-1">
              {group.members.slice(0, 3).map((member) => (
                <div key={member.userId} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs text-primary-foreground">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <span>{member.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {member.role === 'owner' ? 'Eier' : member.role === 'admin' ? 'Admin' : 'Medlem'}
                    </Badge>
                  </div>
                </div>
              ))}
              {group.members.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  +{group.members.length - 3} flere medlemmer
                </p>
              )}
            </div>
          </div>

          {/* Settings Summary */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Innstillinger</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant={group.settings.allowMemberBookings ? "default" : "secondary"}>
                {group.settings.allowMemberBookings ? "Medlemsbookinger" : "Kun eier bookinger"}
              </Badge>
              <Badge variant={group.settings.requireApproval ? "default" : "secondary"}>
                {group.settings.requireApproval ? "Krev godkjenning" : "Automatisk godkjenning"}
              </Badge>
              <Badge variant="outline">
                Maks {group.settings.maxBookingsPerMember} per medlem
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
              Se bookinger
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onInvite(group.id)}
              className="flex-1"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Inviter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Slett gruppe</DialogTitle>
            <DialogDescription>
              Er du sikker på at du vil slette gruppen "{group.name}"? Dette kan ikke angres.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Avbryt
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Slett gruppe
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
  const [showCreateDialog, setShowCreateDialog] = useState<boolean>(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Mine grupper</h2>
          <p className="text-muted-foreground">
            Administrer grupper for delte bookinger
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Opprett gruppe
        </Button>
      </div>

      {/* Groups Grid */}
      {groups.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Ingen grupper ennå</h3>
            <p className="text-muted-foreground text-center mb-4">
              Opprett din første gruppe for å dele bookinger med andre
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Opprett gruppe
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

