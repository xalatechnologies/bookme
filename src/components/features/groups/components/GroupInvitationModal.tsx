"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Mail, UserPlus, Check, X, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { BaseModal } from "@/components/common/modals/BaseModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GroupInvitation, InviteMemberData } from "@/types/group";
import { useGroupStore } from "@/stores/groupStore";
import { StatusBadge } from "@/components/common/status/StatusBadge";

/**
 * Props interface for GroupInvitationModal component
 */
interface GroupInvitationModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly groupId: string;
  readonly groupName: string;
  readonly onInviteMember: (groupId: string, invitation: InviteMemberData) => void;
  readonly onRespondToInvitation: (invitationId: string, response: 'accepted' | 'declined') => void;
}

/**
 * Invite member form component
 */
const InviteMemberForm: React.FC<{
  readonly groupId: string;
  readonly onInvite: (groupId: string, invitation: InviteMemberData) => void;
  readonly onClose: () => void;
}> = ({ groupId, onInvite, onClose }) => {
  const { t } = useTranslation(['groups', 'common']);
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (): Promise<void> => {
    if (!email.trim()) {
      alert(t('invitation_modal.validation.email_required'));
      return;
    }

    if (!email.includes("@")) {
      alert(t('invitation_modal.validation.email_invalid'));
      return;
    }

    setIsLoading(true);

    const invitation: InviteMemberData = {
      email: email.trim().toLowerCase(),
      invitedBy: "current-user",
      invitedByName: "Current User"
    };

    try {
      onInvite(groupId, invitation);
      setEmail("");
      setMessage("");
      onClose();
    } catch (error) {
      alert(t('invitation_modal.messages.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="invite-email" className="text-sm font-medium">
          {t('invitation_modal.form.email')} *
        </Label>
        <Input
          id="invite-email"
          type="email"
          placeholder={t('invitation_modal.form.email_placeholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-describedby="invite-email-help"
        />
        <p id="invite-email-help" className="text-xs text-muted-foreground">
          {t('invitation_modal.form.email_help')}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="invite-message" className="text-sm font-medium">
          {t('invitation_modal.form.message')}
        </Label>
        <Textarea
          id="invite-message"
          placeholder={t('invitation_modal.form.message_placeholder')}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
        />
      </div>

      <div className="bg-blue-50 p-3 rounded-md">
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">{t('invitation_modal.form.info_title')}</p>
            <p className="text-xs mt-1">
              {t('invitation_modal.form.info_description')}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          {t('common:actions.cancel')}
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading || !email.trim()}>
          {isLoading ? t('invitation_modal.form.sending') : t('invitation_modal.form.send_invitation')}
        </Button>
      </div>
    </div>
  );
};

/**
 * Pending invitations list component
 */
const PendingInvitationsList: React.FC<{
  readonly invitations: readonly GroupInvitation[];
  readonly onRespond: (invitationId: string, response: 'accepted' | 'declined') => void;
}> = ({ invitations, onRespond }) => {
  const { t } = useTranslation('groups');
  const pendingInvitations = invitations.filter(inv => inv.status === 'pending');

  if (pendingInvitations.length === 0) {
    return (
      <div className="text-center py-8">
        <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">{t('invitation_modal.pending.title')}</h3>
        <p className="text-muted-foreground">
          {t('invitation_modal.pending.description')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {pendingInvitations.map((invitation) => (
        <Card key={invitation.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{invitation.email}</span>
                  <StatusBadge
                    status="pending"
                    translationKey="groups:invitation_modal.pending.status"
                    showIcon={true}
                    size="sm"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('invitation_modal.pending.invited_by', { name: invitation.invitedByName })} • {format(new Date(invitation.invitedAt), "dd.MM.yyyy HH:mm")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('invitation_modal.pending.expires', { date: format(new Date(invitation.expiresAt), "dd.MM.yyyy HH:mm") })}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onRespond(invitation.id, 'declined')}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4 mr-1" />
                  {t('invitation_modal.pending.decline')}
                </Button>
                <Button
                  size="sm"
                  onClick={() => onRespond(invitation.id, 'accepted')}
                >
                  <Check className="h-4 w-4 mr-1" />
                  {t('invitation_modal.pending.accept')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

/**
 * Sent invitations list component
 */
const SentInvitationsList: React.FC<{
  readonly invitations: readonly GroupInvitation[];
}> = ({ invitations }) => {
  const { t } = useTranslation('groups');
  const sentInvitations = invitations.filter(inv => inv.invitedBy === "current-user");

  if (sentInvitations.length === 0) {
    return (
      <div className="text-center py-8">
        <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">{t('invitation_modal.sent.title')}</h3>
        <p className="text-muted-foreground">
          {t('invitation_modal.sent.description')}
        </p>
      </div>
    );
  }

  const getStatusVariant = (status: string): "default" | "destructive" | "secondary" | "outline" => {
    switch (status) {
      case 'accepted':
        return 'default';
      case 'declined':
        return 'destructive';
      case 'expired':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'accepted':
        return t('invitation_modal.sent.status_accepted');
      case 'declined':
        return t('invitation_modal.sent.status_declined');
      case 'expired':
        return t('invitation_modal.sent.status_expired');
      default:
        return t('invitation_modal.sent.status_pending');
    }
  };

  return (
    <div className="space-y-3">
      {sentInvitations.map((invitation) => (
        <Card key={invitation.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{invitation.email}</span>
                  <Badge
                    variant={getStatusVariant(invitation.status)}
                    className="text-xs"
                  >
                    {getStatusLabel(invitation.status)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('invitation_modal.sent.sent_date', { date: format(new Date(invitation.invitedAt), "dd.MM.yyyy HH:mm") })}
                </p>
                {invitation.acceptedAt && (
                  <p className="text-sm text-green-600">
                    {t('invitation_modal.sent.accepted_date', { date: format(new Date(invitation.acceptedAt), "dd.MM.yyyy HH:mm") })}
                  </p>
                )}
                {invitation.declinedAt && (
                  <p className="text-sm text-red-600">
                    {t('invitation_modal.sent.declined_date', { date: format(new Date(invitation.declinedAt), "dd.MM.yyyy HH:mm") })}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

/**
 * Group invitation modal component
 *
 * Provides comprehensive invitation management including sending new invitations,
 * viewing pending invitations, and managing sent invitations.
 *
 * Follows SOLID principles:
 * - Single Responsibility: Each sub-component handles one specific aspect
 * - Open/Closed: Extends BaseModal without modifying it
 * - Dependency Inversion: Depends on BaseModal abstraction
 */
export const GroupInvitationModal: React.FC<GroupInvitationModalProps> = ({
  isOpen,
  onClose,
  groupId,
  groupName,
  onInviteMember,
  onRespondToInvitation
}): JSX.Element => {
  const { t } = useTranslation('groups');
  const { getUserInvitations } = useGroupStore();
  const [invitations, setInvitations] = useState<readonly GroupInvitation[]>([]);

  useEffect(() => {
    if (isOpen) {
      const userInvitations = getUserInvitations("current-user");
      setInvitations(userInvitations);
    }
  }, [isOpen, getUserInvitations]);

  const handleInviteMember = (groupId: string, invitation: InviteMemberData): void => {
    onInviteMember(groupId, invitation);
    const userInvitations = getUserInvitations("current-user");
    setInvitations(userInvitations);
  };

  const handleRespondToInvitation = (invitationId: string, response: 'accepted' | 'declined'): void => {
    onRespondToInvitation(invitationId, response);
    const userInvitations = getUserInvitations("current-user");
    setInvitations(userInvitations);
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('invitation_modal.title', { groupName })}
      description={t('invitation_modal.description')}
      size="4xl"
      titleIcon={<UserPlus className="h-5 w-5" />}
    >
      <Tabs defaultValue="invite" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="invite">{t('invitation_modal.tabs.send')}</TabsTrigger>
          <TabsTrigger value="pending">{t('invitation_modal.tabs.pending')}</TabsTrigger>
          <TabsTrigger value="sent">{t('invitation_modal.tabs.sent')}</TabsTrigger>
        </TabsList>

        <TabsContent value="invite" className="space-y-4">
          <InviteMemberForm
            groupId={groupId}
            onInvite={handleInviteMember}
            onClose={onClose}
          />
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <PendingInvitationsList
            invitations={invitations}
            onRespond={handleRespondToInvitation}
          />
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          <SentInvitationsList invitations={invitations} />
        </TabsContent>
      </Tabs>
    </BaseModal>
  );
};
