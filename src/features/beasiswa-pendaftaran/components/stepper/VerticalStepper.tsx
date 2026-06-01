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
      <CardContent className="p-3 md:p-6">
        {/* ── Mobile: Progress bar + dot indicators ── */}
        <div className="md:hidden">
          {/* Label aktif + counter */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-blue-700">
              {steps[currentStep]?.title}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {currentStep + 1}/{steps.length}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>

          {/* Dot icons */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === index;
              const isCompleted = currentStep > index;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => onStepClick?.(index)}
                  className="flex flex-col items-center gap-1 flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCompleted
                        ? "bg-green-500"
                        : isActive
                          ? "bg-blue-500 ring-2 ring-blue-200 ring-offset-1"
                          : "bg-slate-200"
                    }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    ) : (
                      <Icon
                        className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`}
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Deskripsi step aktif */}
          <p className="text-xs text-slate-500 mt-2 text-center">
            {steps[currentStep]?.description}
          </p>
        </div>

        {/* ── Desktop: Vertical stepper (tidak diubah) ── */}
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
                  }`}>
                  {/* Icon Circle with Number */}
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                        isCompleted
                          ? "bg-green-500"
                          : isActive
                            ? "bg-blue-500"
                            : "bg-slate-200"
                      }`}>
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
                      }`}>
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
