"use client";

import { Gender, Baby } from "@/app/generated/prisma/client";
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
import { CalendarIcon, Loader2, Trash2 } from "lucide-react";
import { useState, useTransition, useEffect } from "react";
import { toast } from "sonner";
import { updateBaby, deleteBaby } from "../actions/baby";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface EditBabyDialogProps {
  baby: Baby;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditBabyDialog({
  baby,
  open,
  onOpenChange,
}: EditBabyDialogProps) {
  const [birthDate, setBirthDate] = useState<Date | undefined>(
    new Date(baby.birthDate),
  );
  const [isPending, startTransition] = useTransition();

  // Reset state when dialog opens with a new baby
  useEffect(() => {
    if (open) {
      setBirthDate(new Date(baby.birthDate));
    }
  }, [open, baby]);

  async function handleUpdate(formData: FormData) {
    const name = formData.get("name") as string;
    const birthDateStr = formData.get("birthDate") as string;
    const gender = formData.get("gender") as Gender;

    if (!name || !birthDateStr || !gender) {
      toast.error("Please fill in all fields");
      return;
    }

    startTransition(async () => {
      try {
        await updateBaby(baby.id, {
          name,
          birthDate: new Date(birthDateStr),
          gender,
        });
        toast.success("Baby updated successfully!");
        onOpenChange(false);
      } catch (error) {
        toast.error("Failed to update baby");
        console.error(error);
      }
    });
  }

  async function handleDelete() {
    startTransition(async () => {
      try {
        await deleteBaby(baby.id);
        toast.success("Baby deleted successfully!");
        onOpenChange(false);
      } catch (error) {
        toast.error("Failed to delete baby");
        console.error(error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form action={handleUpdate}>
          <DialogHeader>
            <DialogTitle>Edit Baby Details</DialogTitle>
            <DialogDescription>
              Update the details for {baby.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                defaultValue={baby.name}
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
                    disabled={(date) => date > new Date()}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label>Gender</Label>
              <RadioGroup
                name="gender"
                defaultValue={baby.gender}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="MALE" id="edit-male" />
                  <Label htmlFor="edit-male">Boy</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="FEMALE" id="edit-female" />
                  <Label htmlFor="edit-female">Girl</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter className="flex items-center justify-between sm:justify-between">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  type="button"
                  disabled={isPending}
                  size="icon"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete{" "}
                    <span className="font-bold">{baby.name}</span> and all associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
