import { Button } from "@/components/ui/button";
import { Trophy, Zap } from "lucide-react";
import { useGameStore } from "@/store/useGameStore";
import Link from "next/link";

export function LandingScreen({ onStart }: { onStart: () => void }) {
  const competitionName = useGameStore(s => s.competitionName);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8 text-center animate-in fade-in duration-1000">
      <div className="mb-16 space-y-6">
        <div className="mx-auto w-48 h-48 bg-primary rounded-3xl flex items-center justify-center shadow-2xl mb-8 transform hover:rotate-3 transition-transform duration-500">
           <Trophy className="text-white w-24 h-24" strokeWidth={1.5} />
        </div>
        <h1 className="text-9xl font-black tracking-tighter text-foreground uppercase">
          {competitionName.split(' ').map((word, i) => (
            <span key={i} className={i === competitionName.split(' ').length - 1 ? "text-primary" : ""}>
              {word}{' '}
            </span>
          ))}
        </h1>
        <p className="text-3xl text-muted-foreground font-medium tracking-wide">
          The ultimate tabletop event management system.
        </p>
      </div>
      
      <div className="flex flex-col gap-6">
        <Button
          onClick={onStart}
          size="lg"
          className="px-16 py-10 text-4xl font-bold uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all duration-300 rounded-full"
        >
          Start Event
        </Button>
        
        <Link href="/join">
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-primary font-black uppercase tracking-widest text-lg"
          >
            <Zap className="mr-2" size={18} /> Join as Team Captain
          </Button>
        </Link>
      </div>
    </div>
  );
}
