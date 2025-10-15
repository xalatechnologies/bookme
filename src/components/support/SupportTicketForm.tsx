"use client";

import React, { useState } from "react";
import { Paperclip, Send, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { CreateSupportTicketData } from "@/types/support";

/**
 * Props interface for SupportTicketForm component
 */
interface SupportTicketFormProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSubmit: (ticketData: CreateSupportTicketData) => void;
  readonly userId: string;
  readonly userName: string;
  readonly userEmail: string;
  readonly userType?: 'tenant' | 'landlord';
  readonly relatedBookingId?: string;
}

/**
 * File upload component for ticket attachments
 */
const FileUpload: React.FC<{
  readonly files: readonly File[];
  readonly onFilesChange: (files: readonly File[]) => void;
}> = ({ files, onFilesChange }) => {
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const handleFileSelect = (selectedFiles: FileList | null): void => {
    if (selectedFiles) {
      const newFiles = Array.from(selectedFiles);
      onFilesChange([...files, ...newFiles]);
    }
  };

  const handleDragOver = (e: React.DragEvent): void => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent): void => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent): void => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (index: number): void => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Vedlegg (valgfritt)</Label>
      
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragOver 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-muted-foreground/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Paperclip className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground mb-2">
          Dra og slipp filer her, eller klikk for å velge
        </p>
        <input
          type="file"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
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

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Valgte filer</h4>
          <div className="space-y-1">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-muted rounded-md"
              >
                <div className="flex items-center space-x-2">
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{file.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {formatFileSize(file.size)}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="h-6 w-6 p-0"
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Support ticket form component
 * 
 * Provides a comprehensive form for creating support tickets with
 * category selection, priority setting, and file attachments.
 */
export const SupportTicketForm: React.FC<SupportTicketFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  userId,
  userName,
  userEmail,
  userType = 'tenant',
  relatedBookingId
}) => {
  const [category, setCategory] = useState<CreateSupportTicketData['category']>('other');
  const [subject, setSubject] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [priority, setPriority] = useState<CreateSupportTicketData['priority']>('medium');
  const [tags, setTags] = useState<string>("");
  const [files, setFiles] = useState<readonly File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (): Promise<void> => {
    if (!subject.trim()) {
      alert("Vennligst fyll ut emne");
      return;
    }

    if (!description.trim()) {
      alert("Vennligst fyll ut beskrivelse");
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert files to base64 (simplified - in real app would handle this properly)
      const attachments = files.map(file => ({
        name: file.name,
        type: file.type,
        base64Data: '', // Would convert file to base64
        size: file.size
      }));

      const ticketData: CreateSupportTicketData = {
        userId,
        userName,
        userEmail,
        category,
        subject: subject.trim(),
        description: description.trim(),
        priority,
        attachments: attachments.length > 0 ? attachments : undefined,
        relatedBookingId,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      };

      onSubmit(ticketData);
      
      // Reset form
      setCategory('other');
      setSubject('');
      setDescription('');
      setPriority('medium');
      setTags('');
      setFiles([]);
      
      onClose();
    } catch (error) {
      alert('Kunne ikke opprette ticket. Prøv igjen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryDescription = (cat: CreateSupportTicketData['category']): string => {
    switch (cat) {
      case 'booking': return 'Spørsmål eller problemer med bookinger';
      case 'technical': return 'Tekniske problemer eller feil';
      case 'billing': return 'Spørsmål om fakturering eller betaling';
      case 'feedback': return 'Tilbakemelding eller forslag';
      case 'other': return 'Andre spørsmål eller problemer';
      default: return '';
    }
  };

  const getPriorityDescription = (prio: CreateSupportTicketData['priority']): string => {
    switch (prio) {
      case 'low': return 'Ikke kritisk, kan vente';
      case 'medium': return 'Viktig, men ikke akutt';
      case 'high': return 'Kritisk, trenger rask hjelp';
      case 'urgent': return 'Meget kritisk, trenger umiddelbar hjelp';
      default: return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>Opprett support-ticket</span>
          </DialogTitle>
          <DialogDescription>
            Beskriv problemet ditt så detaljert som mulig for rask hjelp
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Kategori *
            </Label>
            <Select value={category} onValueChange={(value: CreateSupportTicketData['category']) => setCategory(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Velg kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="booking">Booking</SelectItem>
                <SelectItem value="technical">Teknisk</SelectItem>
                <SelectItem value="billing">Fakturering</SelectItem>
                <SelectItem value="feedback">Tilbakemelding</SelectItem>
                <SelectItem value="other">Annet</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {getCategoryDescription(category)}
            </p>
          </div>

          {/* Priority Selection */}
          <div className="space-y-2">
            <Label htmlFor="priority" className="text-sm font-medium">
              Prioritet *
            </Label>
            <Select value={priority} onValueChange={(value: CreateSupportTicketData['priority']) => setPriority(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Velg prioritet" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Lav</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">Høy</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {getPriorityDescription(priority)}
            </p>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-sm font-medium">
              Emne *
            </Label>
            <Input
              id="subject"
              placeholder="Beskriv problemet kort..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              aria-describedby="subject-help"
            />
            <p id="subject-help" className="text-xs text-muted-foreground">
              En kort beskrivelse av problemet
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Beskrivelse *
            </Label>
            <Textarea
              id="description"
              placeholder="Beskriv problemet så detaljert som mulig..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              aria-describedby="description-help"
            />
            <p id="description-help" className="text-xs text-muted-foreground">
              Inkluder steg for å reprodusere problemet, feilmeldinger, og hva du forventet å skje
            </p>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags" className="text-sm font-medium">
              Tagger (valgfritt)
            </Label>
            <Input
              id="tags"
              placeholder="f.eks. booking, betaling, mobil"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              aria-describedby="tags-help"
            />
            <p id="tags-help" className="text-xs text-muted-foreground">
              Separer tagger med komma for bedre kategorisering
            </p>
          </div>

          {/* File Upload */}
          <FileUpload files={files} onFilesChange={setFiles} />

          {/* Related Booking Info */}
          {relatedBookingId && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Info className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Relatert til booking</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Denne ticketten er knyttet til booking #{relatedBookingId}
                </p>
              </CardContent>
            </Card>
          )}

          {/* User Info */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Info className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Kontaktinformasjon</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Navn: {userName}</p>
                  <p>E-post: {userEmail}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Avbryt
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !subject.trim() || !description.trim()}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Oppretter...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Opprett ticket
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
