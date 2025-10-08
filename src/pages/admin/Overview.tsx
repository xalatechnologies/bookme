"use client";

import React from "react";
import { useNavigate } from "react-router-dom";
import { Plus, CheckCircle } from "lucide-react";
import KPICard from "@/components/admin/dashboard/KPICard";
import ApprovalQueue from "@/components/admin/dashboard/ApprovalQueue";
import RecentEvents from "@/components/admin/dashboard/RecentEvents";
import TodaysBookings from "@/components/admin/dashboard/TodaysBookings";
import SystemAlerts from "@/components/admin/dashboard/SystemAlerts";
import DailyTasks from "@/components/admin/dashboard/DailyTasks";
import TrendCard from "@/components/admin/dashboard/TrendCard";
import { 
  kpiCards, 
  approvalRequests, 
  recentEvents, 
  todaysBookings, 
  systemAlerts 
} from "@/data/admin/dashboardData";
import { trendCards } from "@/data/admin/trendData";

interface IOverviewProps {
  readonly children?: never;
}

const Overview = (_props: IOverviewProps): JSX.Element => {
  const navigate = useNavigate();

  const handleNewFacility = (): void => {
    navigate('/admin/facilities/new');
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Velkommen tilbake! Her er en oversikt over systemet ditt.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleNewFacility}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nytt lokale
          </button>
        </div>
      </header>

      {/* Daily Tasks - Top Priority */}
      <DailyTasks />

      {/* KPI Cards Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Nøkkeltall
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {kpiCards.map((card) => (
            <KPICard key={card.id} card={card} />
          ))}
        </div>
      </section>

      {/* Trend Cards */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Trends og utvikling
        </h2>
        <div className="grid gap-6 lg:grid-cols-2">
          {trendCards.map((trendCard, index) => (
            <TrendCard
              key={index}
              title={trendCard.title}
              data={trendCard.data}
              icon={trendCard.icon}
              color={trendCard.color}
            />
          ))}
        </div>
      </section>

      {/* Operational Sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          <ApprovalQueue requests={approvalRequests} />
          <RecentEvents events={recentEvents} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <TodaysBookings bookings={todaysBookings} />
          <SystemAlerts alerts={systemAlerts} />
        </div>
      </div>
    </div>
  );
};

export default Overview;