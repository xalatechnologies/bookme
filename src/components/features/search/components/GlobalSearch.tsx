"use client";
import React from "react";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";
import { SearchField, type ISearchResult } from "@/components/common";

interface GlobalSearchProps {
  readonly onResultClick?: () => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  onResultClick,
}): JSX.Element => {
  const {
    searchTerm,
    isOpen,
    results,
    searchRef,
    inputRef,
    handleSearchChange,
    handleResultClick: handleResult,
  } = useGlobalSearch(onResultClick);

  // Type adapter: convert SearchResult to ISearchResult
  const adaptedResults: ISearchResult[] = results.map(r => ({
    id: r.id,
    type: r.type,
    title: r.title,
    subtitle: r.subtitle,
    iconType: r.iconType,
    url: r.url,
    image: r.image,
  }));

  const handleClick = (result: ISearchResult) => {
    const originalResult = results.find(r => r.id === result.id);
    if (originalResult) {
      handleResult(originalResult);
    }
  };

  return (
    <SearchField
      variant="global"
      value={searchTerm}
      onChange={handleSearchChange}
      results={adaptedResults}
      onResultClick={handleClick}
      isOpen={isOpen}
      inputRef={inputRef}
      containerRef={searchRef}
      showShortcut={false}
      grouped={true}
    />
  );
};
