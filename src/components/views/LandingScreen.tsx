import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";

export function LandingScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8 text-center animate-in fade-in duration-1000">
      <div className="mb-16 space-y-6">
        <div className="mx-auto w-48 h-48 bg-primary rounded-3xl flex items-center justify-center shadow-2xl mb-8 transform hover:rotate-3 transition-transform duration-500">
           <Trophy className="text-white w-24 h-24" strokeWidth={1.5} />
        </div>
        <h1 className="text-9xl font-black tracking-tighter text-foreground uppercase">
          Table <span className="text-primary">Wars!</span>
        </h1>
        <p className="text-3xl text-muted-foreground font-medium tracking-wide">
          The ultimate tabletop event management system.
        </p>
      </div>
      
      <Button
        onClick={onStart}
        size="lg"
        className="px-16 py-10 text-4xl font-bold uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:scale-105 transition-all duration-300 rounded-full"
      >
        Start Event
      </Button>
    </div>
  );
}
