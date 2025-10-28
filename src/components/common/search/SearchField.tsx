/**
 * SearchField - Reusable Universal Search Component
 *
 * A highly configurable search input with dropdown results,
 * keyboard shortcuts, grouping, and multiple variants.
 *
 * @example
 * ```tsx
 * <SearchField
 *   variant="admin"
 *   placeholder={t('search.placeholder')}
 *   value={searchTerm}
 *   onChange={setSearchTerm}
 *   results={searchResults}
 *   onResultClick={handleClick}
 *   grouped={true}
 *   showShortcut={true}
 * />
 * ```
 */

import React from "react";
import { useTranslation } from "react-i18next";
import {
  Search,
  Command,
  Building,
  Users,
  Calendar,
  FileText,
  MapPin,
} from "lucide-react";
import { Input } from "@/components/ui/input";

/**
 * Search result item structure
 */
export interface ISearchResult {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  iconType: string;
  image?: string;
  href?: string;
  url?: string; // Added for backward compatibility with hooks
}

/**
 * SearchField props
 */
export interface SearchFieldProps {
  /** Search variant - controls styling and behavior */
  variant?: "admin" | "user" | "global" | "simple";
  /** Placeholder text */
  placeholder?: string;
  /** Current search value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Search results to display */
  results?: ISearchResult[];
  /** Result click handler */
  onResultClick?: (result: ISearchResult) => void;
  /** Keydown handler for custom keyboard shortcuts */
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  /** Whether dropdown is open */
  isOpen?: boolean;
  /** Control dropdown open state */
  onOpenChange?: (open: boolean) => void;
  /** Input ref for focus control */
  inputRef?: React.RefObject<HTMLInputElement>;
  /** Container ref for click-outside detection */
  containerRef?: React.RefObject<HTMLDivElement>;
  /** Show keyboard shortcut hint (Cmd+K) */
  showShortcut?: boolean;
  /** Group results by type */
  grouped?: boolean;
  /** Custom group title mapper */
  getGroupTitle?: (type: string) => string;
  /** Custom icon mapper */
  getIcon?: (iconType: string) => React.ReactNode;
  /** aria-label for accessibility */
  ariaLabel?: string;
  /** Additional className for container */
  className?: string;
}

/**
 * Default icon mapper
 */
const defaultGetIcon = (iconType: string): React.ReactNode => {
  const iconClass = "h-5 w-5";

  switch (iconType) {
    case "building":
      return <Building className={iconClass} />;
    case "users":
      return <Users className={iconClass} />;
    case "calendar":
      return <Calendar className={iconClass} />;
    case "document":
      return <FileText className={iconClass} />;
    case "location":
      return <MapPin className={iconClass} />;
    default:
      return <Building className={iconClass} />;
  }
};

/**
 * SearchField Component
 */
export const SearchField: React.FC<SearchFieldProps> = ({
  variant = "simple",
  placeholder,
  value,
  onChange,
  results = [],
  onResultClick,
  onKeyDown,
  isOpen = false,
  onOpenChange,
  inputRef,
  containerRef,
  showShortcut = false,
  grouped = false,
  getGroupTitle,
  getIcon = defaultGetIcon,
  ariaLabel,
  className = "",
}) => {
  const { t } = useTranslation("common");

  // Variant-specific configurations
  const variantConfig = {
    admin: {
      maxWidth: "max-w-2xl",
      minWidth: "min-w-[300px]",
      iconSize: "w-8 h-8",
      resultPadding: "px-4 py-3",
      titleSize: "text-sm",
      placeholder: placeholder || t("search.search_admin"),
    },
    user: {
      maxWidth: "max-w-2xl",
      minWidth: "min-w-[300px]",
      iconSize: "w-10 h-10",
      resultPadding: "px-4 py-3",
      titleSize: "text-sm",
      placeholder: placeholder || t("search.search_venues"),
    },
    global: {
      maxWidth: "max-w-2xl",
      minWidth: "min-w-[350px]",
      iconSize: "w-12 h-12",
      resultPadding: "px-4 py-4",
      titleSize: "text-base",
      placeholder: placeholder || t("search.search_facilities"),
    },
    simple: {
      maxWidth: "max-w-md",
      minWidth: "min-w-[250px]",
      iconSize: "w-8 h-8",
      resultPadding: "px-3 py-2",
      titleSize: "text-sm",
      placeholder: placeholder || t("search.placeholder"),
    },
  };

  const config = variantConfig[variant];

  // Group results by type if enabled
  const groupedResults = grouped
    ? results.reduce((acc, result) => {
        if (!acc[result.type]) {
          acc[result.type] = [];
        }
        acc[result.type].push(result);
        return acc;
      }, {} as Record<string, ISearchResult[]>)
    : { all: results };

  // Default group title mapper
  const defaultGetGroupTitle = (type: string): string => {
    // Use custom mapper if provided
    if (getGroupTitle) {
      return getGroupTitle(type);
    }

    // Default mapping
    switch (type) {
      case "facility":
        return t("search.group_facilities");
      case "user":
        return t("search.group_users");
      case "booking":
        return t("search.group_bookings");
      case "document":
        return t("search.group_documents");
      case "location":
        return t("search.group_locations");
      case "category":
        return t("search.group_categories");
      case "recent":
        return t("search.recent_searches");
      default:
        return type;
    }
  };

  // Handle result click
  const handleResultClick = (result: ISearchResult): void => {
    onResultClick?.(result);
    onOpenChange?.(false);
  };

  // Handle result keyboard interaction
  const handleResultKeyDown = (
    e: React.KeyboardEvent,
    result: ISearchResult
  ): void => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleResultClick(result);
    }
  };

  return (
    <div
      className={`relative w-full ${config.maxWidth} ${config.minWidth} ${className}`}
      ref={containerRef}
    >
      <div className="relative">
        {/* Search Icon */}
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10"
          aria-hidden="true"
        />

        {/* Search Input */}
        <Input
          ref={inputRef}
          type="text"
          placeholder={config.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => {
            if (value.trim() && results.length > 0) {
              onOpenChange?.(true);
            }
          }}
          className={`
            pl-10 
            ${showShortcut ? "pr-16" : "pr-4"} 
            py-2 
            w-full 
            border-gray-300 
            dark:border-gray-600 
            focus:border-blue-500 
            focus:ring-blue-500
          `}
          aria-label={ariaLabel || t("aria.search_input")}
        />

        {/* Keyboard Shortcut Hint */}
        {showShortcut && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-40 max-h-96 overflow-hidden">
          <div className="rounded-lg border-0">
            <div className="max-h-96 overflow-y-auto">
              {results.length === 0 ? (
                <div className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  {t("search.no_results")}
                </div>
              ) : (
                <>
                  {Object.entries(groupedResults).map(([type, typeResults]) => (
                    <div
                      key={type}
                      className="border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                    >
                      {/* Group Header (only if grouped) */}
                      {grouped && (
                        <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700">
                          {defaultGetGroupTitle(type)}
                        </div>
                      )}

                      {/* Results */}
                      {typeResults.map((result) => (
                        <div
                          key={result.id}
                          onClick={() => handleResultClick(result)}
                          className={`
                            flex items-center gap-3 
                            ${config.resultPadding}
                            cursor-pointer 
                            hover:bg-gray-50 
                            dark:hover:bg-gray-700 
                            transition-colors
                          `}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => handleResultKeyDown(e, result)}
                        >
                          {/* Icon or Image */}
                          {result.image ? (
                            <div
                              className={`${config.iconSize} bg-gray-100 dark:bg-gray-600 overflow-hidden flex-shrink-0 rounded`}
                            >
                              <img
                                src={result.image}
                                alt={result.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div
                              className={`${config.iconSize} bg-gray-100 dark:bg-gray-600 flex items-center justify-center flex-shrink-0 rounded`}
                            >
                              {getIcon(result.iconType)}
                            </div>
                          )}

                          {/* Text */}
                          <div className="flex-1 min-w-0">
                            <div
                              className={`font-medium text-gray-900 dark:text-white truncate ${config.titleSize}`}
                            >
                              {result.title}
                            </div>
                            {result.subtitle && (
                              <div
                                className={`text-xs text-gray-500 dark:text-gray-400 truncate mt-1 ${
                                  variant === "global" ? "text-base" : ""
                                }`}
                              >
                                {result.subtitle}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
