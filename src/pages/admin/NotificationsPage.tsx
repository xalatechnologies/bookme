"use client";

import React, { useMemo } from "react";
import { RequireRole } from "@/components/features/auth/components/RequireRole";
import SystemPageLayout from "@/components/layouts/AdminLayout/SystemPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useNotificationManagement } from "@/hooks/features/notifications";
import { formatNotificationForDisplay } from "@/services/business/notification.business.service";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  AlertCircle,
  Mail,
  Calendar,
  CreditCard,
  MessageSquare,
  AlertTriangle,
  Filter,
  X,
} from "lucide-react";
import type { Notification } from "@/types/notification";

interface INotificationItemProps {
  readonly notification: Notification;
  readonly isSelected: boolean;
  readonly onToggleSelection: () => void;
  readonly onMarkAsRead: () => void;
  readonly onDelete: () => void;
}

const NotificationItem = ({
  notification,
  isSelected,
  onToggleSelection,
  onMarkAsRead,
  onDelete,
}: INotificationItemProps): JSX.Element => {
  const formatted = formatNotificationForDisplay(notification);

  const getTypeIcon = (type: Notification['type']): React.ComponentType<{ className?: string }> => {
    const icons = {
      booking: Calendar,
      message: MessageSquare,
      system: AlertCircle,
      payment: CreditCard,
      reminder: Bell,
    };
    return icons[type];
  };

  const getTypeColor = (type: Notification['type']): string => {
    const colors = {
      booking: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      message: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
      system: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
      payment: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      reminder: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    };
    return colors[type];
  };

  const getPriorityColor = (priority: Notification['priority']): string => {
    const colors = {
      high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      medium: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
      low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    };
    return colors[priority];
  };

  const TypeIcon = getTypeIcon(notification.type);

  return (
    <div
      className={`flex items-start gap-4 p-6 rounded-lg border transition-all ${
        notification.read
          ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          : "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
      } hover:shadow-md`}
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={onToggleSelection}
        aria-label={`Select notification: ${notification.title}`}
      />

      <div className="flex-shrink-0 mt-1">
        <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${getTypeColor(notification.type)}`}>
          <TypeIcon className="h-6 w-6" />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="flex-1">
            <h3 className={`text-lg font-semibold mb-1 ${notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-900 dark:text-white'}`}>
              {notification.title}
              {!notification.read && (
                <span className="ml-2 inline-block h-2 w-2 rounded-full bg-blue-600" />
              )}
            </h3>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <Badge className={getTypeColor(notification.type)}>
                {notification.type}
              </Badge>
              <Badge className={getPriorityColor(notification.priority)}>
                {notification.priority} priority
              </Badge>
              {formatted.isUrgent && (
                <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Urgent
                </Badge>
              )}
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {formatted.timeAgo}
              </span>
            </div>
          </div>
        </div>

        <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-wrap">
          {notification.content}
        </p>

        <div className="flex items-center gap-2">
          {!notification.read && (
            <Button
              size="sm"
              variant="outline"
              onClick={onMarkAsRead}
              aria-label="Mark as read"
            >
              <Check className="h-4 w-4 mr-1" />
              Mark as read
            </Button>
          )}
          {notification.actionUrl && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.location.href = notification.actionUrl!}
              aria-label="View details"
            >
              View details
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={onDelete}
            aria-label="Delete notification"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

const NotificationsPage = (): JSX.Element => {
  const {
    filteredNotifications,
    groupedNotifications,
    isLoading,
    error,
    stats,
    unreadCount,
    uiState,
    setSearchTerm,
    toggleTypeFilter,
    clearTypeFilters,
    togglePriorityFilter,
    clearPriorityFilters,
    setReadFilter,
    resetFilters,
    toggleNotificationSelection,
    selectAllNotifications,
    clearSelection,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    batchMarkAsRead,
    batchDelete,
  } = useNotificationManagement();

  const hasActiveFilters = useMemo(() => {
    return (
      uiState.typeFilter.length > 0 ||
      uiState.priorityFilter.length > 0 ||
      uiState.readFilter !== undefined ||
      uiState.searchTerm.length > 0
    );
  }, [uiState]);

  const handleMarkAllAsRead = async (): Promise<void> => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleBatchMarkAsRead = async (): Promise<void> => {
    try {
      await batchMarkAsRead(uiState.selectedNotificationIds);
    } catch (error) {
      console.error('Failed to mark selected as read:', error);
    }
  };

  const handleBatchDelete = async (): Promise<void> => {
    if (!window.confirm('Are you sure you want to delete the selected notifications?')) {
      return;
    }
    try {
      await batchDelete(uiState.selectedNotificationIds);
    } catch (error) {
      console.error('Failed to delete selected notifications:', error);
    }
  };

  if (error) {
    return (
      <RequireRole minRole="admin">
        <SystemPageLayout
          title="Notifications"
          description="Manage your notifications"
        >
          <Card>
            <CardContent className="p-8">
              <div className="text-center text-red-600 dark:text-red-400">
                <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                <p className="text-lg">Failed to load notifications</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {error.message}
                </p>
              </div>
            </CardContent>
          </Card>
        </SystemPageLayout>
      </RequireRole>
    );
  }

  return (
    <RequireRole minRole="admin">
      <SystemPageLayout
        title="Notifications"
        description="View and manage your notifications"
        searchPlaceholder="Search notifications..."
        onSearch={setSearchTerm}
        primaryAction={{
          label: "Mark all as read",
          icon: CheckCheck,
          onClick: handleMarkAllAsRead,
        }}
      >
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.total}
                  </p>
                </div>
                <Bell className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Unread</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {stats.unread}
                  </p>
                </div>
                <Mail className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Urgent</p>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.urgent}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Read Rate</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.readPercentage}%
                  </p>
                </div>
                <CheckCheck className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </span>
              {hasActiveFilters && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={resetFilters}
                  aria-label="Clear all filters"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear filters
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Type Filters */}
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </p>
                <div className="flex flex-wrap gap-2">
                  {(['booking', 'message', 'system', 'payment', 'reminder'] as const).map((type) => (
                    <Button
                      key={type}
                      size="sm"
                      variant={uiState.typeFilter.includes(type) ? "default" : "outline"}
                      onClick={() => toggleTypeFilter(type)}
                      aria-label={`Filter by ${type}`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                      {stats.byType[type] > 0 && (
                        <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                          {stats.byType[type]}
                        </Badge>
                      )}
                    </Button>
                  ))}
                  {uiState.typeFilter.length > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={clearTypeFilters}
                      aria-label="Clear type filters"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              {/* Priority Filters */}
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </p>
                <div className="flex flex-wrap gap-2">
                  {(['high', 'medium', 'low'] as const).map((priority) => (
                    <Button
                      key={priority}
                      size="sm"
                      variant={uiState.priorityFilter.includes(priority) ? "default" : "outline"}
                      onClick={() => togglePriorityFilter(priority)}
                      aria-label={`Filter by ${priority} priority`}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      {stats.byPriority[priority] > 0 && (
                        <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                          {stats.byPriority[priority]}
                        </Badge>
                      )}
                    </Button>
                  ))}
                  {uiState.priorityFilter.length > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={clearPriorityFilters}
                      aria-label="Clear priority filters"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              {/* Read Status Filter */}
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={uiState.readFilter === undefined ? "default" : "outline"}
                    onClick={() => setReadFilter(undefined)}
                    aria-label="Show all notifications"
                  >
                    All
                  </Button>
                  <Button
                    size="sm"
                    variant={uiState.readFilter === false ? "default" : "outline"}
                    onClick={() => setReadFilter(false)}
                    aria-label="Show unread only"
                  >
                    Unread ({stats.unread})
                  </Button>
                  <Button
                    size="sm"
                    variant={uiState.readFilter === true ? "default" : "outline"}
                    onClick={() => setReadFilter(true)}
                    aria-label="Show read only"
                  >
                    Read ({stats.read})
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Batch Actions */}
        {uiState.selectedNotificationIds.length > 0 && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {uiState.selectedNotificationIds.length} notification(s) selected
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleBatchMarkAsRead}
                    aria-label="Mark selected as read"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Mark as read
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleBatchDelete}
                    aria-label="Delete selected"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={clearSelection}
                    aria-label="Clear selection"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notifications List */}
        {isLoading ? (
          <Card>
            <CardContent className="p-8">
              <div className="text-center text-gray-600 dark:text-gray-400">
                <Bell className="h-12 w-12 mx-auto mb-4 animate-pulse" />
                <p className="text-lg">Loading notifications...</p>
              </div>
            </CardContent>
          </Card>
        ) : filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="p-8">
              <div className="text-center text-gray-600 dark:text-gray-400">
                <Bell className="h-12 w-12 mx-auto mb-4" />
                <p className="text-lg">No notifications found</p>
                {hasActiveFilters && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={resetFilters}
                    className="mt-4"
                    aria-label="Clear filters"
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {uiState.selectedNotificationIds.length === 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={selectAllNotifications}
                aria-label="Select all notifications"
              >
                Select all
              </Button>
            )}

            {groupedNotifications.map((group) => (
              <Card key={group.label}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {group.label} ({group.notifications.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {group.notifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        isSelected={uiState.selectedNotificationIds.includes(notification.id)}
                        onToggleSelection={() => toggleNotificationSelection(notification.id)}
                        onMarkAsRead={() => markAsRead(notification.id)}
                        onDelete={() => deleteNotification(notification.id)}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </SystemPageLayout>
    </RequireRole>
  );
};

export default NotificationsPage;
