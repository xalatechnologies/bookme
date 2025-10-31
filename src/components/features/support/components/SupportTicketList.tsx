"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Archive,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/common/status/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SupportTicket, SupportTicketSearchCriteria } from "@/types/support";
import { useSupportStore } from "@/stores/supportStore";
import { useTranslation } from "@/i18n";

/**
 * Props interface for SupportTicketList component
 */
interface SupportTicketListProps {
  readonly userId?: string;
  readonly isAdmin?: boolean;
  readonly onTicketSelect: (ticketId: string) => void;
  readonly onCreateTicket: () => void;
}

/**
 * Ticket card component for displaying individual support tickets
 */
interface TicketCardProps {
  readonly ticket: SupportTicket;
  readonly onSelect: (ticketId: string) => void;
  readonly onEdit: (ticketId: string) => void;
  readonly onDelete: (ticketId: string) => void;
  readonly onArchive: (ticketId: string) => void;
}

const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  onSelect,
  onEdit,
  onDelete,
  onArchive,
}) => {
  const { t } = useTranslation();
  const [showActions, setShowActions] = useState<boolean>(false);

  const getPriorityColor = (priority: SupportTicket["priority"]): string => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
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
        ticket.status === "open" ? "border-l-4 border-l-blue-500" : ""
      }`}
      onClick={() => onSelect(ticket.id)}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center space-x-2">
              <StatusBadge
                status={ticket.status}
                translationKey={`support:tickets.status.${ticket.status.replace(
                  "-",
                  "_"
                )}`}
                showIcon={true}
                size="sm"
              />
              <h3 className="font-semibold text-sm">{ticket.subject}</h3>
              <Badge
                variant="outline"
                className={`text-xs ${getPriorityColor(ticket.priority)}`}
              >
                {t(`support:tickets.priority.${ticket.priority}`)}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2">
              {ticket.description}
            </p>

            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <span>
                {t("support:tickets.ticket_id", {
                  id: ticket.id.split("_")[1],
                })}
              </span>
              <span>{t(`support:tickets.category.${ticket.category}`)}</span>
              <span>
                {format(new Date(ticket.createdAt), "dd.MM.yyyy HH:mm")}
              </span>
              {ticket.assignedTo && (
                <span>
                  {t("support:tickets.details.assigned", {
                    name: ticket.assignedToName,
                  })}
                </span>
              )}
              {ticket.attachments && ticket.attachments.length > 0 && (
                <span>
                  {t("support:tickets.details.attachments", {
                    count: ticket.attachments.length,
                  })}
                </span>
              )}
            </div>

            {ticket.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {ticket.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {showActions && (
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(ticket.id);
                }}
                title={t("support:tickets.actions.view")}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(ticket.id);
                }}
                title={t("support:tickets.actions.edit")}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onArchive(ticket.id)}>
                    <Archive className="h-4 w-4 mr-2" />
                    {t("support:tickets.actions.archive")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(ticket.id)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t("support:tickets.actions.delete")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Support ticket list component
 *
 * Displays all support tickets with filtering, searching, and management capabilities.
 */
export const SupportTicketList: React.FC<SupportTicketListProps> = ({
  userId,
  isAdmin = false,
  onTicketSelect,
  onCreateTicket,
}) => {
  const { t } = useTranslation();
  const {
    getUserTickets,
    getAdminTickets,
    searchTickets,
    getTicketStatistics,
  } = useSupportStore();

  // const [tickets, setTickets] = useState<readonly SupportTicket[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    // Trigger data fetch from store when userId changes
    if (userId) {
      getUserTickets(userId);
    } else {
      getAdminTickets();
    }
  }, [userId, getUserTickets, getAdminTickets]);

  const searchCriteria: SupportTicketSearchCriteria = {
    query: searchQuery || undefined,
    filter: {
      status:
        statusFilter !== "all"
          ? (statusFilter as SupportTicket["status"])
          : undefined,
      priority:
        priorityFilter !== "all"
          ? (priorityFilter as SupportTicket["priority"])
          : undefined,
      category:
        categoryFilter !== "all"
          ? (categoryFilter as SupportTicket["category"])
          : undefined,
      userId: userId,
    },
    sortBy: "createdAt",
    sortOrder: "desc",
  };

  const filteredTickets = searchTickets(searchCriteria);
  const statistics = getTicketStatistics(userId);

  const openTickets = filteredTickets.filter((t) => t.status === "open");
  const inProgressTickets = filteredTickets.filter(
    (t) => t.status === "in-progress"
  );
  const resolvedTickets = filteredTickets.filter(
    (t) => t.status === "resolved"
  );
  const closedTickets = filteredTickets.filter((t) => t.status === "closed");

  const handleEdit = (ticketId: string): void => {
    // TODO: Implementation would open edit dialog
  };

  const handleDelete = (ticketId: string): void => {
    // TODO: Implementation would delete ticket
  };

  const handleArchive = (ticketId: string): void => {
    // TODO: Implementation would archive ticket
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {t("support:tickets.list_title")}
          </h2>
          <p className="text-muted-foreground">
            {isAdmin
              ? t("support:tickets.manage_all")
              : t("support:tickets.your_tickets")}
          </p>
        </div>
        <Button onClick={onCreateTicket}>
          <Plus className="h-4 w-4 mr-2" />
          {t("support:tickets.new_ticket")}
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {statistics.openTickets}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("support:tickets.statistics.open_tickets")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {statistics.inProgressTickets}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("support:tickets.statistics.in_progress")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {statistics.resolvedTickets}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("support:tickets.statistics.resolved")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">
              {statistics.closedTickets}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("support:tickets.statistics.closed")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("support:tickets.search_placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder={t("support:tickets.filters.status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("support:tickets.filters.all_statuses")}
              </SelectItem>
              <SelectItem value="open">
                {t("support:tickets.status.open")}
              </SelectItem>
              <SelectItem value="in-progress">
                {t("support:tickets.status.in_progress")}
              </SelectItem>
              <SelectItem value="waiting-user">
                {t("support:tickets.status.waiting_user")}
              </SelectItem>
              <SelectItem value="resolved">
                {t("support:tickets.status.resolved")}
              </SelectItem>
              <SelectItem value="closed">
                {t("support:tickets.status.closed")}
              </SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-32">
              <SelectValue
                placeholder={t("support:tickets.filters.priority")}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("support:tickets.filters.all_priorities")}
              </SelectItem>
              <SelectItem value="urgent">
                {t("support:tickets.priority.urgent")}
              </SelectItem>
              <SelectItem value="high">
                {t("support:tickets.priority.high")}
              </SelectItem>
              <SelectItem value="medium">
                {t("support:tickets.priority.medium")}
              </SelectItem>
              <SelectItem value="low">
                {t("support:tickets.priority.low")}
              </SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-32">
              <SelectValue
                placeholder={t("support:tickets.filters.category")}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("support:tickets.filters.all_categories")}
              </SelectItem>
              <SelectItem value="booking">
                {t("support:tickets.category.booking")}
              </SelectItem>
              <SelectItem value="technical">
                {t("support:tickets.category.technical")}
              </SelectItem>
              <SelectItem value="billing">
                {t("support:tickets.category.billing")}
              </SelectItem>
              <SelectItem value="feedback">
                {t("support:tickets.category.feedback")}
              </SelectItem>
              <SelectItem value="other">
                {t("support:tickets.category.other")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tickets Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            {t("support:tickets.tabs.all", { count: filteredTickets.length })}
          </TabsTrigger>
          <TabsTrigger value="open">
            {t("support:tickets.tabs.open", { count: openTickets.length })}
          </TabsTrigger>
          <TabsTrigger value="in-progress">
            {t("support:tickets.tabs.in_progress", {
              count: inProgressTickets.length,
            })}
          </TabsTrigger>
          <TabsTrigger value="resolved">
            {t("support:tickets.tabs.resolved", {
              count: resolvedTickets.length,
            })}
          </TabsTrigger>
          <TabsTrigger value="closed">
            {t("support:tickets.tabs.closed", { count: closedTickets.length })}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3">
          {filteredTickets.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {t("support:tickets.no_tickets")}
                </h3>
                <p className="text-muted-foreground text-center mb-4">
                  {searchQuery
                    ? t("support:tickets.no_tickets_search")
                    : t("support:tickets.no_tickets_yet")}
                </p>
                <Button onClick={onCreateTicket}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t("support:tickets.create_ticket")}
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredTickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onSelect={onTicketSelect}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onArchive={handleArchive}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="open" className="space-y-3">
          {openTickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onSelect={onTicketSelect}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onArchive={handleArchive}
            />
          ))}
        </TabsContent>

        <TabsContent value="in-progress" className="space-y-3">
          {inProgressTickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onSelect={onTicketSelect}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onArchive={handleArchive}
            />
          ))}
        </TabsContent>

        <TabsContent value="resolved" className="space-y-3">
          {resolvedTickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onSelect={onTicketSelect}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onArchive={handleArchive}
            />
          ))}
        </TabsContent>

        <TabsContent value="closed" className="space-y-3">
          {closedTickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onSelect={onTicketSelect}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onArchive={handleArchive}
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};
