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
      className="group border-secondary/50 hover:border-primary/50 hover:bg-secondary/20 flex h-28 flex-col items-center justify-center rounded-2xl p-4 shadow-sm transition-all duration-200"
    >
      <div className="relative mb-2">
        <div className="bg-secondary/30 group-hover:bg-secondary/50 text-foreground rounded-2xl p-3 transition-colors">
          <Icon className="h-6 w-6" />
        </div>
        <div className="bg-primary text-primary-foreground absolute -right-1 -bottom-1 rounded-full border-2 border-white p-0.5">
          <Plus className="h-3 w-3" />
        </div>
      </div>
      <span className="text-xs font-semibold">{label}</span>
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
  return <Skeleton className="h-28 rounded-2xl p-4" />;
}
