"use client";

import { Gender } from "@/app/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner"; // 假設有安裝 sonner，若無則改用 console 或 alert
import { createBaby } from "../actions/baby";

interface AddBabyDialogProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddBabyDialog({
  userId,
  open,
  onOpenChange,
}: AddBabyDialogProps) {
  const [birthDate, setBirthDate] = useState<Date>();
  const [isPending, startTransition] = useTransition();

  async function handleFormAction(formData: FormData) {
    const name = formData.get("name") as string;
    const birthDate = formData.get("birthDate") as string;
    const gender = formData.get("gender") as Gender;
    if (!name || !birthDate || !gender) {
      toast.error("Please fill in all fields");
      return;
    }

    startTransition(async () => {
      await createBaby({
        name,
        birthDate: new Date(birthDate),
        gender,
      });
      toast.success("Baby added successfully!");
      onOpenChange(false);
      setBirthDate(undefined);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form action={handleFormAction}>
          <DialogHeader>
            <DialogTitle>Add New Baby</DialogTitle>
            <DialogDescription>
              Enter the details of the baby you want to track.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Enter baby's name"
                name="name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>Birth Date</Label>
              <input
                type="hidden"
                name="birthDate"
                value={birthDate?.toISOString() || ""}
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !birthDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {birthDate ? (
                      format(birthDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={birthDate}
                    onSelect={setBirthDate}
                    disabled={(date) => date < new Date("1900-01-01")}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label>Gender</Label>
              <RadioGroup
                name="gender"
                defaultValue="MALE"
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="MALE" id="male" />
                  <Label htmlFor="male">Boy</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="FEMALE" id="female" />
                  <Label htmlFor="female">Girl</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Add Baby"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
