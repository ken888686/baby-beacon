"use client";

import { deleteTimelineRecord } from "@/app/actions/timeline";
import {
  DiaperLog,
  FeedLog,
  GrowthRecord,
  HealthLog,
  SleepLog,
} from "@/app/generated/prisma/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import {
  Activity,
  Baby,
  Edit2,
  Milk,
  Moon,
  MoreVertical,
  Ruler,
  Thermometer,
  Trash2,
} from "lucide-react";
import { useOptimistic, useState, useTransition } from "react";
import { toast } from "sonner";
import { TimelineItem } from "../actions/timeline";
import { DiaperForm } from "./actions/DiaperDialog";
import { FeedForm } from "./actions/FeedDialog";
import { GrowthForm } from "./actions/GrowthDialog";
import { HealthForm } from "./actions/HealthDialog";
import { SleepForm } from "./actions/SleepDialog";

interface RecordListProps {
  records: TimelineItem[];
}

export function RecordList({ records }: RecordListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingRecord, setEditingRecord] = useState<TimelineItem | null>(null);
  const [isPending, startTransition] = useTransition();

  const [optimisticRecords, removeOptimisticRecord] = useOptimistic(
    records,
    (state, idToRemove: string) => state.filter((r) => r.id !== idToRemove),
  );

  const getIcon = (category: string) => {
    switch (category) {
      case "SLEEP":
        return Moon;
      case "FEED":
        return Milk;
      case "DIAPER":
        return Baby;
      case "HEALTH":
        return Thermometer;
      case "GROWTH":
        return Ruler;
      default:
        return Activity;
    }
  };

  const getIconColor = (category: string) => {
    switch (category) {
      case "SLEEP":
        return "bg-secondary/30 text-foreground/70";
      case "FEED":
        return "bg-primary/20 text-foreground/80";
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

  const handleDelete = () => {
    if (!deleteId) return;

    startTransition(async () => {
      try {
        removeOptimisticRecord(deleteId); // Optimistically remove the item
        await deleteTimelineRecord(
          deleteId,
          optimisticRecords.find((record) => record.id === deleteId)?.category,
        );
        toast.success("Record deleted successfully");
        setDeleteId(null);
      } catch (error) {
        toast.error("Failed to delete record");
        console.error(error);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between px-1">
        <div>
          <p className="text-primary text-xs font-bold tracking-widest uppercase">
            Timeline
          </p>
          <h3 className="text-foreground mt-1 text-xl font-bold">
            Latest activity
          </h3>
        </div>
        <span className="text-muted-foreground text-xs font-medium">
          {optimisticRecords.length} recent
        </span>
      </div>
      {optimisticRecords.length === 0 ? (
        <div className="border-border bg-card/70 rounded-3xl border border-dashed px-6 py-10 text-center">
          <p className="text-foreground font-semibold">No moments logged yet</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Your care timeline will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {optimisticRecords.map((record) => {
            const Icon = getIcon(record.category);
            const colorClass = getIconColor(record.category);

            return (
              <Card
                key={record.id}
                className="group bg-card shadow-soft-out rounded-3xl border border-white/80 transition-all duration-200 hover:-translate-y-0.5"
              >
                <CardContent className="flex items-center gap-3 p-4 pr-2">
                  <div className={`rounded-2xl p-2.5 ${colorClass}`}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground font-semibold">
                      {record.title}
                    </p>
                    <p className="text-muted-foreground truncate text-sm">
                      {record.details || "No additional details"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-xs font-medium whitespace-nowrap">
                      {formatDistanceToNow(record.recordedAt, {
                        addSuffix: true,
                      })}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        aria-label={`Actions for ${record.title}`}
                        className="focus:ring-ring data-[state=open]:bg-accent text-muted-foreground hover:text-foreground ml-1 rounded-full p-2 opacity-100 transition-colors focus:ring-2 focus:outline-none"
                      >
                        <MoreVertical className="h-4 w-4" aria-hidden="true" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setEditingRecord(record)}
                        >
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            setDeleteId(record.id);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog
        open={!!editingRecord}
        onOpenChange={(open) => !open && setEditingRecord(null)}
      >
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Edit {editingRecord?.title}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {editingRecord?.category === "FEED" && (
              <FeedForm
                babyId={(editingRecord.metadata as FeedLog).babyId}
                initialData={editingRecord.metadata as FeedLog}
                onSuccess={() => setEditingRecord(null)}
              />
            )}
            {editingRecord?.category === "SLEEP" && (
              <SleepForm
                babyId={(editingRecord.metadata as SleepLog).babyId}
                initialData={editingRecord.metadata as SleepLog}
                onSuccess={() => setEditingRecord(null)}
              />
            )}
            {editingRecord?.category === "DIAPER" && (
              <DiaperForm
                babyId={(editingRecord.metadata as DiaperLog).babyId}
                initialData={editingRecord.metadata as DiaperLog}
                onSuccess={() => setEditingRecord(null)}
              />
            )}
            {editingRecord?.category === "HEALTH" && (
              <HealthForm
                babyId={(editingRecord.metadata as HealthLog).babyId}
                type={(editingRecord.metadata as HealthLog).type}
                initialData={editingRecord.metadata as HealthLog}
                onSuccess={() => setEditingRecord(null)}
              />
            )}
            {editingRecord?.category === "GROWTH" && (
              <GrowthForm
                babyId={(editingRecord.metadata as GrowthRecord).babyId}
                initialData={editingRecord.metadata as GrowthRecord}
                onSuccess={() => setEditingRecord(null)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isPending}
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function RecordListLoader() {
  return (
    <div className="space-y-4">
      <div className="space-y-2 px-1">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-6 w-40" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-21 w-full rounded-3xl" />
        ))}
      </div>
    </div>
  );
}
