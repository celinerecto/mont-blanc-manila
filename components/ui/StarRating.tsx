"use client";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export default function StarRating({
  rating,
  max = 5,
  size = "md",
  interactive = false,
  onChange,
}: StarRatingProps) {
  const sizeClass = { sm: "text-sm", md: "text-base", lg: "text-xl" }[size];

  return (
    <div className={`flex gap-0.5 ${sizeClass}`}>
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type={interactive ? "button" : undefined}
          onClick={interactive ? () => onChange?.(star) : undefined}
          className={`${interactive ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"} leading-none`}
          aria-label={interactive ? `Rate ${star} star${star !== 1 ? "s" : ""}` : undefined}
        >
          <span className={star <= rating ? "star-filled" : "star-empty"}>★</span>
        </button>
      ))}
    </div>
  );
}
