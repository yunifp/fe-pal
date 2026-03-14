import CollapsibleSection from "@/components/beasiswa/CollapsibleSection";
import type { ITrxBeasiswa } from "@/types/beasiswa";
import { Briefcase, Navigation, Sprout } from "lucide-react";
import { type FC } from "react";

const InfoItem = ({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value?: string | null;
}) => (
  <div className="flex items-start gap-3 py-2">
    <Icon className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-sm mt-1 break-words">{value || "-"}</p>
    </div>
  </div>
);

interface SubmittedTaggingProps {
  existBeasiswa: ITrxBeasiswa;
}

const SubmittedTagging: FC<SubmittedTaggingProps> = ({ existBeasiswa: _ }) => {
  return (
    <CollapsibleSection
      title="Data Tagging"
      icon={Navigation}
      defaultOpen={false}
    >
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <InfoItem icon={Sprout} label="Tagging Alamat Kebun" value="" />
          <InfoItem icon={Briefcase} label="Tagging Alamat Bekerja" value="" />
        </div>
      </>
    </CollapsibleSection>
  );
};

export default SubmittedTagging;
