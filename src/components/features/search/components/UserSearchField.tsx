"use client";
import React from "react";
import { useAdminSearch } from "@/hooks/useAdminSearch";
import { SearchField, type ISearchResult } from "@/components/common";

const UserSearchField = (): JSX.Element => {
  const {
    searchTerm,
    isOpen,
    results,
    searchRef,
    inputRef,
    handleSearchChange,
    handleResultClick,
    handleKeyDown,
  } = useAdminSearch();

  // Type adapter: convert AdminSearchResult to ISearchResult
  const adaptedResults: ISearchResult[] = results.map(r => ({
    id: r.id,
    type: r.type,
    title: r.title,
    subtitle: r.subtitle,
    iconType: r.iconType,
    url: r.url,
  }));

  const handleClick = (result: ISearchResult) => {
    const originalResult = results.find(r => r.id === result.id);
    if (originalResult) {
      handleResultClick(originalResult);
    }
  };

  return (
    <SearchField
      variant="user"
      value={searchTerm}
      onChange={handleSearchChange}
      results={adaptedResults}
      onResultClick={handleClick}
      onKeyDown={handleKeyDown}
      isOpen={isOpen}
      inputRef={inputRef}
      containerRef={searchRef}
      showShortcut={true}
      grouped={true}
    />
  );
};

export default UserSearchField;
