import { format, startOfWeek, endOfWeek } from "date-fns";

export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export function getWeekRange() {
  const now = new Date();
  const start = startOfWeek(now, { weekStartsOn: 0 }); // Sunday
  const end = endOfWeek(now, { weekStartsOn: 0 });
  return { start: start.toISOString(), end: end.toISOString() };
}

export function formatDate(date: string) {
  return format(new Date(date), "MMM d, yyyy");
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
  }).format(price);
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
