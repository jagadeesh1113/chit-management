import { Label } from "./ui/label";

export const CardValues = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => {
  return (
    <div className="space-y-0.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="text-sm font-semibold">{value ?? "—"}</div>
    </div>
  );
};
