"use client";

import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Paperclip, Send, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { FormField } from "@/components/common/forms/FormField";
import { useFormValidation } from "@/hooks/shared";
import { CreateSupportTicketData } from "@/types/support";

/**
 * Props interface for SupportTicketForm component
 */
export interface ISupportTicketFormProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSubmit: (ticketData: CreateSupportTicketData) => void;
  readonly userId: string;
  readonly userName: string;
  readonly userEmail: string;
  readonly userType?: "tenant" | "landlord";
  readonly relatedBookingId?: string;
}

/**
 * File upload component for ticket attachments
 *
 * Handles file selection via drag-and-drop or file picker
 * Following Single Responsibility Principle
 */
const FileUpload: React.FC<{
  readonly files: readonly File[];
  readonly onFilesChange: (files: readonly File[]) => void;
}> = ({ files, onFilesChange }): JSX.Element => {
  const { t } = useTranslation("support");
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const handleFileSelect = useCallback(
    (selectedFiles: FileList | null): void => {
      if (selectedFiles) {
        const newFiles = Array.from(selectedFiles);
        onFilesChange([...files, ...newFiles]);
      }
    },
    [files, onFilesChange]
  );

  const handleDragOver = useCallback((e: React.DragEvent): void => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent): void => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent): void => {
      e.preventDefault();
      setIsDragOver(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  const removeFile = useCallback(
    (index: number): void => {
      const newFiles = files.filter((_, i) => i !== index);
      onFilesChange(newFiles);
    },
    [files, onFilesChange]
  );

  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }, []);

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">{t("attachments.title")}</label>

      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Paperclip className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground mb-2">
          {t("attachments.drag_drop")}
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
          type="button"
          onClick={() => document.getElementById("file-upload")?.click()}
        >
          {t("attachments.select_files")}
        </Button>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">
            {t("attachments.selected_files")}
          </h4>
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
                  type="button"
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
 *
 * Refactored with:
 * - i18n support using react-i18next
 * - SOLID principles (SRP - form management, file upload separated)
 * - Reusable FormField components
 * - Validation hook
 * - Pixel-perfect UI/UX maintained
 *
 * Features:
 * - Form validation with i18n
 * - File attachments with drag-and-drop
 * - Category and priority selection
 * - Related booking context
 * - User contact information display
 * - Loading states
 * - Error handling
 */
export const SupportTicketForm: React.FC<ISupportTicketFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  userId,
  userName,
  userEmail,
  userType = "tenant",
  relatedBookingId,
}): JSX.Element => {
  const { t } = useTranslation(["support", "validation", "common"]);

  const [category, setCategory] =
    useState<CreateSupportTicketData["category"]>("other");
  const [subject, setSubject] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [priority, setPriority] =
    useState<CreateSupportTicketData["priority"]>("medium");
  const [tags, setTags] = useState<string>("");
  const [files, setFiles] = useState<readonly File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Validation rules
  const { errors, validateAll, clearError, setError } = useFormValidation({
    subject: [{ type: "required" }],
    description: [{ type: "required" }],
  });

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async (): Promise<void> => {
    // Validate required fields
    if (!subject.trim()) {
      setError("subject", t("support:messages.validation.subject_required"));
      return;
    }

    if (!description.trim()) {
      setError(
        "description",
        t("support:messages.validation.description_required")
      );
      return;
    }

    if (!validateAll({ subject, description })) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert files to base64 (simplified - in real app would handle this properly)
      const attachments = files.map((file) => ({
        name: file.name,
        type: file.type,
        base64Data: "", // Would convert file to base64
        size: file.size,
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
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
      };

      onSubmit(ticketData);

      // Reset form
      setCategory("other");
      setSubject("");
      setDescription("");
      setPriority("medium");
      setTags("");
      setFiles([]);

      onClose();
    } catch (error) {
      setError("general", t("support:messages.error.generic"));
    } finally {
      setIsSubmitting(false);
    }
  }, [
    subject,
    description,
    validateAll,
    files,
    userId,
    userName,
    userEmail,
    category,
    priority,
    relatedBookingId,
    tags,
    onSubmit,
    onClose,
    t,
    setError,
  ]);

  /**
   * Get category description
   */
  const getCategoryDescription = useCallback(
    (cat: CreateSupportTicketData["category"]): string => {
      return t(`support:category_descriptions.${cat}`);
    },
    [t]
  );

  /**
   * Get priority description
   */
  const getPriorityDescription = useCallback(
    (prio: CreateSupportTicketData["priority"]): string => {
      return t(`support:priority_descriptions.${prio}`);
    },
    [t]
  );

  // Category options
  const categoryOptions = [
    { value: "booking", label: t("support:categories.booking") },
    { value: "technical", label: t("support:categories.technical") },
    { value: "billing", label: t("support:categories.billing") },
    { value: "feedback", label: t("support:categories.feedback") },
    { value: "other", label: t("support:categories.other") },
  ];

  // Priority options
  const priorityOptions = [
    { value: "low", label: t("support:priorities.low") },
    { value: "medium", label: t("support:priorities.medium") },
    { value: "high", label: t("support:priorities.high") },
    { value: "urgent", label: t("support:priorities.urgent") },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>{t("support:dialogs.create.title")}</span>
          </DialogTitle>
          <DialogDescription>
            {t("support:dialogs.create.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Category Selection */}
          <FormField
            id="category"
            name="category"
            label={t("support:fields.category")}
            type="select"
            value={category}
            onChange={(value) =>
              setCategory(value as CreateSupportTicketData["category"])
            }
            options={categoryOptions}
            helperText={getCategoryDescription(category)}
            required
          />

          {/* Priority Selection */}
          <FormField
            id="priority"
            name="priority"
            label={t("support:fields.priority")}
            type="select"
            value={priority}
            onChange={(value) =>
              setPriority(value as CreateSupportTicketData["priority"])
            }
            options={priorityOptions}
            helperText={getPriorityDescription(priority)}
            required
          />

          {/* Subject */}
          <FormField
            id="subject"
            name="subject"
            label={t("support:fields.subject")}
            type="text"
            value={subject}
            onChange={(value) => {
              setSubject(String(value));
              clearError("subject");
            }}
            placeholder={t("support:placeholders.subject")}
            helperText={t("support:helper_text.subject")}
            required
            error={errors.subject}
          />

          {/* Description */}
          <FormField
            id="description"
            name="description"
            label={t("support:fields.description")}
            type="textarea"
            value={description}
            onChange={(value) => {
              setDescription(String(value));
              clearError("description");
            }}
            placeholder={t("support:placeholders.description")}
            helperText={t("support:helper_text.description")}
            rows={6}
            required
            error={errors.description}
          />

          {/* Tags */}
          <FormField
            id="tags"
            name="tags"
            label={t("support:fields.tags")}
            type="text"
            value={tags}
            onChange={(value) => setTags(String(value))}
            placeholder={t("support:placeholders.tags")}
            helperText={t("support:helper_text.tags")}
          />

          {/* File Upload */}
          <FileUpload files={files} onFilesChange={setFiles} />

          {/* Related Booking Info */}
          {relatedBookingId && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Info className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">
                    {t("support:related.booking")}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("support:related.booking_id", { id: relatedBookingId })}
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
                  <span className="text-sm font-medium">
                    {t("support:contact_info.title")}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>{t("support:contact_info.name", { name: userName })}</p>
                  <p>{t("support:contact_info.email", { email: userEmail })}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            type="button"
          >
            {t("common:actions.cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !subject.trim() || !description.trim()}
            type="button"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                {t("support:actions.submitting", "Oppretter...")}
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                {t("support:actions.create_ticket")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
