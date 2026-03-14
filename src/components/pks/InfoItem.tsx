export const InfoItem = ({ label, value }: { label: string; value: any }) => (
  <div>
    <span className="text-muted-foreground">{label}</span>
    <p className="font-medium">{value || "-"}</p>
  </div>
);
