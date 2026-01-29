"use client";

import { endSleep, logSleep, startSleep } from "@/app/actions/sleep";
import { QuickAction } from "@/app/components/QuickAction";
import { SleepLog } from "@/app/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, parse } from "date-fns";
import { ChevronDownIcon, Moon, Play, StopCircle } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface SleepDialogProps {
  babyId: string;
  lastSleep: SleepLog | null;
}

interface SleepFormProps {
  babyId: string;
  onSuccess?: () => void;
}

export function SleepDialog({ babyId, lastSleep }: SleepDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isSleeping = lastSleep && !lastSleep.endTime;

  const handleToggleSleep = () => {
    startTransition(async () => {
      try {
        if (isSleeping) {
          await endSleep(babyId);
          toast.success("Sleep ended");
        } else {
          await startSleep(babyId);
          toast.success("Sleep started");
        }
        setOpen(false);
      } catch (error) {
        toast.error("Failed to update sleep status: " + error);
      }
    });
  };

  return (
    <QuickAction
      label="Sleep"
      icon={Moon}
      open={open}
      onOpenChange={setOpen}
      description={
        isSleeping ? "Baby is currently sleeping" : "Start a new sleep session"
      }
    >
      <Tabs defaultValue="quick" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="quick">Quick</TabsTrigger>
          <TabsTrigger value="manual">Manual</TabsTrigger>
        </TabsList>
        <TabsContent value="quick" className="py-4">
          <Button
            onClick={handleToggleSleep}
            disabled={isPending}
            size="lg"
            className={
              isSleeping
                ? "w-full bg-amber-500 hover:bg-amber-600"
                : "w-full bg-indigo-500 hover:bg-indigo-600"
            }
          >
            {isSleeping ? (
              <>
                <StopCircle className="mr-2 h-5 w-5" />
                Wake Up
              </>
            ) : (
              <>
                <Play className="mr-2 h-5 w-5" />
                Start Sleep
              </>
            )}
          </Button>
        </TabsContent>
        <TabsContent value="manual" className="py-4">
          <SleepForm babyId={babyId} onSuccess={() => setOpen(false)} />
        </TabsContent>
      </Tabs>
    </QuickAction>
  );
}

export function SleepForm({ babyId, onSuccess }: SleepFormProps) {
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [isPending, startTransition] = useTransition();

  async function handleLogSleep(formData: FormData) {
    if (!startDate || !endDate) {
      toast.warning("Please select a start and end date");
      return;
    }
    const startTime = formData.get("startTime") as string;
    const endTime = formData.get("endTime") as string;
    const startDateTime = parse(
      `${startDate.getFullYear()}-${startDate.getMonth() + 1}-${startDate.getDate()}T${startTime}`,
      "yyyy-M-d'T'HH:mm:ss",
      new Date(),
    );
    const endDateTime = parse(
      `${endDate.getFullYear()}-${endDate.getMonth() + 1}-${endDate.getDate()}T${endTime}`,
      "yyyy-M-d'T'HH:mm:ss",
      new Date(),
    );

    const note = formData.get("note") as string | undefined;

    startTransition(async () => {
      try {
        await logSleep(babyId, {
          startTime: startDateTime,
          endTime: endDateTime,
          quality: note,
        });
        toast.success("Sleep logged manually");
        onSuccess?.();
      } catch (error) {
        toast.error("Failed to log sleep: " + error);
      }
    });
  }

  return (
    <form action={handleLogSleep} className="flex flex-col gap-4">
      <FieldGroup className="flex flex-row items-center gap-4">
        <FieldLabel className="w-12">Start</FieldLabel>
        <div className="flex flex-1 gap-2">
          <Field className="flex-1">
            <Popover open={startOpen} onOpenChange={setStartOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="startDate"
                  className="w-full justify-between font-normal"
                >
                  {startDate ? format(startDate, "PP") : "Select date"}
                  <ChevronDownIcon className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => {
                    setStartDate(date);
                    setStartOpen(false);
                  }}
                  autoFocus
                />
              </PopoverContent>
            </Popover>
          </Field>
          <Field className="w-28">
            <Input
              type="time"
              id="startTime"
              name="startTime"
              step="1"
              defaultValue={format(new Date(), "HH:mm:ss")}
            />
          </Field>
        </div>
      </FieldGroup>

      <FieldGroup className="flex flex-row items-center gap-4">
        <FieldLabel className="w-12">End</FieldLabel>
        <div className="flex flex-1 gap-2">
          <Field className="flex-1">
            <Popover open={endOpen} onOpenChange={setEndOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="endDate"
                  className="w-full justify-between font-normal"
                >
                  {endDate ? format(endDate, "PP") : "Select date"}
                  <ChevronDownIcon className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => {
                    setEndDate(date);
                    setEndOpen(false);
                  }}
                  autoFocus
                />
              </PopoverContent>
            </Popover>
          </Field>
          <Field className="w-28">
            <Input
              type="time"
              id="endTime"
              name="endTime"
              step="1"
              defaultValue={format(
                new Date().setHours(new Date().getHours() + 1),
                "HH:mm:ss",
              )}
            />
          </Field>
        </div>
      </FieldGroup>
      <Field>
        <FieldLabel>Note</FieldLabel>
        <Input name="note" placeholder="Enter text" />
      </Field>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Save Record"}
      </Button>
    </form>
  );
}
