"use client";

import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const Logo = (): JSX.Element => {
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  const handleClick = (): void => {
    // Navigate to home page and indicate this is coming from a portal
    // This prevents automatic redirection back to portals
    navigate("/", { state: { fromPortal: true } });
  };

  return (
    <div
      className="flex items-center gap-0 cursor-pointer"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={t('aria.go_to_home')}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className="h-10 flex items-center overflow-visible">
        <img
          src="/Design uten navn (1).png"
          alt={t('aria.logo')}
          className="h-20 w-auto"
        />
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-lg font-semibold text-gray-900 dark:text-white tracking-wide">
          DIGILIST
        </span>
        <span className="text-sm text-gray-600 dark:text-gray-300 tracking-wide">
          ENKEL BOOKING
        </span>
      </div>
    </div>
  );
};