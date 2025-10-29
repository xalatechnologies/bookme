import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export const HeroBanner = (): JSX.Element => {
  const { language } = useLanguage();

  const translations = {
    NO: {
      subtitle: "Drammen Kommune",
      description:
        "Oppdag og reserver kommunale lokaler til møter, arrangementer og aktiviteter. Enkelt, raskt og oversiktlig.",
    },
    EN: {
      subtitle: "Drammen Municipality",
      description:
        "Discover and book municipal facilities for meetings, events and activities. Simple, fast and clear.",
    },
  };

  const t = translations[language];

  return (
    <div className="w-full mb-8">
      <div className="relative w-full">
        <img
          src="/placeholder.svg"
          alt="Drammen by med elv og broer"
          className="w-full h-[200px] md:h-[240px] object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/60 to-transparent flex items-center">
          <div className="content-center py-8 w-full">
            <div className="max-w-2xl px-4">
              <p className="font-semibold mb-2 text-gray-50 text-3xl md:text-5xl">
                {t.subtitle}
              </p>
              <p className="text-base sm:text-lg text-gray-100 max-w-xl leading-relaxed">
                {t.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
