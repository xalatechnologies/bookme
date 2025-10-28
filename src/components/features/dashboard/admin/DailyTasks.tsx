"use client";

import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  CheckCircle, 
  AlertTriangle, 
  ArrowRight,
  Clock,
  CreditCard,
  Users
} from "lucide-react";

interface IDailyTask {
  readonly id: string;
  readonly title: string;
  readonly count: number;
  readonly priority: "high" | "medium" | "low";
  readonly href: string;
  readonly icon: React.ComponentType<{ className?: string }>;
}

export const DailyTasks = (): JSX.Element => {
  const navigate = useNavigate();

  const dailyTasks: readonly IDailyTask[] = [
    {
      id: "1",
      title: "Ventende godkjenninger",
      count: 3,
      priority: "high",
      href: "/admin/bookings?filter=pending",
      icon: CheckCircle
    },
    {
      id: "2",
      title: "Bookinger med feil i betaling",
      count: 1,
      priority: "high",
      href: "/admin/bookings?filter=payment-error",
      icon: CreditCard
    },
    {
      id: "3",
      title: "Brukere uten roller",
      count: 2,
      priority: "medium",
      href: "/admin/users-roles?filter=no-role",
      icon: Users
    }
  ];

  const getPriorityColor = (priority: IDailyTask["priority"]): string => {
    const colors = {
      high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      low: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
    };
    return colors[priority];
  };

  const getPriorityIcon = (priority: IDailyTask["priority"]): React.ComponentType<{ className?: string }> => {
    const icons = {
      high: AlertTriangle,
      medium: Clock,
      low: CheckCircle
    };
    return icons[priority];
  };

  const handleTaskClick = (href: string): void => {
    navigate(href);
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Dine oppgaver i dag
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {dailyTasks.map((task) => {
            const PriorityIcon = getPriorityIcon(task.priority);
            const TaskIcon = task.icon;
            
            return (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                onClick={() => handleTaskClick(task.href)}
              >
                <div className="flex items-center space-x-3">
                  <TaskIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {task.title}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={getPriorityColor(task.priority)}>
                        <PriorityIcon className="h-3 w-3 mr-1" />
                        {task.priority === "high" ? "Høy" : task.priority === "medium" ? "Medium" : "Lav"}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {task.count}
                  </span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};


