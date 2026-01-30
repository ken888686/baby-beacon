"use client";

import { logDiaper, updateDiaper } from "@/app/actions/diaper";
import { QuickAction } from "@/app/components/QuickAction";
import { DiaperLog } from "@/app/generated/prisma/client";
import { DiaperType } from "@/app/generated/prisma/enums";
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
import { Baby, ChevronDownIcon } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface DiaperDialogProps {
  babyId: string;
}

interface DiaperFormProps {
  babyId: string;
  defaultType?: DiaperType;
  onSuccess?: () => void;
  initialData?: DiaperLog;
}

export function DiaperDialog({ babyId }: DiaperDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <QuickAction
      label="Diaper"
      icon={Baby}
      open={open}
      onOpenChange={setOpen}
      description="Log a diaper change"
    >
      <Tabs defaultValue="wet" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="wet">Wet</TabsTrigger>
          <TabsTrigger value="dirty">Dirty</TabsTrigger>
          <TabsTrigger value="mixed">Mixed</TabsTrigger>
          <TabsTrigger value="dry">Dry</TabsTrigger>
        </TabsList>
        <TabsContent value="wet" className="py-4">
          <DiaperForm
            babyId={babyId}
            defaultType={DiaperType.WET}
            onSuccess={() => setOpen(false)}
          />
        </TabsContent>
        <TabsContent value="dirty" className="py-4">
          <DiaperForm
            babyId={babyId}
            defaultType={DiaperType.DIRTY}
            onSuccess={() => setOpen(false)}
          />
        </TabsContent>
        <TabsContent value="mixed" className="py-4">
          <DiaperForm
            babyId={babyId}
            defaultType={DiaperType.MIXED}
            onSuccess={() => setOpen(false)}
          />
        </TabsContent>
        <TabsContent value="dry" className="py-4">
          <DiaperForm
            babyId={babyId}
            defaultType={DiaperType.DRY}
            onSuccess={() => setOpen(false)}
          />
        </TabsContent>
      </Tabs>
    </QuickAction>
  );
}

export function DiaperForm({
  babyId,
  defaultType,
  onSuccess,
  initialData,
}: DiaperFormProps) {
  const [date, setDate] = useState<Date | undefined>(
    initialData ? new Date(initialData.recordedAt) : new Date(),
  );
  const [dateOpen, setDateOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState<DiaperType>(
    initialData?.type || defaultType || DiaperType.WET,
  );

  async function handleLogDiaper(formData: FormData) {
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

    const color = formData.get("color") as string | undefined;
    const texture = formData.get("texture") as string | undefined;
    const note = formData.get("note") as string | undefined;
    const selectedType = (formData.get("type") as DiaperType) || type;

    startTransition(async () => {
      try {
        if (initialData) {
          await updateDiaper(initialData.id, {
            type: selectedType,
            color,
            texture,
            note,
            recordedAt: dateTime,
          });
          toast.success("Diaper record updated");
        } else {
          await logDiaper({
            babyId,
            type: selectedType,
            color,
            texture,
            note,
            recordedAt: dateTime,
          });
          toast.success("Diaper logged successfully");
        }
        onSuccess?.();
      } catch (error) {
        toast.error("Failed to save diaper record: " + error);
      }
    });
  }

  const showDetails = type === DiaperType.DIRTY || type === DiaperType.MIXED;

  return (
    <form action={handleLogDiaper} className="flex flex-col gap-4">
      {/* Type Selection - Useful when in Edit mode or generic form */}
      {initialData && (
        <Field>
          <FieldLabel>Type</FieldLabel>
          <Select
            name="type"
            defaultValue={type}
            onValueChange={(val) => setType(val as DiaperType)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={DiaperType.WET}>Wet</SelectItem>
              <SelectItem value={DiaperType.DIRTY}>Dirty</SelectItem>
              <SelectItem value={DiaperType.MIXED}>Mixed</SelectItem>
              <SelectItem value={DiaperType.DRY}>Dry</SelectItem>
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

      {/* Details (Color/Texture) - Only for Dirty/Mixed */}
      {showDetails && (
        <>
          <Field>
            <FieldLabel>Color</FieldLabel>
            <Select
              name="color"
              defaultValue={initialData?.color || undefined}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select color" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yellow">Yellow</SelectItem>
                <SelectItem value="brown">Brown</SelectItem>
                <SelectItem value="green">Green</SelectItem>
                <SelectItem value="black">Black</SelectItem>
                <SelectItem value="red">Red (See Doctor)</SelectItem>
                <SelectItem value="white">White (See Doctor)</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel>Texture</FieldLabel>
            <Select
              name="texture"
              defaultValue={initialData?.texture || undefined}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select texture" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="soft">Soft</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
                <SelectItem value="loose">Loose</SelectItem>
                <SelectItem value="watery">Watery</SelectItem>
                <SelectItem value="mucous">Mucous</SelectItem>
              </SelectContent>
            </Select>
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
