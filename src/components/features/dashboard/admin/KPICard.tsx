"use client";

import React from "react";
import { useNavigate } from "react-router-dom";
import { KPICard as ReusableKPICard } from "@/components/common";
import type { IKPICard } from "@/types/admin";

interface IKPICardProps {
  readonly card: IKPICard;
}

/**
 * KPICard Wrapper Component
 *
 * Adapts the legacy IKPICard interface to use the reusable KPICard component.
 * This maintains backward compatibility while leveraging the shared component.
 */
export const KPICard = ({ card }: IKPICardProps): JSX.Element => {
  const navigate = useNavigate();

  const handleClick = (): void => {
    navigate(card.href);
  };

  // Map color from IKPICard to KPICardProps
  const colorMap: Record<
    string,
    "blue" | "green" | "yellow" | "red" | "purple" | "gray"
  > = {
    blue: "blue",
    green: "green",
    yellow: "yellow",
    red: "red",
    purple: "purple",
  };

  return (
    <ReusableKPICard
      title={card.title}
      value={card.value}
      format="number"
      description={card.description}
      trend={{
        value: card.trend.percentage,
        direction: card.trend.direction,
        period: card.trend.period,
      }}
      icon={<card.icon className="w-6 h-6" />}
      color={colorMap[card.color] || "gray"}
      onClick={handleClick}
      size="md"
    />
  );
};
