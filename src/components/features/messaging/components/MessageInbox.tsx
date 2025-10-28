"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { MessageCircle, Plus, Trash2, Building, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/common/status/StatusBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageThread } from "./MessageThread";
import CreateThreadModal from "./CreateThreadModal";
import { useMessageStore } from "@/stores/messageStore";
import { MessageThread as MessageThreadType } from "@/types/message";

const ThreadCard: React.FC<{
  readonly thread: MessageThreadType;
  readonly unreadCount: number;
  readonly lastMessage: string;
  readonly onSelect: (threadId: string) => void;
  readonly onDelete: (threadId: string) => void;
  readonly onMarkResolved?: (threadId: string) => void;
  readonly currentUserType?: "tenant" | "landlord";
}> = ({
  thread,
  unreadCount,
  lastMessage,
  onSelect,
  onDelete,
  onMarkResolved,
  currentUserType,
}) => {
  const [showActions, setShowActions] = useState<boolean>(false);

  const getPriorityColor = (
    priority: MessageThreadType["priority"]
  ): string => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card
      className={`cursor-pointer transition-colors hover:bg-muted/50 ${
        unreadCount > 0 ? "border-l-4 border-l-primary" : ""
      }`}
      onClick={() => onSelect(thread.id)}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-sm">{thread.subject}</h3>
              {unreadCount > 0 && (
                <Badge variant="default" className="text-xs">
                  {unreadCount}
                </Badge>
              )}
              <StatusBadge
                status={thread.status}
                translationKey={`common:status.${thread.status}`}
                showIcon={false}
                size="sm"
              />
              <Badge
                variant="outline"
                className={`text-xs ${getPriorityColor(thread.priority)}`}
              >
                {thread.priority === "high"
                  ? "Høy"
                  : thread.priority === "medium"
                  ? "Medium"
                  : "Lav"}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2">
              {lastMessage}
            </p>

            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <span>{thread.participants.length} deltakere</span>
              <span>
                {format(new Date(thread.lastMessageAt), "dd.MM.yyyy HH:mm")}
              </span>
              {thread.facilityName && (
                <span className="flex items-center gap-1">
                  <Building className="h-3 w-3" />
                  {thread.facilityName}
                </span>
              )}
              {thread.relatedBookingId && <span>Relatert til booking</span>}
            </div>
          </div>

          {showActions && (
            <div className="flex space-x-1">
              {/* Admin actions - only show for landlords */}
              {currentUserType === "landlord" &&
                thread.status === "active" &&
                onMarkResolved && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkResolved(thread.id);
                    }}
                    className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                    title="Marker som løst"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(thread.id);
                }}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                title="Slett tråd"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

interface MessageInboxProps {
  readonly userId: string;
  readonly onThreadSelect?: (threadId: string) => void;
  readonly onCreateThread?: () => void;
  readonly showThreadView?: boolean;
  readonly currentUserType?: "tenant" | "landlord";
}

export const MessageInbox: React.FC<MessageInboxProps> = ({
  userId,
  onThreadSelect,
  onCreateThread,
  showThreadView = true,
  currentUserType = "tenant",
}) => {
  const { t } = useTranslation("common");
  const {
    getUserThreads,
    getMessagesByThread,
    getAvailableParticipants,
    updateThread,
    deleteThread,
  } = useMessageStore();
  const [threads, setThreads] = useState<readonly MessageThreadType[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  // const [notificationsEnabled, setNotificationsEnabled] =
  //   useState<boolean>(true);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // Get available participants to check if messaging is possible
  const availableParticipants = getAvailableParticipants(
    userId,
    currentUserType
  );

  useEffect(() => {
    const userThreads = getUserThreads(userId);
    setThreads(userThreads);

    // Auto-select first thread if none selected and we have threads
    if (showThreadView && userThreads.length > 0 && !selectedThreadId) {
      setSelectedThreadId(userThreads[0].id);
    }
  }, [userId, getUserThreads, showThreadView, selectedThreadId]);

  const filteredThreads = threads
    .filter((thread) => {
      const matchesSearch =
        !searchQuery ||
        thread.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        thread.participants.some((p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesStatus =
        statusFilter === "all" || thread.status === statusFilter;
      const matchesPriority =
        priorityFilter === "all" || thread.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort(
      (a, b) =>
        new Date(b.lastMessageAt).getTime() -
        new Date(a.lastMessageAt).getTime()
    ); // Sort threads by last message at

  const getUnreadCount = (threadId: string): number => {
    const messages = getMessagesByThread(threadId);
    return messages.filter(
      (m) => m.recipientId === userId && m.status !== "read"
    ).length;
  };

  const getLastMessage = (threadId: string): string => {
    const messages = getMessagesByThread(threadId);
    const lastMessage = messages[messages.length - 1];
    return lastMessage ? lastMessage.content : "Ingen meldinger";
  };

  // const handleArchive = (threadId: string): void => {
  //   // Implementation would archive the thread
  // };

  // const handleDelete = (threadId: string): void => {
  //   // Implementation would delete the thread
  // };

  // const clearFilters = (): void => {
  //   setSearchQuery("");
  //   setStatusFilter("all");
  //   setPriorityFilter("all");
  // };

  const handleThreadSelect = useCallback(
    (threadId: string) => {
      setSelectedThreadId(threadId);
      onThreadSelect?.(threadId);
    },
    [onThreadSelect]
  );

  // const handleMarkResolved = useCallback((threadId: string) => {
  //   updateThread(threadId, { status: "resolved" });
  // }, [updateThread]);

  // const handleDeleteThread = useCallback((threadId: string) => {
  //   deleteThread(threadId);
  // }, [deleteThread]);

  const handleCreateThread = () => {
    setShowCreateModal(true);
    onCreateThread?.();
  };

  // Always show split view
  return (
    <div className="h-full w-full flex overflow-hidden p-6">
      {/* ThreadsPane - venstre trådeliste som scroller */}
      <section className="w-[420px] border-r flex flex-col min-h-0">
        {/* Sticky header for filter/søk */}
        <header className="sticky top-0 z-10 bg-white border-b p-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Meldingstråder</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCreateThread}
              disabled={availableParticipants.length === 0}
            >
              <Plus className="h-4 w-4 mr-2" />
              Ny melding
            </Button>
          </div>
        </header>

        {/* Search and filters */}
        <div className="p-3 border-b bg-background flex-shrink-0">
          <div className="space-y-2">
            <Input
              placeholder={t("common:placeholders.messageSearch")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8"
            />
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder={t("common:filters.status")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle</SelectItem>
                  <SelectItem value="active">Aktive</SelectItem>
                  <SelectItem value="resolved">Løst</SelectItem>
                  <SelectItem value="closed">Lukket</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder={t("common:filters.priority")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle</SelectItem>
                  <SelectItem value="high">Høy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Lav</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Dette er eneste scroll i venstre kolonne */}
        <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-2">
          {filteredThreads.map((thread) => (
            <ThreadCard
              key={thread.id}
              thread={thread}
              unreadCount={getUnreadCount(thread.id)}
              lastMessage={getLastMessage(thread.id)}
              onSelect={() => handleThreadSelect(thread.id)}
              onDelete={(threadId) => {
                deleteThread(threadId);
                // If we're deleting the currently selected thread, clear selection
                if (selectedThreadId === threadId) {
                  setSelectedThreadId(null);
                }
              }}
              onMarkResolved={(threadId) =>
                updateThread(threadId, { status: "resolved" })
              }
              currentUserType={currentUserType}
            />
          ))}
          {filteredThreads.length === 0 && (
            <div className="p-4 text-center text-muted-foreground text-sm">
              Ingen meldingstråder funnet
            </div>
          )}
        </div>
      </section>

      {/* ConversationPane - høyre samtale */}
      <section className="flex-1 flex flex-col min-h-0 min-w-0">
        {selectedThreadId ? (
          <MessageThread
            threadId={selectedThreadId}
            currentUserId={userId}
            onClose={() => setSelectedThreadId(null)}
            currentUserType={currentUserType}
            showHeader={true}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Velg en meldingstråd for å starte samtalen</p>
            </div>
          </div>
        )}
      </section>

      <CreateThreadModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        currentUserId={userId}
        currentUserName={
          currentUserType === "tenant" ? "Hamid Rahmani" : "Amin Ismail"
        }
        currentUserType={currentUserType}
      />
    </div>
  );
};
