"use client";

import React from "react";

import { Toggle } from "@/components/ui/toggle";

interface LanguageToggleProps {
  readonly language: 'NO' | 'EN';
  readonly toggleLanguage: () => void;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ language, toggleLanguage }): JSX.Element => {
  return (
    <Toggle 
      pressed={language === 'EN'}
      onPressedChange={toggleLanguage}
      className="border rounded-md px-3 py-1"
    >
      {language === 'NO' ? 'NO' : 'EN'}
    </Toggle>
  );
};

