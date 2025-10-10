"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { MessageCircle, Search, Filter, Plus, MoreHorizontal, Archive, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageThread, MessageThreadFilter } from "@/types/message";
import { useMessageStore } from "@/stores/messageStore";

/**
 * Props interface for MessageInbox component
 */
interface MessageInboxProps {
  readonly userId: string;
  readonly onThreadSelect: (threadId: string) => void;
  readonly onCreateThread: () => void;
}

/**
 * Thread card component for displaying individual message threads
 */
const ThreadCard: React.FC<{
  readonly thread: MessageThread;
  readonly unreadCount: number;
  readonly lastMessage: string;
  readonly onSelect: (threadId: string) => void;
  readonly onArchive: (threadId: string) => void;
  readonly onDelete: (threadId: string) => void;
}> = ({ thread, unreadCount, lastMessage, onSelect, onArchive, onDelete }) => {
  const [showActions, setShowActions] = useState<boolean>(false);

  const getStatusColor = (status: MessageThread['status']): string => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'resolved': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: MessageThread['priority']): string => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card 
      className={`cursor-pointer transition-colors hover:bg-muted/50 ${
        unreadCount > 0 ? 'border-l-4 border-l-primary' : ''
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
              <Badge variant="outline" className={`text-xs ${getStatusColor(thread.status)}`}>
                {thread.status === 'active' ? 'Aktiv' : 
                 thread.status === 'resolved' ? 'Løst' : 'Lukket'}
              </Badge>
              <Badge variant="outline" className={`text-xs ${getPriorityColor(thread.priority)}`}>
                {thread.priority === 'high' ? 'Høy' : 
                 thread.priority === 'medium' ? 'Medium' : 'Lav'}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground line-clamp-2">
              {lastMessage}
            </p>
            
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <span>{thread.participants.length} deltakere</span>
              <span>{format(new Date(thread.lastMessageAt), "dd.MM.yyyy HH:mm")}</span>
              {thread.relatedBookingId && (
                <span>Relatert til booking</span>
              )}
            </div>
          </div>
          
          {showActions && (
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onArchive(thread.id);
                }}
              >
                <Archive className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(thread.id);
                }}
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

/**
 * Message inbox component
 * 
 * Displays all message threads with filtering, searching, and management capabilities.
 */
export const MessageInbox: React.FC<MessageInboxProps> = ({
  userId,
  onThreadSelect,
  onCreateThread
}) => {
  const { getUserThreads, filterThreads, getMessagesByThread } = useMessageStore();
  const [threads, setThreads] = useState<readonly MessageThread[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    const userThreads = getUserThreads(userId);
    setThreads(userThreads);
  }, [userId, getUserThreads]);

  const filteredThreads = threads.filter((thread) => {
    const matchesSearch = !searchQuery || 
      thread.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.participants.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || thread.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || thread.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getUnreadCount = (threadId: string): number => {
    const messages = getMessagesByThread(threadId);
    return messages.filter(m => m.recipientId === userId && m.status !== 'read').length;
  };

  const getLastMessage = (threadId: string): string => {
    const messages = getMessagesByThread(threadId);
    const lastMessage = messages[messages.length - 1];
    return lastMessage ? lastMessage.content : "Ingen meldinger";
  };

  const handleArchive = (threadId: string): void => {
    // Implementation would archive the thread
    console.log("Archive thread:", threadId);
  };

  const handleDelete = (threadId: string): void => {
    // Implementation would delete the thread
    console.log("Delete thread:", threadId);
  };

  const activeThreads = filteredThreads.filter(t => t.status === 'active');
  const resolvedThreads = filteredThreads.filter(t => t.status === 'resolved');
  const closedThreads = filteredThreads.filter(t => t.status === 'closed');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Meldinger</h2>
          <p className="text-muted-foreground">
            Administrer dine meldingstråder
          </p>
        </div>
        <Button onClick={onCreateThread}>
          <Plus className="h-4 w-4 mr-2" />
          Ny melding
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Søk i meldinger..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle statuser</SelectItem>
              <SelectItem value="active">Aktiv</SelectItem>
              <SelectItem value="resolved">Løst</SelectItem>
              <SelectItem value="closed">Lukket</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Prioritet" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle prioriter</SelectItem>
              <SelectItem value="high">Høy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Lav</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Threads Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            Alle ({filteredThreads.length})
          </TabsTrigger>
          <TabsTrigger value="active">
            Aktive ({activeThreads.length})
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Løste ({resolvedThreads.length})
          </TabsTrigger>
          <TabsTrigger value="closed">
            Lukkede ({closedThreads.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3">
          {filteredThreads.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Ingen meldinger</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Du har ingen meldinger ennå
                </p>
                <Button onClick={onCreateThread}>
                  <Plus className="h-4 w-4 mr-2" />
                  Opprett første melding
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredThreads.map((thread) => (
              <ThreadCard
                key={thread.id}
                thread={thread}
                unreadCount={getUnreadCount(thread.id)}
                lastMessage={getLastMessage(thread.id)}
                onSelect={onThreadSelect}
                onArchive={handleArchive}
                onDelete={handleDelete}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-3">
          {activeThreads.map((thread) => (
            <ThreadCard
              key={thread.id}
              thread={thread}
              unreadCount={getUnreadCount(thread.id)}
              lastMessage={getLastMessage(thread.id)}
              onSelect={onThreadSelect}
              onArchive={handleArchive}
              onDelete={handleDelete}
            />
          ))}
        </TabsContent>

        <TabsContent value="resolved" className="space-y-3">
          {resolvedThreads.map((thread) => (
            <ThreadCard
              key={thread.id}
              thread={thread}
              unreadCount={getUnreadCount(thread.id)}
              lastMessage={getLastMessage(thread.id)}
              onSelect={onThreadSelect}
              onArchive={handleArchive}
              onDelete={handleDelete}
            />
          ))}
        </TabsContent>

        <TabsContent value="closed" className="space-y-3">
          {closedThreads.map((thread) => (
            <ThreadCard
              key={thread.id}
              thread={thread}
              unreadCount={getUnreadCount(thread.id)}
              lastMessage={getLastMessage(thread.id)}
              onSelect={onThreadSelect}
              onArchive={handleArchive}
              onDelete={handleDelete}
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

