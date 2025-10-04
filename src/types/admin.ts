"use client";

export interface IKPICard {
  readonly id: string;
  readonly title: string;
  readonly value: number;
  readonly description: string;
  readonly trend: {
    readonly direction: "up" | "down" | "neutral";
    readonly percentage: number;
    readonly period: string;
  };
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly color: "blue" | "green" | "yellow" | "red" | "purple";
  readonly href: string;
}

export interface IApprovalRequest {
  readonly id: string;
  readonly title: string;
  readonly facility: string;
  readonly requester: string;
  readonly date: string;
  readonly priority: "high" | "medium" | "low";
}

export interface IRecentEvent {
  readonly id: string;
  readonly type: "booking" | "approval" | "user" | "system";
  readonly message: string;
  readonly timestamp: string;
  readonly user: string;
}

export interface ITodaysBooking {
  readonly id: string;
  readonly facility: string;
  readonly time: string;
  readonly duration: string;
  readonly user: string;
  readonly status: "confirmed" | "pending" | "cancelled";
}

export interface ISystemAlert {
  readonly id: string;
  readonly type: "info" | "warning" | "error" | "success";
  readonly title: string;
  readonly message: string;
  readonly timestamp: string;
  readonly action?: string;
}
