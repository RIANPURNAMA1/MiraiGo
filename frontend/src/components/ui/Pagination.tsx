export function Pagination({
  currentPage,
  lastPage,
  onChange,
}: {
  currentPage: number;
  lastPage: number;
  onChange: (page: number) => void;
}) {
  if (lastPage <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 pt-2">
      <button
        onClick={() => onChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="rounded-md border border-gray-200 px-3 py-1.5 text-sm disabled:opacity-40"
      >
        Prev
      </button>
      <span className="text-sm text-gray-600">
        {currentPage} / {lastPage}
      </span>
      <button
        onClick={() => onChange(currentPage + 1)}
        disabled={currentPage >= lastPage}
        className="rounded-md border border-gray-200 px-3 py-1.5 text-sm disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}
