import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatusCardProps {
  title: string;
  value: string;
  subValue?: string;
  icon: LucideIcon;
  className?: string;
}

export function StatusCard({ title, value, subValue, icon: Icon, className }: StatusCardProps) {
  return (
    <Card className={cn("border shadow-sm transition-all active:scale-[0.98]", className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <span className="text-sm font-semibold uppercase tracking-wider opacity-70">{title}</span>
          <div className="p-2 bg-white/60 rounded-xl">
            <Icon className="w-5 h-5" />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold leading-tight">{value}</h3>
          {subValue && <p className="text-sm opacity-60 mt-1 font-medium">{subValue}</p>}
        </div>
      </CardContent>
    </Card>
  );
}