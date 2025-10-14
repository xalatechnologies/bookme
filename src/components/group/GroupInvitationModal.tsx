"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Mail, UserPlus, Check, X, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GroupInvitation, InviteMemberData } from "@/types/group";
import { useGroupStore } from "@/stores/groupStore";

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
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (): Promise<void> => {
    if (!email.trim()) {
      alert("Vennligst fyll ut e-postadresse");
      return;
    }

    if (!email.includes("@")) {
      alert("Vennligst oppgi en gyldig e-postadresse");
      return;
    }

    setIsLoading(true);

    const invitation: InviteMemberData = {
      email: email.trim().toLowerCase(),
      invitedBy: "current-user", // This should come from auth context
      invitedByName: "Current User" // This should come from user context
    };

    try {
      onInvite(groupId, invitation);
      setEmail("");
      setMessage("");
      onClose();
    } catch (error) {
      console.error("Error inviting member:", error);
      alert("Kunne ikke sende invitasjon. Prøv igjen.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="invite-email" className="text-sm font-medium">
          E-postadresse *
        </Label>
        <Input
          id="invite-email"
          type="email"
          placeholder="bruker@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-describedby="invite-email-help"
        />
        <p id="invite-email-help" className="text-xs text-muted-foreground">
          E-postadressen til personen du vil invitere
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="invite-message" className="text-sm font-medium">
          Personlig melding (valgfritt)
        </Label>
        <Textarea
          id="invite-message"
          placeholder="Hei! Jeg vil gjerne invitere deg til å bli medlem av vår gruppe..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
        />
      </div>

      <div className="bg-blue-50 p-3 rounded-md">
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Invitasjon sendes via e-post</p>
            <p className="text-xs mt-1">
              Personen vil motta en e-post med lenke for å bli medlem av gruppen.
            </p>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          Avbryt
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading || !email.trim()}>
          {isLoading ? "Sender..." : "Send invitasjon"}
        </Button>
      </DialogFooter>
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
  const pendingInvitations = invitations.filter(inv => inv.status === 'pending');

  if (pendingInvitations.length === 0) {
    return (
      <div className="text-center py-8">
        <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Ingen ventende invitasjoner</h3>
        <p className="text-muted-foreground">
          Alle invitasjoner er behandlet
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
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    Ventende
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Invitert av {invitation.invitedByName} • {format(new Date(invitation.invitedAt), "dd.MM.yyyy HH:mm")}
                </p>
                <p className="text-xs text-muted-foreground">
                  Utløper {format(new Date(invitation.expiresAt), "dd.MM.yyyy HH:mm")}
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
                  Avslå
                </Button>
                <Button
                  size="sm"
                  onClick={() => onRespond(invitation.id, 'accepted')}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Godta
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
  const sentInvitations = invitations.filter(inv => inv.invitedBy === "current-user");

  if (sentInvitations.length === 0) {
    return (
      <div className="text-center py-8">
        <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Ingen sendte invitasjoner</h3>
        <p className="text-muted-foreground">
          Du har ikke sendt noen invitasjoner ennå
        </p>
      </div>
    );
  }

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
                    variant={
                      invitation.status === 'accepted' ? 'default' :
                      invitation.status === 'declined' ? 'destructive' :
                      invitation.status === 'expired' ? 'secondary' : 'outline'
                    }
                    className="text-xs"
                  >
                    {invitation.status === 'accepted' ? 'Godtatt' :
                     invitation.status === 'declined' ? 'Avslått' :
                     invitation.status === 'expired' ? 'Utløpt' : 'Ventende'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Sendt {format(new Date(invitation.invitedAt), "dd.MM.yyyy HH:mm")}
                </p>
                {invitation.acceptedAt && (
                  <p className="text-sm text-green-600">
                    Godtatt {format(new Date(invitation.acceptedAt), "dd.MM.yyyy HH:mm")}
                  </p>
                )}
                {invitation.declinedAt && (
                  <p className="text-sm text-red-600">
                    Avslått {format(new Date(invitation.declinedAt), "dd.MM.yyyy HH:mm")}
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
 */
export const GroupInvitationModal: React.FC<GroupInvitationModalProps> = ({
  isOpen,
  onClose,
  groupId,
  groupName,
  onInviteMember,
  onRespondToInvitation
}) => {
  const { getUserInvitations } = useGroupStore();
  const [invitations, setInvitations] = useState<readonly GroupInvitation[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Load invitations for current user
      const userInvitations = getUserInvitations("current-user");
      setInvitations(userInvitations);
    }
  }, [isOpen, getUserInvitations]);

  const handleInviteMember = (groupId: string, invitation: InviteMemberData): void => {
    onInviteMember(groupId, invitation);
    // Refresh invitations list
    const userInvitations = getUserInvitations("current-user");
    setInvitations(userInvitations);
  };

  const handleRespondToInvitation = (invitationId: string, response: 'accepted' | 'declined'): void => {
    onRespondToInvitation(invitationId, response);
    // Refresh invitations list
    const userInvitations = getUserInvitations("current-user");
    setInvitations(userInvitations);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5" />
            <span>Inviter medlemmer til {groupName}</span>
          </DialogTitle>
          <DialogDescription>
            Send invitasjoner til nye medlemmer eller administrer eksisterende invitasjoner
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="invite" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="invite">Send invitasjon</TabsTrigger>
            <TabsTrigger value="pending">Ventende invitasjoner</TabsTrigger>
            <TabsTrigger value="sent">Sendte invitasjoner</TabsTrigger>
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
      </DialogContent>
    </Dialog>
  );
};

