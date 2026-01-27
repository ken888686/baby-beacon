"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, ChevronsUpDown, Plus, Settings } from "lucide-react";
import { use, useState, useTransition } from "react";
import { switchBaby } from "../actions/baby";
import type { Baby, Gender } from "../generated/prisma/client";
import { AddBabyDialog } from "./AddBabyDialog";
import { EditBabyDialog } from "./EditBabyDialog";

export function BabySwitcher({
  babies,
  currentBabyId,
}: {
  babies: Promise<Baby[]>;
  currentBabyId?: string;
}) {
  const allBabies = use(babies);
  const [selectedBaby, setSelectedBaby] = useState<Baby>(
    allBabies.find((b) => b.id === currentBabyId) ??
      allBabies[0] ?? {
        id: "placeholder",
        name: "Add a Baby",
        birthDate: new Date(),
        gender: "MALE" as Gender,
        photoUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingBaby, setEditingBaby] = useState<Baby | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleBabySelect = (baby: Baby) => {
    setSelectedBaby(baby);
    startTransition(async () => {
      await switchBaby(baby.id);
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            disabled={isPending}
            className="border-secondary/50 hover:border-primary/30 h-14 w-full max-w-[280px] justify-between rounded-full bg-white/50 px-4 shadow-sm backdrop-blur-sm transition-all hover:bg-white/80 disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                <AvatarImage
                  src={selectedBaby.photoUrl ?? ""}
                  alt={selectedBaby.name}
                />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {selectedBaby.name[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-left">
                <span className="text-muted-foreground text-xs font-medium">
                  {isPending ? "Switching..." : "Watching"}
                </span>
                <span className="text-foreground text-base leading-none font-bold">
                  {selectedBaby.name}
                </span>
              </div>
            </div>
            <ChevronsUpDown className="text-foreground ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-[280px] rounded-2xl p-2"
          align="center"
        >
          <DropdownMenuLabel className="text-muted-foreground px-2 py-1.5 text-xs font-normal">
            Switch Baby
          </DropdownMenuLabel>
          <DropdownMenuGroup>
            {allBabies.map((baby) => (
              <div
                key={baby.id}
                className="focus-within:bg-secondary/30 hover:bg-secondary/30 flex items-center gap-2 rounded-xl px-2 py-2 transition-colors"
              >
                <div
                  className="flex flex-1 cursor-pointer items-center gap-3"
                  onClick={() => handleBabySelect(baby)}
                >
                  <Avatar className="h-8 w-8 border border-white">
                    <AvatarImage src={baby.photoUrl ?? ""} alt={baby.name} />
                    <AvatarFallback>
                      {baby.name[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex-1 font-medium">{baby.name}</span>
                  {selectedBaby.id === baby.id && (
                    <Check className="text-primary h-4 w-4" />
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-background h-6 w-6 rounded-full opacity-50 hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingBaby(baby);
                  }}
                >
                  <Settings className="h-3 w-3" />
                  <span className="sr-only">Settings</span>
                </Button>
              </div>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="bg-border/50 my-2" />
          <DropdownMenuItem
            onSelect={() => setIsAddDialogOpen(true)}
            className="text-primary focus:bg-primary/5 focus:text-primary flex cursor-pointer items-center gap-2 rounded-xl px-2 py-2"
          >
            <div className="bg-primary/10 border-primary/20 flex h-8 w-8 items-center justify-center rounded-full border">
              <Plus className="h-4 w-4" />
            </div>
            <span className="font-medium">Add New Baby</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AddBabyDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />

      {editingBaby && (
        <EditBabyDialog
          key={editingBaby.id}
          baby={editingBaby}
          open={!!editingBaby}
          onOpenChange={(open) => !open && setEditingBaby(null)}
        />
      )}
    </>
  );
}

export function BabySwitcherLoader() {
  return (
    <div className="w-[280px]">
      <Skeleton className="h-14 w-full rounded-full" />
    </div>
  );
}
