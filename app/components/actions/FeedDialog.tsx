"use client";

import { logFeed, updateFeed } from "@/app/actions/feed";
import { QuickAction } from "@/app/components/QuickAction";
import { FeedLog } from "@/app/generated/prisma/client";
import { FeedType, Side } from "@/app/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, parse } from "date-fns";
import { ChevronDownIcon, Milk } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface FeedDialogProps {
  babyId: string;
}

interface FeedFormProps {
  babyId: string;
  defaultType?: FeedType;
  onSuccess?: () => void;
  initialData?: FeedLog;
}

export function FeedDialog({ babyId }: FeedDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <QuickAction
      label="Feed"
      icon={Milk}
      open={open}
      onOpenChange={setOpen}
      description="Log a feeding session"
    >
      <Tabs defaultValue="bottle" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="bottle">Bottle</TabsTrigger>
          <TabsTrigger value="breast">Breast</TabsTrigger>
          <TabsTrigger value="solid">Solid</TabsTrigger>
        </TabsList>
        <TabsContent value="bottle" className="py-4">
          <FeedForm
            babyId={babyId}
            defaultType={FeedType.BOTTLE_FORMULA}
            onSuccess={() => setOpen(false)}
          />
        </TabsContent>
        <TabsContent value="breast" className="py-4">
          <FeedForm
            babyId={babyId}
            defaultType={FeedType.BREAST}
            onSuccess={() => setOpen(false)}
          />
        </TabsContent>
        <TabsContent value="solid" className="py-4">
          <FeedForm
            babyId={babyId}
            defaultType={FeedType.SOLID}
            onSuccess={() => setOpen(false)}
          />
        </TabsContent>
      </Tabs>
    </QuickAction>
  );
}

export function FeedForm({
  babyId,
  defaultType,
  onSuccess,
  initialData,
}: FeedFormProps) {
  const [date, setDate] = useState<Date | undefined>(
    initialData ? new Date(initialData.recordedAt) : new Date(),
  );
  const [dateOpen, setDateOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState<FeedType>(
    initialData?.type || defaultType || FeedType.BOTTLE_FORMULA,
  );

  async function handleLogFeed(formData: FormData) {
    if (!date) {
      toast.warning("Please select a date");
      return;
    }

    const time = formData.get("time") as string;
    const dateTime = parse(
      `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}T${time}`,
      "yyyy-M-d'T'HH:mm:ss",
      new Date(),
    );

    const amountStr = formData.get("amount") as string;
    const durationStr = formData.get("duration") as string;
    const note = formData.get("note") as string | undefined;
    const side = formData.get("side") as Side | undefined;
    const selectedType = (formData.get("type") as FeedType) || type;

    const amount = amountStr ? parseFloat(amountStr) : undefined;
    const duration = durationStr ? parseInt(durationStr) : undefined;

    startTransition(async () => {
      try {
        if (initialData) {
          await updateFeed(initialData.id, {
            type: selectedType,
            amount,
            duration,
            side,
            note,
            recordedAt: dateTime,
          });
          toast.success("Feed updated successfully");
        } else {
          await logFeed({
            babyId,
            type: selectedType,
            amount,
            duration,
            side,
            note,
            recordedAt: dateTime,
          });
          toast.success("Feed logged successfully");
        }
        onSuccess?.();
      } catch (error) {
        toast.error("Failed to save feed: " + error);
      }
    });
  }

  const isBottle =
    type === FeedType.BOTTLE_FORMULA || type === FeedType.BOTTLE_BREAST_MILK;
  const isBreast = type === FeedType.BREAST;

  return (
    <form action={handleLogFeed} className="flex flex-col gap-4">
      {/* Type Selection (Visible only for Bottle to switch between Formula/Milk) */}
      {isBottle && (
        <Field>
          <FieldLabel>Liquid Type</FieldLabel>
          <Select
            name="type"
            defaultValue={type}
            onValueChange={(val) => setType(val as FeedType)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={FeedType.BOTTLE_FORMULA}>Formula</SelectItem>
              <SelectItem value={FeedType.BOTTLE_BREAST_MILK}>
                Breast Milk
              </SelectItem>
            </SelectContent>
          </Select>
        </Field>
      )}

      {/* Date & Time */}
      <FieldGroup className="flex flex-row items-center gap-4">
        <FieldLabel className="w-12">Time</FieldLabel>
        <div className="flex flex-1 gap-2">
          <Field className="flex-1">
            <Popover open={dateOpen} onOpenChange={setDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between font-normal"
                >
                  {date ? format(date, "PP") : "Select date"}
                  <ChevronDownIcon className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => {
                    setDate(d);
                    setDateOpen(false);
                  }}
                  autoFocus
                />
              </PopoverContent>
            </Popover>
          </Field>
          <Field className="w-28">
            <Input
              type="time"
              name="time"
              step="1"
              defaultValue={format(
                initialData ? new Date(initialData.recordedAt) : new Date(),
                "HH:mm:ss",
              )}
            />
          </Field>
        </div>
      </FieldGroup>

      {/* Amount (Bottle & Solid) */}
      {(isBottle || type === FeedType.SOLID) && (
        <Field>
          <FieldLabel>
            Amount ({type === FeedType.SOLID ? "g" : "ml"})
          </FieldLabel>
          <Input
            type="number"
            name="amount"
            placeholder={type === FeedType.SOLID ? "100" : "150"}
            step="0.5"
            defaultValue={initialData?.amount || ""}
          />
        </Field>
      )}

      {/* Breast Specific Fields */}
      {isBreast && (
        <>
          <Field>
            <FieldLabel>Side</FieldLabel>
            <Select name="side" defaultValue={initialData?.side || Side.BOTH}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Side.LEFT}>Left</SelectItem>
                <SelectItem value={Side.RIGHT}>Right</SelectItem>
                <SelectItem value={Side.BOTH}>Both</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel>Duration (minutes)</FieldLabel>
            <Input
              type="number"
              name="duration"
              placeholder="15"
              defaultValue={initialData?.duration || ""}
            />
          </Field>
        </>
      )}

      <Field>
        <FieldLabel>Note</FieldLabel>
        <Input
          name="note"
          placeholder="Optional notes"
          defaultValue={initialData?.note || ""}
        />
      </Field>

      <Button type="submit" disabled={isPending}>
        {isPending
          ? "Saving..."
          : initialData
            ? "Update Record"
            : "Save Record"}
      </Button>
    </form>
  );
}
