export default function HomeLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-20 bg-surface-2 rounded-lg" />
          <div className="h-4 w-36 bg-surface-2 rounded-lg" />
        </div>
        <div className="h-9 w-9 bg-surface-2 rounded-xl" />
      </div>
      {/* Score ring card */}
      <div className="card h-48 bg-surface-2" />
      {/* Goal cards */}
      <div className="card h-28 bg-surface-2" />
      <div className="card h-28 bg-surface-2" />
      <div className="card h-28 bg-surface-2" />
    </div>
  );
}
