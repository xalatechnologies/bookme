import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Euro, Phone, Mail, Calendar } from "lucide-react";
import type { IFacility } from "@/stores/facilityStore";
import { useTranslation } from "react-i18next";
import { useAmenityTranslation } from "@/hooks/shared";

interface FacilityContactInfoProps {
  readonly facility: IFacility;
}

export const FacilityContactInfo: React.FC<FacilityContactInfoProps> = ({
  facility,
}) => {
  const { t } = useTranslation(["facility", "common"]);
  const translateAmenity = useAmenityTranslation();

  // Defensive: handle initial loading state where facility may be undefined
  if (!facility) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {t("loading.facility", { ns: "common" })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500">
              {t("loading.please_wait", { ns: "common" })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleBookNow = (): void => {
    try {
      // Navigate to booking page
      window.location.href = `/facilities/${facility.id}/book`;
    } catch (error) {
      console.error("Failed to navigate to booking:", error);
      alert(t("facility:contact.booking_failed"));
    }
  };

  const handleContact = (): void => {
    try {
      // Create contact options
      const contactOptions = [
        `${t("facility:contact.phone")}: ${
          facility.emergencyContact || "+47 32 04 70 00"
        }`,
        `${t("facility:contact.email")}: ${
          facility.contactEmail || "booking@drammen.kommune.no"
        }`,
        `${t("facility:contact.facility")}: ${facility.name}`,
        `${t("facility:contact.location")}: ${facility.location}`,
      ].join("\n");

      // Show contact information
      const contactChoice = window.confirm(
        `${t("facility:contact.contact_info_for", { name: facility.name })}

${contactOptions}

${t("facility:contact.open_email_client")}`
      );

      if (contactChoice) {
        // Open email client
        const subject = t("facility:contact.inquiry_about", {
          name: facility.name,
        });
        const body = t("facility:contact.email_template", {
          name: facility.name,
        });

        const mailtoLink = `mailto:${
          facility.contactEmail || "booking@drammen.kommune.no"
        }?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
          body
        )}`;
        window.open(mailtoLink);
      } else {
        // Copy contact info to clipboard
        navigator.clipboard.writeText(contactOptions);
        alert(t("facility:contact.contact_copied"));
      }
    } catch (error) {
      console.error("Failed to handle contact:", error);
      alert(t("facility:contact.contact_error"));
    }
  };

  return (
    <div className="space-y-6">
      {/* Removed contact card as requested - contact info is now in the general tab */}
      {/* Removed rules card as requested */}
    </div>
  );
};