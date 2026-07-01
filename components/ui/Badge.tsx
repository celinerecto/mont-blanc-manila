import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "neighborhood" | "verified" | "unverified" | "variant";
  className?: string;
}

export default function Badge({ children, variant = "neighborhood", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-semibold",
        variant === "neighborhood" && "bg-orange-pale text-orange",
        variant === "verified" && "bg-green-50 text-green-700 border border-green-200",
        variant === "unverified" && "bg-orange-pale text-brown-muted border border-brown-border",
        variant === "variant" && "bg-cream text-brown-muted border border-brown-border",
        className
      )}
    >
      {children}
    </span>
  );
}
