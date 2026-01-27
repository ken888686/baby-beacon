import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Activity, Baby, Milk, Moon, Ruler, Thermometer } from "lucide-react";
import {
  DiaperLog,
  FeedLog,
  GrowthRecord,
  HealthLog,
  SleepLog,
} from "../generated/prisma/client";

// 定義前端顯示用的通用紀錄型別
// 這裡將 Prisma 的多個 Model 整合為一個 UI 介面
export type TimelineRecord = {
  id: string;
  category: "SLEEP" | "FEED" | "DIAPER" | "HEALTH" | "GROWTH";
  title: string; // 主標題 (e.g. "Breast Feed", "Sleep")
  details: string; // 詳細資訊 (e.g. "Left side, 15m", "36.6°C")
  recordedAt: Date;
  metadata?: SleepLog | FeedLog | DiaperLog | HealthLog | GrowthRecord; // 保留原始資料供進階顯示
};

interface RecordListProps {
  records: TimelineRecord[];
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
        return "bg-indigo-100 text-indigo-600";
      case "FEED":
        return "bg-orange-100 text-orange-600";
      case "DIAPER":
        return "bg-teal-100 text-teal-600";
      case "HEALTH":
        return "bg-red-100 text-red-600";
      case "GROWTH":
        return "bg-blue-100 text-blue-600";
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
