"use client";

import { logGrowth } from "@/app/actions/growth";
import { QuickAction } from "@/app/components/QuickAction";
import { GrowthRecord } from "@/app/generated/prisma/client";
import { combineDateAndTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { ChevronDownIcon, Ruler } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface GrowthDialogProps {
  babyId: string;
}

export function GrowthDialog({ babyId }: GrowthDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <QuickAction
      label="Growth"
      icon={Ruler}
      open={open}
      onOpenChange={setOpen}
      description="Log growth measurements"
    >
      <GrowthForm babyId={babyId} onSuccess={() => setOpen(false)} />
    </QuickAction>
  );
}

interface GrowthFormProps {
  babyId: string;
  onSuccess?: () => void;
  initialData?: GrowthRecord;
}

export function GrowthForm({ babyId, onSuccess, initialData }: GrowthFormProps) {
  const [date, setDate] = useState<Date | undefined>(
    initialData ? new Date(initialData.recordedAt) : new Date(),
  );
  const [dateOpen, setDateOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    if (!date) {
      toast.warning("Please select a date");
      return;
    }

    const time = formData.get("time") as string;
    const dateTime = combineDateAndTime(date, time);

    const weightStr = formData.get("weight") as string;
    const heightStr = formData.get("height") as string;
    const headStr = formData.get("headCircumference") as string;
    const note = formData.get("note") as string;

    if (!weightStr && !heightStr && !headStr) {
      toast.warning("Please enter at least one measurement");
      return;
    }

    startTransition(async () => {
      try {
        await logGrowth({
          babyId,
          weight: weightStr ? parseFloat(weightStr) : undefined,
          height: heightStr ? parseFloat(heightStr) : undefined,
          headCircumference: headStr ? parseFloat(headStr) : undefined,
          note,
          recordedAt: dateTime,
        });
        toast.success(initialData ? "Growth record updated" : "Growth record saved");
        onSuccess?.();
      } catch (error) {
        toast.error("Failed to save record: " + error);
      }
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4 py-2">
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

      <div className="grid grid-cols-2 gap-4">
        <Field>
          <FieldLabel>Weight (kg)</FieldLabel>
          <Input
            type="number"
            name="weight"
            step="0.01"
            placeholder="3.50"
            defaultValue={initialData?.weight || ""}
          />
        </Field>
        <Field>
          <FieldLabel>Height (cm)</FieldLabel>
          <Input
            type="number"
            name="height"
            step="0.1"
            placeholder="50.0"
            defaultValue={initialData?.height || ""}
          />
        </Field>
      </div>

      <Field>
        <FieldLabel>Head Circumference (cm)</FieldLabel>
        <Input
          type="number"
          name="headCircumference"
          step="0.1"
          placeholder="35.0"
          defaultValue={initialData?.headCircumference || ""}
        />
      </Field>

      <Field>
        <FieldLabel>Note</FieldLabel>
        <Input 
          name="note" 
          placeholder="Optional notes" 
          defaultValue={initialData?.note || ""}
        />
      </Field>

      <Button type="submit" disabled={isPending} className="mt-2">
        {isPending ? "Saving..." : initialData ? "Update Record" : "Save Record"}
      </Button>
    </form>
  );
}
