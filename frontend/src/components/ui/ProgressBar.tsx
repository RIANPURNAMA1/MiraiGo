export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div>
      {label && (
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="text-gray-600">{label}</span>
          <span className="font-medium text-gray-900">{clamped}%</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-brand-600 transition-all"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
