"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Plus, Sun, Cloud, CloudRain, Snowflake } from "lucide-react";

interface IHeroSectionProps {
  readonly userName: string;
  readonly weather: {
    readonly temperature: number;
    readonly condition: "sunny" | "cloudy" | "rainy" | "snowy";
    readonly description: string;
  } | null;
  readonly totalBookings: number;
  readonly monthlyBookingLimit: number;
  readonly nextBooking: {
    readonly facility: string;
    readonly date: string;
    readonly time: string;
  } | null;
  readonly onNewBooking: () => void;
}

export const HeroSection = (props: IHeroSectionProps): JSX.Element => {
  const { userName, weather, totalBookings, monthlyBookingLimit, nextBooking, onNewBooking } = props;
  const { t } = useTranslation('common');

  const getDayOfWeek = (): string => {
    const dayIndex = new Date().getDay();
    const dayKeys = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    return t(`user:dashboard.days.${dayKeys[dayIndex]}`);
  };

  const getWeatherIcon = (condition: "sunny" | "cloudy" | "rainy" | "snowy"): JSX.Element => {
    const icons = {
      sunny: Sun,
      cloudy: Cloud,
      rainy: CloudRain,
      snowy: Snowflake
    };
    const Icon = icons[condition];
    return <Icon className="h-5 w-5" />;
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t('user:dashboard.greeting', { dayOfWeek: getDayOfWeek(), name: userName })} 👋
              </h1>
              {weather && (
                <div className="flex items-center gap-2 px-3 py-1 bg-white/50 dark:bg-gray-800/50 rounded-full">
                  {getWeatherIcon(weather.condition)}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {weather.temperature}°C
                  </span>
                </div>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-3">
              {weather && `${t('user:dashboard.weather_in_city', { description: weather.description })} `}
              {t('user:dashboard.perfect_day')}
            </p>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('user:dashboard.monthly_bookings')}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {totalBookings} {t('user:dashboard.of')} {monthlyBookingLimit}
                </span>
              </div>
              <Progress
                value={(totalBookings / monthlyBookingLimit) * 100}
                className="h-2"
              />
            </div>

            <p className="text-sm text-blue-600 dark:text-blue-400">
              {nextBooking ?
                t('user:dashboard.next_booking', {
                  facility: nextBooking.facility,
                  date: nextBooking.date,
                  time: nextBooking.time
                }) :
                t('user:dashboard.no_upcoming_bookings')
              }
            </p>
          </div>
          <div className="ml-6">
            <Button
              onClick={onNewBooking}
              className="bg-blue-600 hover:bg-blue-700 text-lg px-6 py-3 shadow-lg"
              size="lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              {t('user:dashboard.new_booking')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};


