"use client";

/**
 * Chart Configuration
 *
 * Centralized configuration for all dashboard charts
 *
 * SOLID Principles:
 * - Single Responsibility: Only manages chart configuration
 * - Open/Closed: Easy to extend with new chart types without modification
 * - Dependency Inversion: Components depend on this abstraction, not hardcoded values
 */

export interface IChartColors {
  readonly primary: string;
  readonly secondary: string;
  readonly success: string;
  readonly warning: string;
  readonly danger: string;
  readonly info: string;
  readonly gray: string;
}

export interface IChartTheme {
  readonly light: IChartColors;
  readonly dark: IChartColors;
}

export interface IChartDefaults {
  readonly barOpacity: number;
  readonly barHoverOpacity: number;
  readonly animationDuration: number;
  readonly gridLines: boolean;
  readonly tooltipEnabled: boolean;
  readonly legendEnabled: boolean;
}

/**
 * Default color palette for charts
 */
export const CHART_COLORS: IChartTheme = {
  light: {
    primary: "rgb(59, 130, 246)", // blue-500
    secondary: "rgb(139, 92, 246)", // purple-500
    success: "rgb(34, 197, 94)", // green-500
    warning: "rgb(251, 191, 36)", // yellow-500
    danger: "rgb(239, 68, 68)", // red-500
    info: "rgb(14, 165, 233)", // sky-500
    gray: "rgb(107, 114, 128)" // gray-500
  },
  dark: {
    primary: "rgb(96, 165, 250)", // blue-400
    secondary: "rgb(167, 139, 250)", // purple-400
    success: "rgb(74, 222, 128)", // green-400
    warning: "rgb(253, 224, 71)", // yellow-400
    danger: "rgb(248, 113, 113)", // red-400
    info: "rgb(56, 189, 248)", // sky-400
    gray: "rgb(156, 163, 175)" // gray-400
  }
};

/**
 * Default chart configuration values
 */
export const CHART_DEFAULTS: IChartDefaults = {
  barOpacity: 0.7,
  barHoverOpacity: 1.0,
  animationDuration: 300,
  gridLines: true,
  tooltipEnabled: true,
  legendEnabled: true
};

/**
 * Chart type configurations
 */
export const CHART_TYPES = {
  bar: {
    borderRadius: 4,
    minHeight: 10,
    spacing: 1
  },
  line: {
    strokeWidth: 2,
    pointRadius: 4,
    tension: 0.4
  },
  pie: {
    innerRadius: 0,
    outerRadius: 100,
    padAngle: 0.02
  }
} as const;

/**
 * Responsive breakpoints for charts
 */
export const CHART_BREAKPOINTS = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
  wide: 1280
} as const;

/**
 * Chart dimensions
 */
export const CHART_DIMENSIONS = {
  miniChart: {
    height: 64, // 16 * 4 (h-16)
    width: "100%"
  },
  smallChart: {
    height: 128, // 32 * 4 (h-32)
    width: "100%"
  },
  mediumChart: {
    height: 256, // 64 * 4 (h-64)
    width: "100%"
  },
  largeChart: {
    height: 384, // 96 * 4 (h-96)
    width: "100%"
  }
} as const;

/**
 * Chart axis configurations
 */
export const CHART_AXES = {
  x: {
    showGrid: true,
    showLabels: true,
    tickRotation: 0,
    fontSize: 12
  },
  y: {
    showGrid: true,
    showLabels: true,
    tickRotation: 0,
    fontSize: 12,
    minValue: 0
  }
} as const;

/**
 * Chart legend configurations
 */
export const CHART_LEGEND = {
  position: "bottom" as const,
  align: "center" as const,
  fontSize: 12,
  padding: 16,
  itemSpacing: 12
} as const;

/**
 * Chart tooltip configurations
 */
export const CHART_TOOLTIP = {
  backgroundColor: "rgba(0, 0, 0, 0.8)",
  textColor: "#ffffff",
  fontSize: 12,
  padding: 8,
  borderRadius: 4,
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
} as const;

/**
 * Number formatting options for charts
 */
export const CHART_NUMBER_FORMAT = {
  locale: "nb-NO",
  currency: "NOK",
  decimalPlaces: 0,
  useGrouping: true
} as const;

/**
 * Date formatting options for charts
 */
export const CHART_DATE_FORMAT = {
  locale: "nb-NO",
  shortDate: {
    day: "2-digit",
    month: "2-digit"
  },
  longDate: {
    day: "2-digit",
    month: "short",
    year: "numeric"
  },
  time: {
    hour: "2-digit",
    minute: "2-digit"
  }
} as const;

/**
 * Get color based on value type and theme
 */
export const getChartColor = (
  type: keyof IChartColors,
  isDarkMode: boolean = false
): string => {
  return isDarkMode ? CHART_COLORS.dark[type] : CHART_COLORS.light[type];
};

/**
 * Get responsive chart height based on screen width
 */
export const getResponsiveChartHeight = (screenWidth: number): number => {
  if (screenWidth < CHART_BREAKPOINTS.mobile) {
    return CHART_DIMENSIONS.smallChart.height;
  }
  if (screenWidth < CHART_BREAKPOINTS.tablet) {
    return CHART_DIMENSIONS.mediumChart.height;
  }
  return CHART_DIMENSIONS.largeChart.height;
};

/**
 * Format number for chart display
 */
export const formatChartNumber = (
  value: number,
  locale: string = CHART_NUMBER_FORMAT.locale
): string => {
  return new Intl.NumberFormat(locale, {
    useGrouping: CHART_NUMBER_FORMAT.useGrouping,
    minimumFractionDigits: 0,
    maximumFractionDigits: CHART_NUMBER_FORMAT.decimalPlaces
  }).format(value);
};

/**
 * Format currency for chart display
 */
export const formatChartCurrency = (
  value: number,
  locale: string = CHART_NUMBER_FORMAT.locale,
  currency: string = CHART_NUMBER_FORMAT.currency
): string => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

/**
 * Format date for chart axis labels
 */
export const formatChartDate = (
  date: Date | string,
  format: "short" | "long" | "time" = "short",
  locale: string = CHART_DATE_FORMAT.locale
): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  const formatOptions = {
    short: CHART_DATE_FORMAT.shortDate,
    long: CHART_DATE_FORMAT.longDate,
    time: CHART_DATE_FORMAT.time
  };

  return new Intl.DateTimeFormat(locale, formatOptions[format] as Intl.DateTimeFormatOptions).format(dateObj);
};
