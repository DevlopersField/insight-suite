import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "pass" | "warn" | "fail" | "info";
  label?: string;
  className?: string;
}

export const StatusBadge = ({ status, label, className }: StatusBadgeProps) => {
  const styles = {
    pass: "bg-success/15 text-success border-success/30",
    warn: "bg-warning/15 text-warning border-warning/30",
    fail: "bg-destructive/15 text-destructive border-destructive/30",
    info: "bg-info/15 text-info border-info/30",
  };

  const defaultLabels = { pass: "Pass", warn: "Warning", fail: "Fail", info: "Info" };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-mono font-medium border",
        styles[status],
        className
      )}
    >
      <span className={cn(
        "w-1.5 h-1.5 rounded-full",
        status === "pass" && "bg-success",
        status === "warn" && "bg-warning",
        status === "fail" && "bg-destructive",
        status === "info" && "bg-info",
      )} />
      {label || defaultLabels[status]}
    </span>
  );
};
