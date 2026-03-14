import React from "react";
import { Check } from "lucide-react";

interface SubFlow {
  id: number;
  label: string;
}

interface FlowStep {
  id: number;
  label: string;
  subFlows?: SubFlow[];
}

interface FlowBeasiswaStepperProps {
  currentIdFlow: number;
}

const flowSteps: FlowStep[] = [
  {
    id: 2,
    label: "Verifikasi",
    subFlows: [
      { id: 4, label: "Perlu Perbaikan" },
      { id: 5, label: "Verifikasi Hasil Perbaikan" },
      { id: 3, label: "Tolak" },
    ],
  },
  {
    id: 6,
    label: "Proses Verifikasi Dinas",
    subFlows: [
      { id: 6, label: "Proses Verifikasi Dinas Kabupaten / Kota" },
      { id: 7, label: "Proses Verifikasi Dinas Provinsi" },
    ],
  },
  {
    id: 11,
    label: "Proses Analisa dan Penelaahan",
  },
  {
    id: 10,
    label: "Proses Wawancara & Test Akademik",
  },
  {
    id: 9,
    label: "Proses Analisa Rasio",
  },
];

const FlowBeasiswaStepper: React.FC<FlowBeasiswaStepperProps> = ({
  currentIdFlow,
}) => {
  const getMainFlowStatus = (
    step: FlowStep,
  ): "completed" | "active" | "upcoming" => {
    const allIds = [step.id, ...(step.subFlows?.map((sf) => sf.id) || [])];
    if (allIds.includes(currentIdFlow)) return "active";

    // Gunakan index sebagai acuan urutan, bukan nilai id
    const stepIndex = flowSteps.findIndex((s) => s.id === step.id);
    const currentStepIndex = flowSteps.findIndex((s) => {
      const allStepIds = [s.id, ...(s.subFlows?.map((sf) => sf.id) || [])];
      return allStepIds.includes(currentIdFlow);
    });

    if (stepIndex < currentStepIndex) return "completed";
    return "upcoming";
  };

  const getSubFlowStatus = (
    subFlowId: number,
    parentStep: FlowStep,
  ): "completed" | "active" | "upcoming" => {
    if (subFlowId === currentIdFlow) return "active";

    // Cek apakah subFlow ini sudah lewat berdasarkan posisi di parent
    const parentIndex = flowSteps.findIndex((s) => s.id === parentStep.id);
    const currentStepIndex = flowSteps.findIndex((s) => {
      const allStepIds = [s.id, ...(s.subFlows?.map((sf) => sf.id) || [])];
      return allStepIds.includes(currentIdFlow);
    });

    if (parentIndex < currentStepIndex) return "completed";

    // Jika di parent yang sama, cek urutan subFlow
    if (parentIndex === currentStepIndex) {
      const subFlowIds = parentStep.subFlows?.map((sf) => sf.id) ?? [];
      const subFlowIndex = subFlowIds.indexOf(subFlowId);
      const currentSubFlowIndex = subFlowIds.indexOf(currentIdFlow);
      if (subFlowIndex < currentSubFlowIndex) return "completed";
    }

    return "upcoming";
  };

  const calculateProgress = (): number => {
    const currentStepIndex = flowSteps.findIndex((s) => {
      const allStepIds = [s.id, ...(s.subFlows?.map((sf) => sf.id) || [])];
      return allStepIds.includes(currentIdFlow);
    });

    if (currentStepIndex === -1) return 0;
    return (currentStepIndex / (flowSteps.length - 1)) * 100;
  };

  return (
    <div className="w-full my-8 px-4">
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200">
          <div
            className="h-full bg-emerald-500 transition-all duration-500 ease-out"
            style={{ width: `${calculateProgress()}%` }}
          />
        </div>

        {/* Main Steps */}
        <div
          className="relative grid gap-4"
          style={{ gridTemplateColumns: `repeat(${flowSteps.length}, 1fr)` }}>
          {flowSteps.map((step) => {
            const status = getMainFlowStatus(step);
            const isInSubFlow = step.subFlows?.some(
              (sf) => sf.id === currentIdFlow,
            );

            return (
              <div key={step.id} className="flex flex-col items-center">
                {/* Main Step Circle */}
                <div
                  className={`
                    relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 
                    transition-all duration-300 ease-out
                    ${
                      status === "completed"
                        ? "bg-emerald-500 border-emerald-500 scale-100"
                        : status === "active" && !isInSubFlow
                          ? "bg-white border-emerald-500 scale-110 shadow-lg shadow-emerald-200"
                          : status === "active" && isInSubFlow
                            ? "bg-white border-amber-500 scale-105 shadow-lg shadow-amber-200"
                            : "bg-white border-gray-300"
                    }
                  `}>
                  {status === "completed" ? (
                    <Check className="w-5 h-5 text-white" strokeWidth={3} />
                  ) : status === "active" && !isInSubFlow ? (
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                  ) : status === "active" && isInSubFlow ? (
                    <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
                  ) : (
                    <div className="w-2 h-2 bg-gray-300 rounded-full" />
                  )}
                </div>

                {/* Main Step Label */}
                <div className="mt-3 text-center w-full px-1">
                  <p
                    className={`
                      text-xs font-medium transition-colors duration-300 leading-tight
                      ${
                        status === "active"
                          ? isInSubFlow
                            ? "text-amber-600 font-semibold"
                            : "text-emerald-600 font-semibold"
                          : status === "completed"
                            ? "text-gray-700"
                            : "text-gray-400"
                      }
                    `}>
                    {step.label}
                  </p>
                </div>

                {/* SubFlows */}
                {step.subFlows && (
                  <div className="mt-4 flex flex-col gap-2 w-full">
                    {step.subFlows.map((subFlow) => {
                      const subStatus = getSubFlowStatus(subFlow.id, step);
                      return (
                        <div
                          key={subFlow.id}
                          className={`
                            flex items-center gap-2 p-2 rounded-md border transition-all duration-300
                            ${
                              subStatus === "active"
                                ? "bg-amber-50 border-amber-300 shadow-sm"
                                : subStatus === "completed"
                                  ? "bg-emerald-50 border-emerald-200"
                                  : "bg-gray-50 border-gray-200"
                            }
                          `}>
                          <div
                            className={`
                              flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center
                              ${
                                subStatus === "completed"
                                  ? "bg-emerald-500 border-emerald-500"
                                  : subStatus === "active"
                                    ? "bg-amber-500 border-amber-500"
                                    : "bg-white border-gray-300"
                              }
                            `}>
                            {subStatus === "completed" ? (
                              <Check
                                className="w-3 h-3 text-white"
                                strokeWidth={3}
                              />
                            ) : subStatus === "active" ? (
                              <div className="w-2 h-2 bg-white rounded-full" />
                            ) : null}
                          </div>
                          <span
                            className={`
                              text-xs leading-tight
                              ${
                                subStatus === "active"
                                  ? "text-amber-700 font-medium"
                                  : subStatus === "completed"
                                    ? "text-emerald-700"
                                    : "text-gray-500"
                              }
                            `}>
                            {subFlow.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FlowBeasiswaStepper;
