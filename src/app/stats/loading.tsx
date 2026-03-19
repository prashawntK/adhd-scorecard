export default function StatsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-20 bg-surface-2 rounded-lg" />
          <div className="h-4 w-48 bg-surface-2 rounded-lg" />
        </div>
        <div className="h-9 w-32 bg-surface-2 rounded-xl" />
      </div>
      {/* Overview cards */}
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card h-20 bg-surface-2" />
        ))}
      </div>
      {/* Charts */}
      <div className="card h-52 bg-surface-2" />
      <div className="card h-52 bg-surface-2" />
      <div className="card h-36 bg-surface-2" />
    </div>
  );
}
