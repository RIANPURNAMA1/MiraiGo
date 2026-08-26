export function LoadingState({ label = 'Memuat...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      <p className="mt-3 text-sm text-gray-500">{label}</p>
    </div>
  );
}
