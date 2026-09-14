import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatusCardProps {
  title: string;
  value: string;
  subValue?: string;
  icon: LucideIcon;
  className?: string;
}

export function StatusCard({
  title,
  value,
  subValue,
  icon: Icon,
  className,
}: StatusCardProps) {
  return (
    <Card
      className={cn(
        "bg-card shadow-soft-out min-h-40 rounded-3xl border border-white/80 transition-transform duration-200 active:scale-[0.98]",
        className,
      )}
    >
      <CardContent className="flex h-full flex-col p-5">
        <div className="flex items-start justify-between">
          <span className="text-muted-foreground text-xs font-bold tracking-[0.08em] uppercase">
            {title}
          </span>
          <div className="bg-primary/10 text-primary rounded-2xl p-2.5">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>
        <div className="mt-auto">
          <h3 className="text-foreground text-2xl leading-tight font-bold tracking-tight tabular-nums">
            {value}
          </h3>
          {subValue && (
            <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
              {subValue}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function StatusCardLoader() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-3xl" />
        ))}
      </div>
    </div>
  );
}
