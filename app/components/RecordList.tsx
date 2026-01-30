"use client";

import { deleteTimelineRecord } from "@/app/actions/timeline";
import { FeedLog, SleepLog } from "@/app/generated/prisma/client";
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
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { TimelineItem } from "../actions/timeline";
import { FeedForm } from "./actions/FeedDialog";
import { SleepForm } from "./actions/SleepDialog";

type Category = "SLEEP" | "FEED" | "DIAPER" | "HEALTH" | "GROWTH";

interface RecordListProps {
  records: TimelineItem[];
}

export function RecordList({ records }: RecordListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);
  const [editingRecord, setEditingRecord] = useState<TimelineItem | null>(null);
  const [isPending, startTransition] = useTransition();

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

  const handleDelete = () => {
    if (!deleteId || !deleteCategory) return;

    startTransition(async () => {
      try {
        await deleteTimelineRecord(deleteId, deleteCategory);
        toast.success("Record deleted successfully");
        setDeleteId(null);
        setDeleteCategory(null);
      } catch (error) {
        toast.error("Failed to delete record");
        console.error(error);
      }
    });
  };

  return (
    <div className="space-y-3">
      <h3 className="px-1 text-lg font-bold">Recent Activity</h3>
      {records.length === 0 ? (
        <div className="py-10 text-center opacity-60">
          <p>No recent records</p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((record) => {
            const Icon = getIcon(record.category);
            const colorClass = getIconColor(record.category);

            return (
              <Card
                key={record.id}
                className="group border-secondary/30 hover:bg-secondary/5 animate-fade-in shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
              >
                <CardContent className="flex items-center gap-4 p-4 pr-2">
                  <div className={`rounded-full p-2.5 ${colorClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground font-semibold">
                      {record.title}
                    </p>
                    <p className="text-sm opacity-70">{record.details}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium whitespace-nowrap opacity-50">
                      {formatDistanceToNow(record.recordedAt, {
                        addSuffix: true,
                      })}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="focus:ring-ring data-[state=open]:bg-accent text-muted-foreground hover:text-foreground ml-1 rounded-full p-1 opacity-0 transition-opacity group-hover:opacity-100 focus:ring-2 focus:outline-none">
                        <MoreVertical className="h-4 w-4" />
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
                            setDeleteCategory(record.category);
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
        <DialogContent className="sm:max-w-[425px]">
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
            {editingRecord &&
              !["FEED", "SLEEP"].includes(editingRecord.category) && (
                <p className="py-4 text-center text-sm opacity-60">
                  Editing for {editingRecord.category} is not implemented yet.
                </p>
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
    <div className="space-y-3">
      <h3 className="px-1 text-lg font-bold">Recent Activity</h3>
      <div className="space-y-4">
        <Skeleton className="h-[200px] w-full rounded-2xl" />
      </div>
    </div>
  );
}
