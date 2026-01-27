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
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { use, useState } from "react";
import { Baby } from "../generated/prisma/client";

export function BabySwitcher({ babies }: { babies: Promise<Baby[]> }) {
  const allBabies = use(babies);
  const [selectedBaby, setSelectedBaby] = useState(allBabies[0]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="border-secondary/50 hover:border-primary/30 h-14 w-full max-w-[280px] justify-between rounded-full bg-white/50 px-4 shadow-sm backdrop-blur-sm transition-all hover:bg-white/80"
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
                Watching
              </span>
              <span className="text-foreground text-base leading-none font-bold">
                {selectedBaby.name}
              </span>
            </div>
          </div>
          <ChevronsUpDown className="text-foreground ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[280px] rounded-2xl p-2" align="center">
        <DropdownMenuLabel className="text-muted-foreground px-2 py-1.5 text-xs font-normal">
          Switch Baby
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          {allBabies.map((baby) => (
            <DropdownMenuItem
              key={baby.id}
              onSelect={() => setSelectedBaby(baby)}
              className="focus:bg-secondary/30 flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2"
            >
              <Avatar className="h-8 w-8 border border-white">
                <AvatarImage src={baby.photoUrl ?? ""} alt={baby.name} />
                <AvatarFallback>{baby.name[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="flex-1 font-medium">{baby.name}</span>
              {selectedBaby.id === baby.id && (
                <Check className="text-primary h-4 w-4" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-border/50 my-2" />
        <DropdownMenuItem className="text-primary focus:bg-primary/5 focus:text-primary flex cursor-pointer items-center gap-2 rounded-xl px-2 py-2">
          <div className="bg-primary/10 border-primary/20 flex h-8 w-8 items-center justify-center rounded-full border">
            <Plus className="h-4 w-4" />
          </div>
          <span className="font-medium">Add New Baby</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function BabySwitcherLoader() {
  return (
    <div className="w-[280px]">
      <Skeleton className="h-14 w-full rounded-full" />
    </div>
  );
}
