import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Activity, Ruler, Thermometer } from "lucide-react";

type HealthRecord = {
  id: string;
  type: "Temperature" | "Growth" | "Symptom";
  value: string;
  recordedAt: Date;
};

interface RecordListProps {
  records: HealthRecord[];
}

export function RecordList({ records }: RecordListProps) {
  if (records.length === 0) {
    return (
      <div className="py-10 text-center opacity-60">
        <p>No recent records</p>
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "Temperature":
        return Thermometer;
      case "Growth":
        return Ruler;
      default:
        return Activity;
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="px-1 text-lg font-bold">Recent Activity</h3>
      <div className="space-y-3">
        {records.map((record) => {
          const Icon = getIcon(record.type);
          return (
            <Card key={record.id} className="border-secondary/30 shadow-sm">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="bg-secondary/30 text-foreground rounded-full p-2">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{record.type}</p>
                  <p className="text-sm opacity-70">{record.value}</p>
                </div>
                <span className="text-xs font-medium opacity-50">
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
