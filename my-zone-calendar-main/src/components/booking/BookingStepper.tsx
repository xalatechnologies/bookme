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
    <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-foreground">Bookingprosess</h3>
        <span className="text-sm text-muted-foreground">
          Steg {currentStep} av {totalSteps}
        </span>
      </div>
      
      <div className="relative">
        {/* Progress bar background */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-border" />
        
        {/* Progress bar filled */}
        <div 
          className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />
        
        <div className="relative flex justify-between">
          {steps.map((step) => {
            const Icon = getStepIcon(step.id);
            const isCompleted = step.id < currentStep;
            const isActive = step.id === currentStep;
            
            return (
              <div key={step.id} className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                    isCompleted && "bg-primary text-primary-foreground",
                    isActive && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                    !isCompleted && !isActive && "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={cn(
                    "mt-3 text-xs font-medium text-center max-w-[80px]",
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
