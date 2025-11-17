// app/ui/src/components/LoteCardSkeleton.tsx
export default function LoteCardSkeleton() {
  return (
    <div 
      className="flex flex-col gap-4 rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm animate-pulse"
      role="status"
      aria-label="Carregando lote"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-1 flex-col gap-2">
          <div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="h-6 w-full bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="h-4 w-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
        <div className="h-20 w-20 flex-shrink-0 rounded-lg bg-gray-300 dark:bg-gray-600"></div>
      </div>
    </div>
  );
}
