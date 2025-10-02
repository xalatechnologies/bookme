"use client";

import React from "react";
import { useNavigate } from "react-router-dom";

export const Logo = (): JSX.Element => {
  const navigate = useNavigate();

  const handleClick = (): void => {
    navigate("/");
  };

  return (
    <div 
      className="flex items-center cursor-pointer" 
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label="Gå til forsiden"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="30 26 542.69 142"
        className="h-8 w-auto"
        aria-hidden="true"
      >
        <defs>
          <style>
            {`.font { font-family: -apple-system,BlinkMacSystemFont,"Inter","SF Pro Display","Segoe UI",Roboto,system-ui,sans-serif; }`}
          </style>
        </defs>

        {/* Icon group tuned to match reference proportions */}
        <g transform="translate(30,40)">
          {/* outer rounded square */}
          <rect x="0" y="0" width="120" height="120" rx="22" fill="#2f2f2f"/>
          {/* inner rounded inset (white face) */}
          <rect x="12" y="18" width="96" height="90" rx="16" fill="#ffffff"/>
          {/* slim tabs */}
          <rect x="28" y="-14" width="10" height="22" rx="5" fill="#2f2f2f"/>
          <rect x="82" y="-14" width="10" height="22" rx="5" fill="#2f2f2f"/>
          {/* checkmark */}
          <path d="M40 64 L56 80 L84 52" fill="none" stroke="#21C07A" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
        </g>

        {/* Wordmark */}
        <g transform="translate(180,25)">
          <text className="font" x="0" y="120" fontSize="110" letterSpacing="0">
            <tspan fill="#2f2f2f">Book</tspan>
            <tspan fill="#1E6BFF" fontWeight="700">me</tspan>
          </text>
        </g>
      </svg>
    </div>
  );
};
