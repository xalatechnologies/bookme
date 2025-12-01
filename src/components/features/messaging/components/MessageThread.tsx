"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import {
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Reply,
  Forward,
  Star,
  StarOff,
  Download,
  EyeOff,
  Trash2,
  Building,
  Check,
  CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Message } from "@/types/message";
import { useMessageStore } from "@/stores/messageStore";
import { cn } from "@/lib/utils/cn";
import { useUserProfile } from "@/contexts/hooks";

interface MessageThreadProps {
  readonly threadId: string;
  readonly currentUserId: string;
  readonly onClose: () => void;
  readonly currentUserType?: "tenant" | "landlord";
  readonly showHeader?: boolean;
}

interface MessageBubbleProps {
  readonly message: Message;
  readonly isOwn: boolean;
  readonly showAvatar: boolean;
  readonly onReply: (message: Message) => void;
  readonly onForward: (message: Message) => void;
  readonly onStar: (messageId: string) => void;
  readonly onDelete: (messageId: string) => void;
  readonly getUserAvatar: (senderName: string, senderId: string) => string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  showAvatar,
  onReply,
  onForward,
  onStar,
  onDelete,
  getUserAvatar,
}) => {
  const [isStarred, setIsStarred] = useState<boolean>(false);
  const [showActions, setShowActions] = useState<boolean>(false);

  const getStatusIcon = (status: Message["status"]) => {
    switch (status) {
      case "sent":
        return <Check className="h-3 w-3 text-muted-foreground" />;
      case "delivered":
        return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
      case "read":
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      default:
        return null;
    }
  };

  const handleStar = useCallback(() => {
    setIsStarred(!isStarred);
    onStar(message.id);
  }, [isStarred, onStar, message.id]);

  const handleReplyClick = useCallback(() => {
    onReply(message);
  }, [onReply, message]);

  const handleForwardClick = useCallback(() => {
    onForward(message);
  }, [onForward, message]);

  const handleDeleteClick = useCallback(() => {
    onDelete(message.id);
  }, [onDelete, message.id]);

  const handleDownloadClick = useCallback((
     
    _attachment: { readonly id: string; readonly name: string; readonly type: string; readonly size: number }
  ) => {
    // Create download link from attachment data
    // In a real implementation, this would fetch the actual file data

    // TODO: Implement actual download logic when backend is ready
    // const link = document.createElement("a");
    // link.href = `data:${_attachment.type};base64,${_attachment.base64Data}`;
    // link.download = _attachment.name;
    // link.click();
  }, []);

  return (
    <div
      className={cn(
        "flex gap-2 group",
        isOwn ? "flex-row-reverse" : "flex-row"
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {showAvatar && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage
            src={getUserAvatar(message.senderName, message.senderId)}
            alt={message.senderName}
            className="object-cover"
          />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
            {message.senderName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}

      {!showAvatar && (
        <div className="w-8" /> // Spacer for alignment
      )}

      <div
        className={cn(
          "flex flex-col max-w-[70%]",
          isOwn ? "items-end" : "items-start"
        )}
      >
        {!isOwn && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-muted-foreground dark:text-gray-400">
              {message.senderName}
            </span>
            <span className="text-xs text-muted-foreground dark:text-gray-500">
              {format(new Date(message.createdAt), "HH:mm")}
            </span>
          </div>
        )}

        <div
          className={cn(
            "relative px-4 py-2 rounded-2xl",
            isOwn
              ? "bg-primary text-primary-foreground rounded-br-md dark:bg-blue-600"
              : "bg-muted text-foreground rounded-bl-md dark:bg-gray-700 dark:text-white"
          )}
        >
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center gap-2 p-2 bg-background/50 rounded-lg dark:bg-gray-600/50"
                >
                  <Paperclip className="h-4 w-4 dark:text-gray-300" />
                  <span className="text-xs truncate dark:text-gray-300">{attachment.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 dark:text-gray-300 dark:hover:bg-gray-600"
                    onClick={() => handleDownloadClick(attachment)}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Message actions */}
          {showActions && (
            <div
              className={cn(
                "absolute -top-8 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
                isOwn ? "right-0" : "left-0"
              )}
            >
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={handleReplyClick}
              >
                <Reply className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={handleForwardClick}
              >
                <Forward className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={handleStar}
              >
                {isStarred ? (
                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
                ) : (
                  <StarOff className="h-3 w-3" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={handleDeleteClick}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {isOwn && (
          <div className="flex items-center gap-1 mt-1">
            {getStatusIcon(message.status)}
            <span className="text-xs text-muted-foreground">
              {format(new Date(message.createdAt), "HH:mm")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export const MessageThread: React.FC<MessageThreadProps> = ({
  threadId,
  currentUserId,
  onClose,
  currentUserType = "tenant",
  showHeader = true,
}) => {
  const { t } = useTranslation(['common']);
  const {
    getThreadById,
    getMessagesByThread,
    sendMessage,
    markAllMessagesAsRead,
    updateThread,
  } = useMessageStore();

  const { profile } = useUserProfile();

  // Simple avatar logic - use profile avatar for current user, placeholder for others
  const getUserAvatar = (senderName: string, senderId: string): string => {
    // If it's the current user, use their profile avatar
    if (senderId === currentUserId) {
      return profile.avatar;
    }

    // For Hamid Rahmani (tenant), use profile avatar since we have it
    if (senderName.includes("Hamid")) {
      return profile.avatar;
    }

    // For other users, use placeholder (can be extended later)
    return "/placeholder.svg";
  };

  const [newMessage, setNewMessage] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const thread = getThreadById(threadId);
  const messages = getMessagesByThread(threadId);

  useEffect(() => {
    if (thread) {
      markAllMessagesAsRead(threadId);
    }
  }, [threadId, markAllMessagesAsRead]);

  // Scroll til bunn når nye meldinger kommer
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
  }, [messages.length]);

  // const scrollToBottom = () => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  // };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && attachments.length === 0) return;

    try {
      // Convert attachments to base64
      const attachmentData = await Promise.all(
        attachments.map(async (file) => ({
          id: `attachment_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`,
          name: file.name,
          type: file.type,
          base64Data: await fileToBase64(file),
          size: file.size,
        }))
      );

      // Find recipient (not current user)
      const recipient = thread?.participants.find(
        (p) => p.id !== currentUserId
      );
      if (!recipient) return;

      sendMessage({
        threadId,
        senderId: currentUserId,
        senderName:
          currentUserType === "tenant" ? "Hamid Rahmani" : "Amin Ismail",
        senderAvatar: getUserAvatar(
          currentUserType === "tenant" ? "Hamid Rahmani" : "Amin Ismail",
          currentUserId
        ),
        senderType: currentUserType,
        recipientId: recipient.id,
        recipientType: recipient.type,
        content: newMessage.trim(),
        attachments: attachmentData,
      });

      setNewMessage("");
      setAttachments([]);
      setReplyTo(null);
    } catch (
       
      _error: unknown
    ) {
      // Error handling can be added here if needed
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]); // Remove data:type;base64, prefix
      };
      reader.onerror = (error: unknown) => reject(error);
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleReply = (message: Message) => {
    setReplyTo(message);
    textareaRef.current?.focus();
  };

  const handleForward = (
     
    _message: Message
  ) => {
    // TODO: Implement message forwarding functionality
  };

  const handleStar = (
     
    _messageId: string
  ) => {
    // TODO: Implement message starring functionality
  };

  const handleDelete = (
     
    _messageId: string
  ) => {
    // TODO: Implement message deletion functionality
  };

  if (!thread) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground dark:text-gray-400">{t('messaging:errors.thread_not_found', 'Tråd ikke funnet')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Header for tittel/status */}
      {showHeader && (
        <header className="bg-white border-b px-4 py-3 flex-shrink-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="md:hidden dark:text-gray-300 dark:hover:bg-gray-700"
              >
                ←
              </Button>
              <div>
                <h3 className="font-semibold dark:text-white">{thread.subject}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-gray-400">
                  <span>{thread.participants.length} {t('messaging:labels.participants', 'deltakere')}</span>
                  {thread.facilityName && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        {thread.facilityName}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant={thread.status === "active" ? "default" : "secondary"}
                className="dark:bg-gray-700 dark:text-gray-300"
              >
                {thread.status === "active"
                  ? t('messaging:status.active', 'Aktiv')
                  : thread.status === "resolved"
                  ? t('messaging:status.resolved', 'Løst')
                  : t('messaging:status.closed', 'Lukket')}
              </Badge>

              {/* Admin actions - only show for landlords */}
              {currentUserType === "landlord" && thread.status === "active" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateThread(threadId, { status: "resolved" })}
                  className="text-green-600 border-green-200 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/20"
                >
                  <Check className="h-4 w-4 mr-2" />
                  {t('messaging:actions.mark_resolved', 'Marker som løst')}
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="dark:text-gray-300 dark:hover:bg-gray-700">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="dark:bg-gray-800 dark:border-gray-700">
                  <DropdownMenuItem
                    onClick={() =>
                      updateThread(threadId, { status: "resolved" })
                    }
                    className="dark:text-gray-300 dark:focus:bg-gray-700"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    {t('messaging:actions.mark_resolved', 'Marker som løst')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => updateThread(threadId, { status: "closed" })}
                    className="dark:text-gray-300 dark:focus:bg-gray-700"
                  >
                    <EyeOff className="h-4 w-4 mr-2" />
                    {t('messaging:actions.close_thread', 'Lukk tråd')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
      )}

      {/* MessagesScroller - meldingslisten er den ENESTE scrolleflaten i høyre kolonne */}
      <div
        id="messages-scroller"
        className="flex-1 min-h-0 overflow-y-auto px-6 py-4 space-y-3 pb-20"
      >
        {messages.map((message) => {
          const isOwn = message.senderId === currentUserId;
          // const prevMessage = messages[index - 1];
          const showAvatar = true; // Always show avatars

          return (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={isOwn}
              showAvatar={showAvatar}
              onReply={handleReply}
              onForward={handleForward}
              onStar={handleStar}
              onDelete={handleDelete}
              getUserAvatar={getUserAvatar}
            />
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply indicator */}
      {replyTo && (
        <div className="absolute bottom-16 left-0 right-0 px-4 py-2 bg-muted border-t dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Reply className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
              <span className="text-sm text-muted-foreground dark:text-gray-400">
                {t('messaging:labels.replying_to', 'Svarer til')} {replyTo.senderName}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setReplyTo(null)} className="dark:text-gray-300 dark:hover:bg-gray-700">
              ×
            </Button>
          </div>
        </div>
      )}

      {/* Composer - helt fast på bunnen som footer */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t px-4 py-3 z-10 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t("placeholders.message")}
              className="min-h-[32px] max-h-24 resize-none text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              rows={1}
            />
          </div>

          <div className="flex items-center gap-1">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="h-8 w-8 p-0 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsTyping(!isTyping)}
              className="h-8 w-8 p-0 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <Smile className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() && attachments.length === 0}
              size="sm"
              className="h-8 w-8 p-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Attachments preview */}
        {attachments.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-2 py-1 bg-muted rounded text-xs dark:bg-gray-700 dark:text-gray-300"
              >
                <Paperclip className="h-3 w-3" />
                <span className="truncate max-w-20">{file.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 dark:text-gray-300 dark:hover:bg-gray-600"
                  onClick={() =>
                    setAttachments((prev) => prev.filter((_, i) => i !== index))
                  }
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
