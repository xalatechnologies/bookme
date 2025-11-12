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
      className="flex items-center cursor-pointer"
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
      <img
        src="/Design uten navn.svg"
        alt={t('aria.logo')}
        className="h-8 w-auto"
      />
    </div>
  );
};