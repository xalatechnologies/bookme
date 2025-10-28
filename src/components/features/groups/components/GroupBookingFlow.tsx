"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Users, Calendar, Clock, MapPin, DollarSign, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { BookingGroup, CreateGroupBookingData } from "@/types/group";
import { useGroupStore } from "@/stores/groupStore";

/**
 * Props interface for GroupBookingFlow component
 */
interface GroupBookingFlowProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSubmit: (bookingData: CreateGroupBookingData) => void;
  readonly facilityId: string;
  readonly facilityName: string;
  readonly zoneId: string;
  readonly zoneName: string;
  readonly availableTimeSlots: readonly string[];
  readonly pricePerHour: number;
  readonly selectedDate: Date;
}

/**
 * Group selection component
 */
const GroupSelector: React.FC<{
  readonly groups: readonly BookingGroup[];
  readonly selectedGroupId: string;
  readonly onGroupChange: (groupId: string) => void;
}> = ({ groups, selectedGroupId, onGroupChange }) => {
  const { t } = useTranslation('common');
  const selectedGroup = groups.find(group => group.id === selectedGroupId);

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">Velg gruppe</Label>
      <div className="space-y-2">
        {groups.map((group) => (
          <Card
            key={group.id}
            className={`cursor-pointer transition-colors ${
              selectedGroupId === group.id
                ? 'ring-2 ring-primary bg-primary/5'
                : 'hover:bg-muted/50'
            }`}
            onClick={() => onGroupChange(group.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span className="font-medium">{group.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {group.members.length} medlemmer
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {group.description || "Ingen beskrivelse"}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedGroupId === group.id}
                    onChange={() => onGroupChange(group.id)}
                    aria-label={`Velg ${group.name}`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

/**
 * Member selection component for cost sharing
 */
const MemberSelector: React.FC<{
  readonly members: readonly BookingGroup['members'];
  readonly selectedMembers: readonly string[];
  readonly onMembersChange: (memberIds: readonly string[]) => void;
  readonly totalCost: number;
}> = ({ members, selectedMembers, onMembersChange, totalCost }) => {
  const costPerMember = selectedMembers.length > 0 ? totalCost / selectedMembers.length : 0;

  const handleMemberToggle = (memberId: string): void => {
    if (selectedMembers.includes(memberId)) {
      onMembersChange(selectedMembers.filter(id => id !== memberId));
    } else {
      onMembersChange([...selectedMembers, memberId]);
    }
  };

  const handleSelectAll = (): void => {
    if (selectedMembers.length === members.length) {
      onMembersChange([]);
    } else {
      onMembersChange(members.map(member => member.userId));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Velg medlemmer for kostnadsdeling</Label>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSelectAll}
        >
          {selectedMembers.length === members.length ? 'Fjern alle' : 'Velg alle'}
        </Button>
      </div>

      <div className="space-y-2">
        {members.map((member) => (
          <div
            key={member.userId}
            className="flex items-center justify-between p-3 border rounded-md"
          >
            <div className="flex items-center space-x-3">
              <Checkbox
                id={`member-${member.userId}`}
                checked={selectedMembers.includes(member.userId)}
                onCheckedChange={() => handleMemberToggle(member.userId)}
                aria-label={`Velg ${member.name}`}
              />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-sm text-primary-foreground">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium">{member.name}</div>
                  <div className="text-sm text-muted-foreground">{member.email}</div>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                {member.role === 'owner' ? 'Eier' : member.role === 'admin' ? 'Admin' : 'Medlem'}
              </Badge>
            </div>
            {selectedMembers.includes(member.userId) && (
              <div className="text-sm font-medium text-green-600">
                {costPerMember.toLocaleString('no-NO')} kr
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedMembers.length > 0 && (
        <div className="bg-muted p-3 rounded-md">
          <div className="flex justify-between items-center text-sm">
            <span>Kostnad per medlem:</span>
            <span className="font-semibold">
              {costPerMember.toLocaleString('no-NO')} kr
            </span>
          </div>
          <div className="flex justify-between items-center text-sm mt-1">
            <span>Total kostnad:</span>
            <span className="font-semibold">
              {totalCost.toLocaleString('no-NO')} kr
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Booking details form component
 */
const BookingDetailsForm: React.FC<{
  readonly purpose: string;
  readonly onPurposeChange: (purpose: string) => void;
  readonly attendees: number;
  readonly onAttendeesChange: (attendees: number) => void;
  readonly timeSlot: string;
  readonly onTimeSlotChange: (timeSlot: string) => void;
  readonly availableTimeSlots: readonly string[];
}> = ({
  purpose,
  onPurposeChange,
  attendees,
  onAttendeesChange,
  timeSlot,
  onTimeSlotChange,
  availableTimeSlots
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="group-purpose" className="text-sm font-medium">
          Formål for bookingen *
        </Label>
        <Input
          id="group-purpose"
          placeholder={t('common:placeholders.groupBookingPurpose')}
          value={purpose}
          onChange={(e) => onPurposeChange(e.target.value)}
          aria-describedby="group-purpose-help"
        />
        <p id="group-purpose-help" className="text-xs text-muted-foreground">
          Beskriv hva gruppen skal bruke lokalet til
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="group-attendees" className="text-sm font-medium">
            Antall deltakere
          </Label>
          <Input
            id="group-attendees"
            type="number"
            min="1"
            value={attendees}
            onChange={(e) => onAttendeesChange(parseInt(e.target.value) || 1)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="group-time-slot" className="text-sm font-medium">
            Tidspunkt *
          </Label>
          <Select value={timeSlot} onValueChange={onTimeSlotChange}>
            <SelectTrigger>
              <SelectValue placeholder={t('common:placeholders.selectTimeSlot')} />
            </SelectTrigger>
            <SelectContent>
              {availableTimeSlots.map((slot) => (
                <SelectItem key={slot} value={slot}>
                  {slot}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

/**
 * Group booking flow component
 * 
 * Provides a comprehensive interface for creating group bookings with
 * member selection, cost sharing, and booking details configuration.
 */
export const GroupBookingFlow: React.FC<GroupBookingFlowProps> = ({
  isOpen,
  onClose,
  onSubmit,
  facilityId,
  facilityName,
  zoneId,
  zoneName,
  availableTimeSlots,
  pricePerHour,
  selectedDate
}) => {
  const { getUserGroups, getGroupMembers } = useGroupStore();
  const [groups, setGroups] = useState<readonly BookingGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [selectedMembers, setSelectedMembers] = useState<readonly string[]>([]);
  const [purpose, setPurpose] = useState<string>("");
  const [attendees, setAttendees] = useState<number>(1);
  const [timeSlot, setTimeSlot] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      const userGroups = getUserGroups("current-user");
      setGroups(userGroups);
      if (userGroups.length > 0) {
        setSelectedGroupId(userGroups[0].id);
      }
    }
  }, [isOpen, getUserGroups]);

  useEffect(() => {
    if (selectedGroupId) {
      const members = getGroupMembers(selectedGroupId);
      setSelectedMembers(members.map(member => member.userId));
    }
  }, [selectedGroupId, getGroupMembers]);

  const selectedGroup = groups.find(group => group.id === selectedGroupId);
  const members = selectedGroup ? getGroupMembers(selectedGroupId) : [];
  
  // Calculate pricing
  const duration = timeSlot ? (() => {
    const [start, end] = timeSlot.split('-').map(t => t.trim());
    const startHour = parseInt(start.split(':')[0]);
    const endHour = parseInt(end.split(':')[0]);
    return endHour - startHour;
  })() : 0;
  
  const totalCost = duration * pricePerHour;
  const costPerMember = selectedMembers.length > 0 ? totalCost / selectedMembers.length : 0;

  const handleSubmit = (): void => {
    if (!selectedGroupId) {
      alert("Vennligst velg en gruppe");
      return;
    }

    if (!timeSlot) {
      alert("Vennligst velg et tidspunkt");
      return;
    }

    if (!purpose.trim()) {
      alert("Vennligst fyll ut formål");
      return;
    }

    if (selectedMembers.length === 0) {
      alert("Vennligst velg minst ett medlem for kostnadsdeling");
      return;
    }

    const bookingData: CreateGroupBookingData = {
      groupId: selectedGroupId,
      createdBy: "current-user", // This should come from auth context
      createdByName: "Current User", // This should come from user context
      facilityId,
      facilityName,
      zoneId,
      zoneName,
      date: selectedDate,
      timeSlot,
      purpose: purpose.trim(),
      attendees,
      costSharing: {
        totalCost,
        costPerMember,
        members: selectedMembers.map(memberId => {
          const member = members.find(m => m.userId === memberId);
          return {
            userId: memberId,
            name: member?.name || "Unknown",
            share: costPerMember,
            paid: false
          };
        })
      }
    };

    onSubmit(bookingData);
    onClose();
  };

  if (groups.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ingen grupper tilgjengelig</DialogTitle>
            <DialogDescription>
              Du må være medlem av minst én gruppe for å opprette gruppebookinger
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={onClose}>Lukk</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Opprett gruppebokering</span>
          </DialogTitle>
          <DialogDescription>
            Book {facilityName} - {zoneName} for {format(selectedDate, "dd.MM.yyyy")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Facility Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lokaleinformasjon</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{facilityName}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{format(selectedDate, "dd.MM.yyyy")}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>{pricePerHour} kr/time</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Group Selection */}
          <GroupSelector
            groups={groups}
            selectedGroupId={selectedGroupId}
            onGroupChange={setSelectedGroupId}
          />

          {/* Booking Details */}
          <BookingDetailsForm
            purpose={purpose}
            onPurposeChange={setPurpose}
            attendees={attendees}
            onAttendeesChange={setAttendees}
            timeSlot={timeSlot}
            onTimeSlotChange={setTimeSlot}
            availableTimeSlots={availableTimeSlots}
          />

          {/* Member Selection and Cost Sharing */}
          {selectedGroup && (
            <MemberSelector
              members={members}
              selectedMembers={selectedMembers}
              onMembersChange={setSelectedMembers}
              totalCost={totalCost}
            />
          )}

          {/* Cost Summary */}
          {timeSlot && selectedMembers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Kostnadsoversikt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Varighet:</span>
                  <span>{duration === 1 ? '1 time' : `${duration} timer`}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Pris per time:</span>
                  <span>{pricePerHour.toLocaleString('no-NO')} kr</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total kostnad:</span>
                  <span>{totalCost.toLocaleString('no-NO')} kr</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Kostnad per medlem ({selectedMembers.length} medlemmer):</span>
                  <span className="font-semibold">{costPerMember.toLocaleString('no-NO')} kr</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Avbryt
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedGroupId || !timeSlot || !purpose.trim() || selectedMembers.length === 0}
          >
            Opprett gruppebokering
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

