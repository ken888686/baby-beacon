import { LucideIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuickActionProps {
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
}

export function QuickAction({ label, icon: Icon, onClick }: QuickActionProps) {
  return (
    <Button 
      variant="outline" 
      onClick={onClick}
      className="group h-auto flex flex-col items-center justify-center p-4 rounded-2xl border-secondary/50 hover:border-primary/50 hover:bg-secondary/20 shadow-sm transition-all duration-200"
    >
      <div className="relative mb-2">
        <div className="p-3 bg-secondary/30 rounded-2xl group-hover:bg-secondary/50 transition-colors text-foreground">
          <Icon className="w-6 h-6" />
        </div>
        <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground p-0.5 rounded-full border-2 border-white">
          <Plus className="w-3 h-3" />
        </div>
      </div>
      <span className="font-semibold text-xs">{label}</span>
    </Button>
  );
}