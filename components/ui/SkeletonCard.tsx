export default function SkeletonCard() {
  return (
    <div className="bg-cream-surface rounded-3xl border border-brown-border shadow-md p-5 space-y-3 overflow-hidden">
      <div className="skeleton h-40 rounded-2xl" />
      <div className="skeleton h-5 w-3/4 rounded-full" />
      <div className="skeleton h-4 w-1/2 rounded-full" />
      <div className="flex gap-2 mt-2">
        <div className="skeleton h-6 w-20 rounded-full" />
        <div className="skeleton h-6 w-16 rounded-full" />
      </div>
    </div>
  );
}
