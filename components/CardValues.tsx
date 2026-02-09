import { Label } from "./ui/label";

export const CardValues = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => {
  return (
    <div>
      <Label className="text-sm text-gray-500">{label}</Label>
      <div className="text-base font-semibold text-gray-900">{value}</div>
    </div>
  );
};
