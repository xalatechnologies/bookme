"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Clock, 
  Calendar, 
  MapPin, 
  User, 
  MessageSquare,
  Eye,
  X,
  CheckCircle,
  AlertTriangle,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  CalendarPlus,
  Info,
  ChevronDown,
  ChevronUp,
  Plus
} from "lucide-react";

interface IUserRequest {
  readonly id: string;
  readonly facility: string;
  readonly date: string;
  readonly time: string;
  readonly duration: string;
  readonly status: "pending" | "approved" | "rejected";
  readonly submittedAt: string;
  readonly purpose: string;
  readonly location: string;
  readonly price: string;
  readonly rejectionReason?: string;
  readonly contactPerson?: string;
  readonly facilityImage?: string;
}

const UserRequests = (): JSX.Element => {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
  const [showRequestDetails, setShowRequestDetails] = useState<string | null>(null);

  // Enhanced mock data
  const requests: readonly IUserRequest[] = [
    {
      id: "1",
      facility: "Drammen Idrettshall",
      date: "2024-01-25",
      time: "16:00",
      duration: "3 timer",
      status: "pending",
      submittedAt: "2024-01-20T10:30:00Z",
      purpose: "Fotballtrening for seniorlaget",
      location: "Drammen",
      price: "1500 kr",
      contactPerson: "Anna Hansen",
      facilityImage: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&h=300&fit=crop"
    },
    {
      id: "2",
      facility: "Kulturhuset",
      date: "2024-01-28",
      time: "19:00",
      duration: "4 timer",
      status: "approved",
      submittedAt: "2024-01-18T14:15:00Z",
      purpose: "Konsert med lokalt band",
      location: "Drammen sentrum",
      price: "3200 kr",
      contactPerson: "Erik Larsen",
      facilityImage: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=400&h=300&fit=crop"
    },
    {
      id: "3",
      facility: "Møterom 1",
      date: "2024-01-22",
      time: "09:00",
      duration: "2 timer",
      status: "rejected",
      submittedAt: "2024-01-19T16:45:00Z",
      purpose: "Team meeting",
      location: "Drammen sentrum",
      price: "400 kr",
      rejectionReason: "Lokalet er allerede booket på det ønskede tidspunktet. Vennligst velg et annet tidspunkt.",
      contactPerson: "Maria Olsen",
      facilityImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop"
    }
  ];

  const statusFilters = [
    { value: "all", label: "Alle", icon: Calendar, count: requests.length },
    { value: "pending", label: "Ventende", icon: Clock, count: requests.filter(r => r.status === "pending").length },
    { value: "approved", label: "Godkjent", icon: CheckCircle, count: requests.filter(r => r.status === "approved").length },
    { value: "rejected", label: "Avvist", icon: X, count: requests.filter(r => r.status === "rejected").length }
  ];

  const filteredRequests = requests.filter(request => {
    const matchesStatus = filterStatus === "all" || request.status === filterStatus;
    const matchesSearch = searchQuery === "" || 
      request.facility.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: IUserRequest["status"]): JSX.Element => {
    const statusConfig = {
      pending: { 
        label: "Ventende", 
        className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
        icon: Clock,
        tooltip: "Venter på behandling av saksbehandler"
      },
      approved: { 
        label: "Godkjent", 
        className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
        icon: CheckCircle,
        tooltip: "Forespørsel er godkjent og flyttet til Mine bookinger"
      },
      rejected: { 
        label: "Avvist", 
        className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
        icon: X,
        tooltip: "Forespørsel er avvist - se årsak for detaljer"
      }
    };
    
    const config = statusConfig[status];
    const Icon = config.icon;
    
    return (
      <Badge className={config.className} title={config.tooltip}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('nb-NO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatSubmittedDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours} timer siden`;
    } else if (diffInHours < 168) { // Less than a week
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} dager siden`;
    } else if (diffInHours < 720) { // Less than a month
      const diffInWeeks = Math.floor(diffInHours / 168);
      return `${diffInWeeks} uker siden`;
    } else {
      return date.toLocaleDateString('nb-NO', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
  };

  const handleViewDetails = (requestId: string): void => {
    setShowRequestDetails(showRequestDetails === requestId ? null : requestId);
  };

  const handleContactAdmin = (requestId: string): void => {
    // TODO: Implement contact admin
    console.log("Contact admin for request:", requestId);
  };

  const handleEditRequest = (requestId: string): void => {
    // TODO: Implement edit request
    console.log("Edit request:", requestId);
  };

  const handleCancelRequest = (requestId: string): void => {
    // TODO: Implement cancel request with confirmation
    console.log("Cancel request:", requestId);
  };

  const handleGoToBooking = (requestId: string): void => {
    // TODO: Navigate to booking details
    console.log("Go to booking for request:", requestId);
  };

  const handleAddToCalendar = (requestId: string): void => {
    // TODO: Implement add to calendar
    console.log("Add to calendar:", requestId);
  };

  const handleNewRequest = (): void => {
    navigate("/user/facilities");
  };

  const renderRequestDetails = (request: IUserRequest): JSX.Element => (
    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Forespørselsdetaljer</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Formål:</span>
              <span className="text-gray-900 dark:text-white">{request.purpose}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Kontaktperson:</span>
              <span className="text-gray-900 dark:text-white">{request.contactPerson}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Sendt:</span>
              <span className="text-gray-900 dark:text-white">{formatSubmittedDate(request.submittedAt)}</span>
            </div>
            {request.rejectionReason && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <h5 className="font-medium text-red-800 dark:text-red-300 mb-1">Avvisningsårsak:</h5>
                <p className="text-sm text-red-700 dark:text-red-400">{request.rejectionReason}</p>
              </div>
            )}
          </div>
        </div>
        
        {request.facilityImage && (
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Lokale</h4>
            <img 
              src={request.facilityImage} 
              alt={request.facility}
              className="w-full h-24 object-cover rounded-lg"
            />
          </div>
        )}
      </div>
    </div>
  );

  const getStatusBackgroundColor = (status: IUserRequest["status"]): string => {
    switch (status) {
      case "pending":
        return "bg-yellow-50 dark:bg-yellow-900/10 border-l-4 border-l-yellow-500";
      case "approved":
        return "bg-green-50 dark:bg-green-900/10 border-l-4 border-l-green-500";
      case "rejected":
        return "bg-red-50 dark:bg-red-900/10 border-l-4 border-l-red-500";
      default:
        return "bg-gray-50 dark:bg-gray-800";
    }
  };

  const getStatusIconColor = (status: IUserRequest["status"]): string => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400";
      case "approved":
        return "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400";
      case "rejected":
        return "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Booking-forespørsler
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Her ser du status på booking-forespørslene dine. Når en forespørsel blir godkjent, flyttes den automatisk til "Mine bookinger".
          </p>
        </div>
        <Button onClick={handleNewRequest} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Ny forespørsel
        </Button>
      </div>

      {/* Status Overview */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Dine forespørsler: <span className="font-semibold">{requests.length} totalt</span>
              </span>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {requests.filter(r => r.status === "pending").length} ventende
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {requests.filter(r => r.status === "approved").length} godkjent
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {requests.filter(r => r.status === "rejected").length} avvist
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Field */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Søk i forespørsler..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Filtrer:
              </span>
              <div className="flex space-x-2">
                {statusFilters.map((filter) => {
                  const Icon = filter.icon;
                  return (
                    <Button
                      key={filter.value}
                      size="sm"
                      variant={filterStatus === filter.value ? "default" : "outline"}
                      onClick={() => setFilterStatus(filter.value)}
                      className="flex items-center gap-2 transition-all duration-200 hover:scale-105"
                    >
                      <Icon className="h-4 w-4" />
                      {filter.label}
                      <Badge variant="secondary" className="ml-1">
                        {filter.count}
                      </Badge>
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <div className="space-y-6">
        {filteredRequests.length > 0 ? (
          filteredRequests.map((request) => (
            <Card 
              key={request.id} 
              className={`hover:shadow-lg transition-all duration-200 cursor-pointer ${getStatusBackgroundColor(request.status)}`}
              onClick={() => setExpandedRequest(expandedRequest === request.id ? null : request.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Status Icon */}
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getStatusIconColor(request.status)}`}>
                      {request.status === "pending" && <Clock className="h-6 w-6" />}
                      {request.status === "approved" && <CheckCircle className="h-6 w-6" />}
                      {request.status === "rejected" && <X className="h-6 w-6" />}
                    </div>
                    
                    <div className="flex-1">
                      {/* Header: Title + Status */}
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {request.facility}
                        </h3>
                        {getStatusBadge(request.status)}
                      </div>
                      
                      {/* Body: Description, Date, Time, Location */}
                      <p className="text-gray-600 dark:text-gray-400 mb-3 text-sm">
                        {request.purpose}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {formatDate(request.date)}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {request.time} • {request.duration}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {request.location}
                          </span>
                        </div>
                      </div>
                      
                      {/* Footer: Price + Submitted Date */}
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                          {request.price}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-500">
                          Sendt {formatSubmittedDate(request.submittedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDetails(request.id)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    {request.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditRequest(request.id)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancelRequest(request.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleContactAdmin(request.id)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    
                    {request.status === "approved" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleGoToBooking(request.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddToCalendar(request.id)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <CalendarPlus className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    
                    {request.status === "rejected" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleNewRequest()}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Send ny forespørsel
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setExpandedRequest(expandedRequest === request.id ? null : request.id)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      {expandedRequest === request.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                {/* Expanded Details */}
                {expandedRequest === request.id && renderRequestDetails(request)}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Ingen forespørsler funnet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {filterStatus === "all" 
                  ? "Du har ingen aktive forespørsler."
                  : `Du har ingen ${statusFilters.find(f => f.value === filterStatus)?.label.toLowerCase()} forespørsler.`
                }
              </p>
              {filterStatus === "all" && (
                <Button onClick={handleNewRequest}>
                  <Plus className="h-4 w-4 mr-2" />
                  Finn et lokale
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UserRequests;