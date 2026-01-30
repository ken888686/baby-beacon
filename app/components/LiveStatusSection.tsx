"use client";

import { getBabyStats } from "@/app/actions/baby";
import type { FeedLog, SleepLog } from "@/app/generated/prisma/client";
import { FeedType } from "@/app/generated/prisma/enums";
import { formatDistanceToNow } from "date-fns";
import { Milk, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { StatusCard } from "./StatusCard";

interface Stats {
  lastSleep: SleepLog | null;
  lastFeed: FeedLog | null;
}

interface LiveStatusSectionProps {
  babyId?: string;
  initialStats: Stats;
}

export function LiveStatusSection({
  babyId,
  initialStats,
}: LiveStatusSectionProps) {
  const [stats, setStats] = useState<Stats>(initialStats);
  const [, setTick] = useState(0);

  useEffect(() => {
    setStats(initialStats);
  }, [initialStats]);

  useEffect(() => {
    if (!babyId) return;

    const fetchStats = async () => {
      try {
        const newStats = await getBabyStats(babyId);
        setStats(newStats);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };

    const interval = setInterval(() => {
      fetchStats();
      setTick((t) => t + 1);
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, [babyId]);

  const { value: sleepValue, subValue: sleepSubValue } = getSleepStatus(
    stats.lastSleep,
  );
  const { value: feedValue, subValue: feedSubValue } = getFeedStatus(
    stats.lastFeed,
  );

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <StatusCard
          title="Last Sleep"
          value={sleepValue}
          subValue={sleepSubValue}
          icon={Moon}
          className="border-slate-200 bg-slate-50/50 text-slate-700"
        />
        <StatusCard
          title="Last Feed"
          value={feedValue}
          subValue={feedSubValue}
          icon={Milk}
          className="border-amber-200 bg-amber-50/50 text-amber-800"
        />
      </div>
    </section>
  );
}

function getSleepStatus(lastSleep: SleepLog | null) {
  if (!lastSleep) {
    return { value: "--", subValue: "No records" };
  }

  if (!lastSleep.endTime) {
    return {
      value: "Sleeping...",
      subValue: `Started ${formatDistanceToNow(new Date(lastSleep.startTime), { addSuffix: true })}`,
    };
  }

  const startTime = new Date(lastSleep.startTime);
  const endTime = new Date(lastSleep.endTime);
  const durationMs = endTime.getTime() - startTime.getTime();
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

  return {
    value: `${hours > 0 ? `${hours}h ` : ""}${minutes}m`,
    subValue: `Woke up ${formatDistanceToNow(endTime, { addSuffix: true })}`,
  };
}

function getFeedStatus(lastFeed: FeedLog | null) {
  if (!lastFeed) {
    return { value: "--", subValue: "No records" };
  }

  let value = "--";
  if (lastFeed.type === FeedType.BREAST) {
    value = `${Math.round((lastFeed.duration || 0) / 60)}m`;
  } else if (lastFeed.type === FeedType.SOLID) {
    value = "Solid";
  } else {
    value = `${lastFeed.amount || 0}ml`;
  }

  return {
    value,
    subValue: `${formatDistanceToNow(new Date(lastFeed.recordedAt), { addSuffix: true })}`,
  };
}
