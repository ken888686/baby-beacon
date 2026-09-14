import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { LucideIcon, Plus } from "lucide-react";
import React from "react";

interface QuickActionProps {
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
  children?: React.ReactNode;
  description?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function QuickAction({
  label,
  icon: Icon,
  onClick,
  children,
  description,
  open,
  onOpenChange,
}: QuickActionProps) {
  const ButtonContent = (
    <Button
      variant="outline"
      onClick={!children ? onClick : undefined}
      aria-label={label}
      className="group border-border bg-card shadow-soft-out hover:border-primary/40 hover:bg-secondary/30 flex h-28 cursor-pointer flex-col items-start justify-between rounded-3xl p-4 text-left transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
    >
      <div className="relative">
        <div className="bg-secondary text-primary group-hover:bg-primary group-hover:text-primary-foreground rounded-2xl p-2.5 transition-colors">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="bg-card text-primary border-border absolute -right-2 -bottom-2 rounded-full border p-0.5">
          <Plus className="h-3 w-3" aria-hidden="true" />
        </div>
      </div>
      <span className="text-foreground text-sm font-bold">{label}</span>
    </Button>
  );

  if (children) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>{ButtonContent}</DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    );
  }

  return ButtonContent;
}

export function QuickActionLoader() {
  return <Skeleton className="h-28 rounded-3xl p-4" />;
}
