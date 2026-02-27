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
        "h-56 border-none shadow-soft-out transition-all active:scale-[0.98] rounded-2xl",
        className,
      )}
    >
      <CardContent className="p-5">
        <div className="mb-3 flex items-start justify-between">
          <span className="text-[10px] font-bold tracking-[0.1em] uppercase opacity-50">
            {title}
          </span>
          <div className="rounded-xl bg-white/40 p-2 shadow-soft-in">
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="flex flex-col justify-end h-28">
          <h3 className="text-2xl leading-tight font-bold tracking-tight">{value}</h3>
          {subValue && (
            <p className="mt-1 text-xs font-medium opacity-60 leading-relaxed">{subValue}</p>
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
          <Skeleton key={i} className="h-56 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
