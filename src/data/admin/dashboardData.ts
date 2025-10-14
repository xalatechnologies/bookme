"use client";

import { 
  Building2, 
  Calendar, 
  CheckCircle, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Home,
  User,
  Clock,
  AlertTriangle
} from "lucide-react";
import { 
  IKPICard, 
  IApprovalRequest, 
  IRecentEvent, 
  ITodaysBooking, 
  ISystemAlert 
} from "@/types/admin";

export const kpiCards: readonly IKPICard[] = [
  {
    id: "total-facilities",
    title: "Totalt antall lokaler",
    value: 124,
    description: "Aktive lokaler i systemet",
    trend: {
      direction: "up",
      percentage: 12,
      period: "siden i går"
    },
    icon: Home, // 🏠 icon
    color: "blue",
    href: "/admin/facilities"
  },
  {
    id: "today-bookings",
    title: "Nye bookinger i dag",
    value: 18,
    description: "Bookinger mottatt i dag",
    trend: {
      direction: "up",
      percentage: 8,
      period: "siden i går"
    },
    icon: Calendar, // 📅 icon
    color: "green",
    href: "/admin/bookings"
  },
  {
    id: "pending-approvals",
    title: "Ventende godkjenninger",
    value: 5,
    description: "Krever umiddelbar oppmerksomhet",
    trend: {
      direction: "down",
      percentage: 25,
      period: "siden i går"
    },
    icon: AlertTriangle, // ⚠️ icon
    color: "yellow",
    href: "/admin/bookings?filter=pending"
  },
  {
    id: "active-users",
    title: "Aktive brukere",
    value: 78,
    description: "Logget inn siste 24 timer",
    trend: {
      direction: "up",
      percentage: 15,
      period: "siden i går"
    },
    icon: User, // 👤 icon
    color: "purple",
    href: "/admin/users-roles"
  }
];

export const approvalRequests: readonly IApprovalRequest[] = [
  {
    id: "1",
    title: "Ny booking - Møterom A",
    facility: "Møterom A",
    requester: "Anna Hansen",
    date: "2 min siden",
    priority: "high"
  },
  {
    id: "2",
    title: "Endring av åpningstider",
    facility: "Tennisbane",
    requester: "Erik Larsen",
    date: "15 min siden",
    priority: "medium"
  },
  {
    id: "3",
    title: "Ny brukerregistrering",
    facility: "System",
    requester: "Maria Olsen",
    date: "1 time siden",
    priority: "low"
  }
];

export const recentEvents: readonly IRecentEvent[] = [
  {
    id: "1",
    type: "booking",
    message: "Ny booking opprettet for Møterom B",
    timestamp: "5 min siden",
    user: "Anna Hansen"
  },
  {
    id: "2",
    type: "approval",
    message: "Godkjenning godkjent for Tennisbane",
    timestamp: "12 min siden",
    user: "Erik Larsen"
  },
  {
    id: "3",
    type: "user",
    message: "Ny bruker registrert: Maria Olsen",
    timestamp: "1 time siden",
    user: "System"
  },
  {
    id: "4",
    type: "system",
    message: "Sikkerhetskopi fullført",
    timestamp: "2 timer siden",
    user: "System"
  },
  {
    id: "5",
    type: "booking",
    message: "Booking avbrutt for Møterom C",
    timestamp: "3 timer siden",
    user: "Lars Andersen"
  }
];

export const todaysBookings: readonly ITodaysBooking[] = [
  {
    id: "1",
    facility: "Møterom A",
    time: "09:00",
    duration: "2 timer",
    user: "Anna Hansen",
    status: "confirmed"
  },
  {
    id: "2",
    facility: "Tennisbane",
    time: "10:30",
    duration: "1 time",
    user: "Erik Larsen",
    status: "pending"
  },
  {
    id: "3",
    facility: "Møterom B",
    time: "14:00",
    duration: "3 timer",
    user: "Maria Olsen",
    status: "confirmed"
  },
  {
    id: "4",
    facility: "Fitnesssenter",
    time: "16:00",
    duration: "1.5 timer",
    user: "Lars Andersen",
    status: "cancelled"
  },
  {
    id: "5",
    facility: "Møterom C",
    time: "18:00",
    duration: "1 time",
    user: "Sofia Johansen",
    status: "confirmed"
  }
];

export const systemAlerts: readonly ISystemAlert[] = [
  {
    id: "1",
    type: "info",
    title: "Systemoppdatering tilgjengelig",
    message: "En ny versjon av BookMe er tilgjengelig for installasjon.",
    timestamp: "2 timer siden",
    action: "Installer nå"
  },
  {
    id: "2",
    type: "warning",
    title: "Høy serverbelastning",
    message: "Serveren opplever høy belastning. Ytelsen kan påvirkes.",
    timestamp: "4 timer siden",
    action: "Se detaljer"
  },
  {
    id: "3",
    type: "success",
    title: "Sikkerhetskopi fullført",
    message: "Dagens sikkerhetskopi ble fullført uten feil.",
    timestamp: "6 timer siden"
  }
];
