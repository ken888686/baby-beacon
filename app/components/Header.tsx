import { Baby } from "lucide-react";

export function Header() {
  return (
    <header className="flex items-center justify-center py-6">
      <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm px-6 py-3 rounded-full shadow-sm border border-secondary/50">
        <div className="p-2 bg-secondary rounded-full text-foreground">
          <Baby className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Baby Beacon</h1>
      </div>
    </header>
  );
}