interface EmptyStateProps {
  emoji?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ emoji = "☕", title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-6xl mb-4 animate-bounce">{emoji}</div>
      <h3 className="font-playfair text-xl font-semibold text-espresso mb-2">{title}</h3>
      {description && <p className="text-brown-muted text-sm max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
