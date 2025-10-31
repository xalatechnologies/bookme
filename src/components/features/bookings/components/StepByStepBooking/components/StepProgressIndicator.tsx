import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookingStep, IStepConfig } from "../../../hooks/useBookingSteps";
import { Calendar, FileText, Clock, Shield, CheckCircle } from "lucide-react";

/**
 * Step progress indicator props
 */
export interface IStepProgressIndicatorProps {
  readonly steps: readonly IStepConfig[];
  readonly currentStep: BookingStep;
  readonly currentStepIndex: number;
  readonly progress: number;
  readonly isStepAccessible: (stepIndex: number) => boolean;
  readonly isStepCompleted: (stepIndex: number) => boolean;
  readonly onStepClick: (step: BookingStep) => void;
}

/**
 * Icon mapping for steps
 */
const STEP_ICON_MAP: Record<string, React.ElementType> = {
  Calendar,
  FileText,
  Clock,
  Shield,
  CheckCircle,
};

/**
 * Step progress indicator component
 *
 * Displays step progress with visual indicators and clickable step buttons
 * Shows current step, completed steps, and accessible steps
 *
 * @param props - Component props
 * @returns JSX.Element
 */
export const StepProgressIndicator = ({
  steps,
  currentStep,
  currentStepIndex,
  progress,
  isStepAccessible,
  isStepCompleted,
  onStepClick,
}: IStepProgressIndicatorProps): JSX.Element => {
  const { t } = useTranslation("bookings");

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">
              {t("steps.progress.title", "Bookingprosess")}
            </h3>
            <span className="text-sm text-gray-500">
              {t("steps.progress.current", "Steg {{current}} av {{total}}", {
                current: currentStepIndex + 1,
                total: steps.length,
              })}
            </span>
          </div>

          <Progress value={progress} className="h-2" />

          <div className="flex justify-between">
            {steps.map((step, index) => {
              const IconComponent =
                STEP_ICON_MAP[step.icon as string] || Calendar;
              const isCompleted = isStepCompleted(index);
              const isCurrent = step.id === currentStep;
              const isAccessible = isStepAccessible(index);

              return (
                <button
                  key={step.id}
                  onClick={() => onStepClick(step.id)}
                  disabled={!isAccessible}
                  aria-label={`${step.title} - ${
                    isCurrent
                      ? t("steps.progress.current_step", "Gjeldende steg")
                      : isCompleted
                      ? t("steps.progress.completed", "Fullført")
                      : t("steps.progress.upcoming", "Kommende")
                  }`}
                  className={`flex flex-col items-center space-y-2 p-2 rounded-lg transition-colors ${
                    isCurrent
                      ? "bg-blue-100 text-blue-700"
                      : isCompleted
                      ? "bg-green-100 text-green-700"
                      : isAccessible
                      ? "hover:bg-gray-100 text-gray-600"
                      : "text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <IconComponent className="h-5 w-5" />
                  <span className="text-xs font-medium text-center">
                    {step.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
