import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface SkeletonLoaderProps {
  type?: "message" | "conversation" | "card";
  count?: number;
}

const SkeletonLoader = ({ type = "card", count = 1 }: SkeletonLoaderProps) => {
  if (type === "message") {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-start gap-4 rounded-lg border bg-card p-4 animate-pulse">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-full" />
            </div>
            <Skeleton className="h-8 w-8" />
          </div>
        ))}
      </div>
    );
  }

  if (type === "conversation") {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'} animate-pulse`}>
            <div className="max-w-[80%] space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-20 w-64 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Card className="animate-pulse">
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-5/6" />
      </CardContent>
    </Card>
  );
};

export default SkeletonLoader;
