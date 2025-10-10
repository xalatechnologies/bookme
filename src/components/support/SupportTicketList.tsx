"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Search, Filter, Plus, MoreHorizontal, Eye, Edit, Trash2, Archive, CheckCircle, Clock, AlertTriangle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SupportTicket, SupportTicketFilter, SupportTicketSearchCriteria } from "@/types/support";
import { useSupportStore } from "@/stores/supportStore";

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
const TicketCard: React.FC<{
  readonly ticket: SupportTicket;
  readonly onSelect: (ticketId: string) => void;
  readonly onEdit: (ticketId: string) => void;
  readonly onDelete: (ticketId: string) => void;
  readonly onArchive: (ticketId: string) => void;
}> = ({ ticket, onSelect, onEdit, onDelete, onArchive }) => {
  const [showActions, setShowActions] = useState<boolean>(false);

  const getStatusIcon = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'in-progress': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'waiting-user': return <Clock className="h-4 w-4 text-orange-600" />;
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'closed': return <XCircle className="h-4 w-4 text-gray-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: SupportTicket['status']): string => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'waiting-user': return 'bg-orange-100 text-orange-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: SupportTicket['priority']): string => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: SupportTicket['status']): string => {
    switch (status) {
      case 'open': return 'Åpen';
      case 'in-progress': return 'Pågår';
      case 'waiting-user': return 'Venter bruker';
      case 'resolved': return 'Løst';
      case 'closed': return 'Lukket';
      default: return 'Ukjent';
    }
  };

  const getPriorityLabel = (priority: SupportTicket['priority']): string => {
    switch (priority) {
      case 'urgent': return 'Urgent';
      case 'high': return 'Høy';
      case 'medium': return 'Medium';
      case 'low': return 'Lav';
      default: return 'Ukjent';
    }
  };

  return (
    <Card 
      className={`cursor-pointer transition-colors hover:bg-muted/50 ${
        ticket.status === 'open' ? 'border-l-4 border-l-blue-500' : ''
      }`}
      onClick={() => onSelect(ticket.id)}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center space-x-2">
              {getStatusIcon(ticket.status)}
              <h3 className="font-semibold text-sm">{ticket.subject}</h3>
              <Badge variant="outline" className={`text-xs ${getStatusColor(ticket.status)}`}>
                {getStatusLabel(ticket.status)}
              </Badge>
              <Badge variant="outline" className={`text-xs ${getPriorityColor(ticket.priority)}`}>
                {getPriorityLabel(ticket.priority)}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground line-clamp-2">
              {ticket.description}
            </p>
            
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <span>#{ticket.id.split('_')[1]}</span>
              <span>{ticket.category}</span>
              <span>{format(new Date(ticket.createdAt), "dd.MM.yyyy HH:mm")}</span>
              {ticket.assignedTo && (
                <span>Tildelt: {ticket.assignedToName}</span>
              )}
              {ticket.attachments && ticket.attachments.length > 0 && (
                <span>{ticket.attachments.length} vedlegg</span>
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
                    Arkiver
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(ticket.id)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Slett
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
  onCreateTicket
}) => {
  const { 
    getUserTickets, 
    getAdminTickets, 
    searchTickets, 
    getTicketStatistics 
  } = useSupportStore();
  
  const [tickets, setTickets] = useState<readonly SupportTicket[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    const userTickets = userId ? getUserTickets(userId) : getAdminTickets();
    setTickets(userTickets);
  }, [userId, getUserTickets, getAdminTickets]);

  const searchCriteria: SupportTicketSearchCriteria = {
    query: searchQuery || undefined,
    filter: {
      status: statusFilter !== "all" ? statusFilter as SupportTicket['status'] : undefined,
      priority: priorityFilter !== "all" ? priorityFilter as SupportTicket['priority'] : undefined,
      category: categoryFilter !== "all" ? categoryFilter as SupportTicket['category'] : undefined,
      userId: userId
    },
    sortBy: 'createdAt',
    sortOrder: 'desc'
  };

  const filteredTickets = searchTickets(searchCriteria);
  const statistics = getTicketStatistics(userId);

  const openTickets = filteredTickets.filter(t => t.status === 'open');
  const inProgressTickets = filteredTickets.filter(t => t.status === 'in-progress');
  const resolvedTickets = filteredTickets.filter(t => t.status === 'resolved');
  const closedTickets = filteredTickets.filter(t => t.status === 'closed');

  const handleEdit = (ticketId: string): void => {
    // Implementation would open edit dialog
    console.log("Edit ticket:", ticketId);
  };

  const handleDelete = (ticketId: string): void => {
    // Implementation would delete ticket
    console.log("Delete ticket:", ticketId);
  };

  const handleArchive = (ticketId: string): void => {
    // Implementation would archive ticket
    console.log("Archive ticket:", ticketId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Support-tickets</h2>
          <p className="text-muted-foreground">
            {isAdmin ? 'Administrer alle support-tickets' : 'Dine support-tickets'}
          </p>
        </div>
        <Button onClick={onCreateTicket}>
          <Plus className="h-4 w-4 mr-2" />
          Ny ticket
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{statistics.openTickets}</div>
            <p className="text-xs text-muted-foreground">Åpne tickets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{statistics.inProgressTickets}</div>
            <p className="text-xs text-muted-foreground">Pågår</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{statistics.resolvedTickets}</div>
            <p className="text-xs text-muted-foreground">Løst</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">{statistics.closedTickets}</div>
            <p className="text-xs text-muted-foreground">Lukket</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Søk i tickets..."
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
              <SelectItem value="open">Åpen</SelectItem>
              <SelectItem value="in-progress">Pågår</SelectItem>
              <SelectItem value="waiting-user">Venter bruker</SelectItem>
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
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">Høy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Lav</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle kategorier</SelectItem>
              <SelectItem value="booking">Booking</SelectItem>
              <SelectItem value="technical">Teknisk</SelectItem>
              <SelectItem value="billing">Fakturering</SelectItem>
              <SelectItem value="feedback">Tilbakemelding</SelectItem>
              <SelectItem value="other">Annet</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tickets Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            Alle ({filteredTickets.length})
          </TabsTrigger>
          <TabsTrigger value="open">
            Åpne ({openTickets.length})
          </TabsTrigger>
          <TabsTrigger value="in-progress">
            Pågår ({inProgressTickets.length})
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Løst ({resolvedTickets.length})
          </TabsTrigger>
          <TabsTrigger value="closed">
            Lukket ({closedTickets.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3">
          {filteredTickets.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Ingen tickets funnet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {searchQuery ? 'Ingen tickets matcher søket ditt' : 'Du har ingen tickets ennå'}
                </p>
                <Button onClick={onCreateTicket}>
                  <Plus className="h-4 w-4 mr-2" />
                  Opprett første ticket
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
