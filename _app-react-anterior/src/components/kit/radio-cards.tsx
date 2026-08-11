import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type RadioCardOption = {
  value: string;
  label: string;
  description?: string;
};

/**
 * Radio group rendered as selectable cards — the whole card is the label,
 * so the hit area matches the visual affordance.
 */
export default function RadioCards({
  options,
  value,
  onValueChange,
  name,
  className,
}: {
  options: RadioCardOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  className?: string;
}) {
  return (
    <RadioGroup value={value} onValueChange={onValueChange} name={name} className={cn("kit-radio-cards", className)}>
      {options.map((option) => (
        <Label
          key={option.value}
          htmlFor={`${name ?? "radio"}-${option.value}`}
          className={cn("kit-radio-card kit-surface", value === option.value && "is-selected")}
        >
          <RadioGroupItem id={`${name ?? "radio"}-${option.value}`} value={option.value} className="mt-1" />
          <span>
            <strong>{option.label}</strong>
            {option.description ? <em>{option.description}</em> : null}
          </span>
        </Label>
      ))}
    </RadioGroup>
  );
}
