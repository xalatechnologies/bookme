import { cn } from "@/lib/utils";
import { Calendar, FileText, Send, CheckCircle2 } from "lucide-react";

interface Step {
  id: number;
  label: string;
  completed: boolean;
  active: boolean;
}

interface BookingStepperProps {
  currentStep: number;
  totalSteps: number;
}

const steps: Step[] = [
  { id: 1, label: "Velg tidspunkter", completed: false, active: true },
  { id: 2, label: "Detaljer og vilkår", completed: false, active: false },
  { id: 3, label: "Bekreft", completed: false, active: false },
  { id: 4, label: "Sendt", completed: false, active: false },
];

const getStepIcon = (stepId: number) => {
  switch (stepId) {
    case 1:
      return Calendar;
    case 2:
      return FileText;
    case 3:
      return Send;
    case 4:
      return CheckCircle2;
    default:
      return Calendar;
  }
};

export function BookingStepper({ currentStep, totalSteps }: BookingStepperProps) {
  return (
    <div className="bg-white rounded-xl border border-border shadow-sm p-5">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-foreground">Bookingprosess</h3>
        <span className="text-sm text-muted-foreground">
          Steg {currentStep} av {totalSteps}
        </span>
      </div>
      
      <div className="relative px-2">
        <div className="absolute left-0 right-0 top-7 h-[2px] bg-border" />
        <div 
          className="absolute left-0 top-7 h-[2px] bg-primary transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />
        
        <div className="relative grid grid-cols-4">
          {steps.map((step) => {
            const Icon = getStepIcon(step.id);
            const isCompleted = step.id < currentStep;
            const isActive = step.id === currentStep;
            
            return (
              <div key={step.id} className="flex flex-col items-center text-center gap-3">
                <div className="relative">
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[11px] font-semibold text-muted-foreground">
                    {step.id}
                  </span>
                <div
                  className={cn(
                      "w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                      isCompleted && "bg-primary text-primary-foreground border-primary",
                      isActive &&
                        "bg-primary text-primary-foreground border-primary shadow-[0_8px_20px_-6px_rgba(51,81,165,0.5)]",
                      !isCompleted && !isActive && "bg-muted text-muted-foreground border-border"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  </div>
                </div>
                <span
                  className={cn(
                    "text-xs font-medium text-center leading-tight max-w-[110px]",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
