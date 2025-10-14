"use client";

import { BarChart3, Star } from "lucide-react";

export const bookingTrendData = [
  { day: "Man", value: 12 },
  { day: "Tir", value: 18 },
  { day: "Ons", value: 15 },
  { day: "Tor", value: 22 },
  { day: "Fre", value: 28 },
  { day: "Lør", value: 8 },
  { day: "Søn", value: 5 }
];

export const topFacilitiesData = [
  { day: "Uke 1", value: 45 },
  { day: "Uke 2", value: 52 },
  { day: "Uke 3", value: 38 },
  { day: "Uke 4", value: 61 },
  { day: "Uke 5", value: 48 },
  { day: "Uke 6", value: 55 },
  { day: "Uke 7", value: 42 }
];

export const trendCards = [
  {
    title: "Bookinger siste 7 dager",
    data: bookingTrendData,
    icon: BarChart3,
    color: "blue" as const
  },
  {
    title: "Topplokaler denne måneden",
    data: topFacilitiesData,
    icon: Star,
    color: "green" as const
  }
];
