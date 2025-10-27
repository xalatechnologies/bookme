"use client";

import React, { useState } from "react";
import { X, Paperclip, Send, User, Users, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMessageStore } from "@/stores/messageStore";
import { toast } from "react-toastify";

interface CreateThreadModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly currentUserId: string;
  readonly currentUserName: string;
  readonly currentUserType: 'tenant' | 'landlord';
}

interface Participant {
  readonly id: string;
  readonly name: string;
  readonly type: 'tenant' | 'landlord';
}

const CreateThreadModal: React.FC<CreateThreadModalProps> = ({
  isOpen,
  onClose,
  currentUserId,
  currentUserName,
  currentUserType
}) => {
  const { createThread, getAvailableParticipants, getBookedFacilities } = useMessageStore();
  const [subject, setSubject] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [selectedParticipant, setSelectedParticipant] = useState<string>("");
  const [selectedFacility, setSelectedFacility] = useState<string>("");
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Get available participants and facilities based on active bookings
  const availableParticipants: Participant[] = getAvailableParticipants(currentUserId, currentUserType);
  const bookedFacilities = getBookedFacilities(currentUserId, currentUserType);

  // Show message if no participants or facilities available
  if (availableParticipants.length === 0 || bookedFacilities.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-center">
              Ingen tilgjengelige kontakter
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              {currentUserType === 'tenant' 
                ? 'Du har ingen bookinger ennå. Book et lokale først for å kunne sende meldinger til utleier.'
                : 'Du har ingen bookinger ennå. Godkjenn bookinger først for å kunne sende meldinger til leietakere.'
              }
            </p>
            {bookedFacilities.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Du trenger bookede lokaler for å kunne sende meldinger.
              </p>
            )}
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={onClose}>
                Lukk
              </Button>
              {currentUserType === 'tenant' && (
                <Button onClick={() => {
                  onClose();
                  window.location.href = '/user/facilities';
                }}>
                  Utforsk lokaler
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!subject.trim() || !content.trim() || !selectedParticipant || !selectedFacility) {
      toast.error("Vennligst fyll ut alle påkrevde felt");
      return;
    }

    setIsLoading(true);

    try {
      // Convert attachments to base64
      const attachmentData = await Promise.all(
        attachments.map(async (file) => ({
          name: file.name,
          type: file.type,
          base64Data: await fileToBase64(file),
          size: file.size
        }))
      );

      const participant = availableParticipants.find(p => p.id === selectedParticipant);
      if (!participant) {
        toast.error("Valgt deltaker ikke funnet");
        return;
      }

      const facility = bookedFacilities.find(f => f.id === selectedFacility);
      if (!facility) {
        toast.error("Valgt lokale ikke funnet");
        return;
      }

      const threadId = createThread({
        subject: subject.trim(),
        participants: [
          { id: currentUserId, name: currentUserName, type: currentUserType },
          participant
        ],
        priority,
        facilityId: facility.id,
        facilityName: facility.name,
        relatedBookingId: facility.bookingId,
        initialMessage: {
          content: content.trim(),
          attachments: attachmentData
        }
      });

      toast.success(currentUserType === 'tenant' ? 'Melding sendt til utleier!' : 'Melding sendt til leietaker!');
      
      // Reset form
      setSubject("");
      setContent("");
      setSelectedParticipant("");
      setSelectedFacility("");
      setPriority("medium");
      setAttachments([]);
      
      onClose();
    } catch (error) {
      toast.error("Feil ved opprettelse av meldingstråd");
    } finally {
      setIsLoading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remove data:type;base64, prefix
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[75vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 flex-shrink-0">
          <CardTitle className="text-xl font-semibold">
            {currentUserType === 'tenant' ? 'Send melding til utleier' : 'Send melding til leietaker'}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6 overflow-y-auto flex-1 min-h-0">
          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Emne *</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Skriv emne for meldingen..."
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">
              {subject.length}/100 tegn
            </p>
          </div>

          {/* Recipient */}
          <div className="space-y-2">
            <Label htmlFor="recipient">
              {currentUserType === 'tenant' ? 'Utleier *' : 'Leietaker *'}
            </Label>
            <Select value={selectedParticipant} onValueChange={setSelectedParticipant}>
              <SelectTrigger>
                <SelectValue placeholder={currentUserType === 'tenant' ? 'Velg utleier' : 'Velg leietaker'} />
              </SelectTrigger>
              <SelectContent>
                {availableParticipants.map((participant) => (
                  <SelectItem key={participant.id} value={participant.id}>
                    <div className="flex items-center gap-2">
                      {participant.type === 'landlord' ? (
                        <Users className="h-4 w-4" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                      <span>{participant.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {participant.type === 'landlord' ? 'Utleier' : 'Leietaker'}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Facility Selection */}
          <div className="space-y-2">
            <Label htmlFor="facility">Lokale *</Label>
            <Select value={selectedFacility} onValueChange={setSelectedFacility}>
              <SelectTrigger>
                <SelectValue placeholder="Velg lokale" />
              </SelectTrigger>
              <SelectContent>
                {bookedFacilities.map((facility) => (
                  <SelectItem key={facility.id} value={facility.id}>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      <span>{facility.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Velg hvilket lokale meldingen gjelder
            </p>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">Prioritet</Label>
            <Select value={priority} onValueChange={(value: 'low' | 'medium' | 'high') => setPriority(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>Lav prioritet</span>
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <span>Medium prioritet</span>
                  </div>
                </SelectItem>
                <SelectItem value="high">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span>Høy prioritet</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Message content */}
          <div className="space-y-2">
            <Label htmlFor="content">Melding *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Skriv meldingen din her..."
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {content.length} tegn
            </p>
          </div>

          {/* File attachments */}
          <div className="space-y-2">
            <Label>Vedlegg (valgfritt)</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
              <div className="flex flex-col items-center gap-2">
                <Paperclip className="h-8 w-8 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-sm font-medium">Legg til vedlegg</p>
                  <p className="text-xs text-muted-foreground">
                    Dra og slipp filer her, eller klikk for å velge
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  Velg filer
                </Button>
              </div>
            </div>

            {/* Attachment previews */}
            {attachments.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Vedlegg:</p>
                <div className="space-y-1">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-muted rounded"
                    >
                      <div className="flex items-center gap-2">
                        <Paperclip className="h-4 w-4" />
                        <span className="text-sm truncate">{file.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(index)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t bg-muted/50 flex-shrink-0">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Avbryt
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading || !subject.trim() || !content.trim() || !selectedParticipant}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Sender...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                {currentUserType === 'tenant' ? 'Send til utleier' : 'Send til leietaker'}
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CreateThreadModal;
