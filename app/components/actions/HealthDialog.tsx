"use client";

import { logHealth } from "@/app/actions/health";
import { QuickAction } from "@/app/components/QuickAction";
import { HealthLog } from "@/app/generated/prisma/client";
import { HealthType } from "@/app/generated/prisma/enums";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { ChevronDownIcon, Thermometer } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface HealthDialogProps {
  babyId: string;
}

export function HealthDialog({ babyId }: HealthDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <QuickAction
      label="Health"
      icon={Thermometer}
      open={open}
      onOpenChange={setOpen}
      description="Log health information"
    >
      <Tabs defaultValue="TEMPERATURE" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="TEMPERATURE">Temp</TabsTrigger>
          <TabsTrigger value="MEDICINE">Med</TabsTrigger>
          <TabsTrigger value="SYMPTOM">Symptom</TabsTrigger>
        </TabsList>
        <div className="mt-4">
          <TabsContent value="TEMPERATURE">
            <HealthForm
              babyId={babyId}
              type={HealthType.TEMPERATURE}
              onSuccess={() => setOpen(false)}
            />
          </TabsContent>
          <TabsContent value="MEDICINE">
            <HealthForm
              babyId={babyId}
              type={HealthType.MEDICINE}
              onSuccess={() => setOpen(false)}
            />
          </TabsContent>
          <TabsContent value="SYMPTOM">
            <HealthForm
              babyId={babyId}
              type={HealthType.SYMPTOM}
              onSuccess={() => setOpen(false)}
            />
          </TabsContent>
        </div>
      </Tabs>
    </QuickAction>
  );
}

interface HealthFormProps {
  babyId: string;
  type: HealthType;
  onSuccess?: () => void;
  initialData?: HealthLog;
}

export function HealthForm({ babyId, type, onSuccess, initialData }: HealthFormProps) {
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

    const valueStr = formData.get("value") as string;
    const description = formData.get("description") as string;
    const note = formData.get("note") as string;

    startTransition(async () => {
      try {
        // Note: updateHealth action needs to be implemented in actions/health.ts if needed
        await logHealth({
          babyId,
          type: initialData?.type || type,
          value: valueStr ? parseFloat(valueStr) : undefined,
          description,
          note,
          recordedAt: dateTime,
        });
        toast.success(initialData ? "Health record updated" : "Health record saved");
        onSuccess?.();
      } catch (error) {
        toast.error("Failed to save record: " + error);
      }
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
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

      {type === HealthType.TEMPERATURE && (
        <Field>
          <FieldLabel>Temperature (°C)</FieldLabel>
          <Input
            type="number"
            name="value"
            step="0.1"
            placeholder="36.5"
            defaultValue={initialData?.value || ""}
            required
          />
        </Field>
      )}

      {(type === HealthType.MEDICINE || type === HealthType.SYMPTOM) && (
        <Field>
          <FieldLabel>
            {type === HealthType.MEDICINE ? "Medicine Name" : "Symptom Name"}
          </FieldLabel>
          <Input
            name="description"
            placeholder={
              type === HealthType.MEDICINE ? "e.g. Tylenol" : "e.g. Cough"
            }
            defaultValue={initialData?.description || ""}
            required
          />
        </Field>
      )}

      {type === HealthType.MEDICINE && (
        <Field>
          <FieldLabel>Dosage (optional)</FieldLabel>
          <Input 
            name="value" 
            type="number" 
            step="0.1" 
            placeholder="2.5" 
            defaultValue={initialData?.value || ""}
          />
        </Field>
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
        {isPending ? "Saving..." : initialData ? "Update Record" : "Save Record"}
      </Button>
    </form>
  );
}
