import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, type LucideIcon } from "lucide-react";

interface Step {
  id: number;
  title: string;
  description: string;
  icon: LucideIcon;
}

interface VerticalStepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
}

const VerticalStepper = ({
  steps,
  currentStep,
  onStepClick,
}: VerticalStepperProps) => {
  return (
    <Card className="w-full md:w-80 shadow-none">
      <CardContent>
        {/* Mobile: Horizontal */}
        <div className="md:hidden flex overflow-x-auto gap-2 pb-2">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === index;
            const isCompleted = currentStep > index;

            return (
              <div key={step.id} className="flex items-center gap-2">
                {/* Step Item */}
                <div
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-300 min-w-[100px] ${
                    isActive
                      ? "bg-blue-50 border-2 border-blue-500"
                      : isCompleted
                      ? "bg-white border-2 border-green-500"
                      : "bg-white border-2 border-slate-200"
                  }`}
                >
                  {/* Icon Circle */}
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                      isCompleted
                        ? "bg-green-500"
                        : isActive
                        ? "bg-blue-500"
                        : "bg-slate-200"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    ) : (
                      <Icon
                        className={`h-5 w-5 ${
                          isActive ? "text-white" : "text-slate-500"
                        }`}
                      />
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="text-center">
                    <p
                      className={`text-xs font-semibold ${
                        isActive
                          ? "text-blue-700"
                          : isCompleted
                          ? "text-green-700"
                          : "text-slate-600"
                      }`}
                    >
                      {step.title}
                    </p>
                  </div>
                </div>

                {/* Connector Line Horizontal */}
                {index < steps.length - 1 && (
                  <div
                    className={`w-8 h-0.5 transition-all duration-300 ${
                      currentStep > index ? "bg-green-500" : "bg-slate-300"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Desktop: Vertical */}
        <div className="hidden md:block space-y-1">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === index;
            const isCompleted = currentStep > index;

            return (
              <div key={step.id} className="relative">
                {/* Step Item */}
                <div
                  onClick={() => onStepClick?.(index)}
                  className={`flex items-start gap-4 p-4 rounded-lg transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "bg-blue-50 border-2 border-blue-500"
                      : isCompleted
                      ? "bg-white border-2 border-green-500"
                      : "bg-white border-2 border-slate-200 hover:border-slate-400"
                  }`}
                >
                  {/* Icon Circle with Number */}
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                        isCompleted
                          ? "bg-green-500"
                          : isActive
                          ? "bg-blue-500"
                          : "bg-slate-200"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-6 w-6 text-white" />
                      ) : (
                        <Icon
                          className={`h-6 w-6 ${
                            isActive ? "text-white" : "text-slate-500"
                          }`}
                        />
                      )}
                    </div>
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 pt-1">
                    <p
                      className={`text-sm font-semibold mb-1 ${
                        isActive
                          ? "text-blue-700"
                          : isCompleted
                          ? "text-green-700"
                          : "text-slate-600"
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-slate-500">{step.description}</p>
                  </div>

                  {/* Status Badge */}
                  {isCompleted && (
                    <div className="flex items-center">
                      <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        Selesai
                      </span>
                    </div>
                  )}
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="flex justify-center py-1">
                    <div
                      className={`w-0.5 h-4 transition-all duration-300 ${
                        currentStep > index ? "bg-green-500" : "bg-slate-300"
                      }`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default VerticalStepper;
