import { Skeleton } from "./ui/skeleton";

export const ProductItemsSkeleton = () => {
  return (
    <div className="grid gap-2">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center space-x-4 border border-accent rounded-md p-2"
          style={{ opacity: `${1 - index / 10}` }}
        >
          <div className="shrink-0">
            <Skeleton className="h-12 w-12 rounded" />
          </div>

          <div className="space-y-2 flex-grow">
            <Skeleton className="h-4 w-96" />
            <Skeleton className="h-3 w-70" />
          </div>

          <div className="flex shrink-0 gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
};
