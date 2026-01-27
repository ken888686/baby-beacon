import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Activity, Baby, Milk, Moon, Ruler, Thermometer } from "lucide-react";
import { TimelineItem } from "../actions/timeline";

interface RecordListProps {
  records: TimelineItem[];
}

export function RecordList({ records }: RecordListProps) {
  if (records.length === 0) {
    return (
      <div className="py-10 text-center opacity-60">
        <p>No recent records</p>
      </div>
    );
  }

  const getIcon = (category: string) => {
    switch (category) {
      case "SLEEP":
        return Moon;
      case "FEED":
        return Milk;
      case "DIAPER":
        return Baby;
      case "HEALTH":
        return Thermometer; // 或 Syringe 視情況而定
      case "GROWTH":
        return Ruler;
      default:
        return Activity;
    }
  };

  const getIconColor = (category: string) => {
    switch (category) {
      case "SLEEP":
        return "bg-slate-100 text-slate-600";
      case "FEED":
        return "bg-amber-100 text-amber-700";
      case "DIAPER":
        return "bg-emerald-100 text-emerald-600";
      case "HEALTH":
        return "bg-rose-100 text-rose-600";
      case "GROWTH":
        return "bg-sky-100 text-sky-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="px-1 text-lg font-bold">Recent Activity</h3>
      <div className="space-y-3">
        {records.map((record) => {
          const Icon = getIcon(record.category);
          const colorClass = getIconColor(record.category);

          return (
            <Card
              key={record.id}
              className="border-secondary/30 hover:bg-secondary/5 shadow-sm transition-colors"
            >
              <CardContent className="flex items-center gap-4 p-4">
                <div className={`rounded-full p-2.5 ${colorClass}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-foreground font-semibold">
                    {record.title}
                  </p>
                  <p className="text-sm opacity-70">{record.details}</p>
                </div>
                <span className="text-xs font-medium whitespace-nowrap opacity-50">
                  {formatDistanceToNow(record.recordedAt, { addSuffix: true })}
                </span>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
