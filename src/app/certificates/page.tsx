'use client';

import { useGameStore } from '@/store/useGameStore';
import { Button } from '@/components/ui/button';
import { Award, Printer } from 'lucide-react';

export default function CertificatesPage() {
  const teams = useGameStore(s => s.teams);
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

  const Certificate = ({ title, name, description, color }: { title: string, name: string, description: string, color: string }) => (
    <div className="w-[800px] h-[600px] border-[20px] border-double bg-white p-12 flex flex-col items-center justify-between shadow-2xl mb-12 print:break-after-always" style={{ borderColor: color }}>
      <div className="text-center w-full">
        <h2 className="text-5xl font-black uppercase tracking-widest text-slate-900 mb-4">{title}</h2>
        <div className="w-24 h-1 bg-slate-900 mx-auto" />
      </div>
      <div className="text-center">
        <p className="text-xl font-bold text-slate-600 uppercase tracking-widest">This certificate is awarded to</p>
        <h1 className="text-7xl font-black text-slate-950 mt-4">{name.toUpperCase()}</h1>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-slate-700 italic">"{description}"</p>
        <div className="mt-8 flex justify-center gap-12 text-slate-400 font-bold uppercase tracking-widest text-xs">
          <span>BOARDING HOUSE 2026</span>
          <span>TABLE WARS</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="flex justify-between items-center mb-8 print:hidden">
        <h1 className="text-2xl font-black">Certificate Center</h1>
        <Button onClick={() => window.print()} className="bg-slate-900"><Printer className="mr-2" /> PRINT ALL</Button>
      </div>

      <div className="flex flex-col items-center">
        {sortedTeams.length > 0 && (
          <Certificate 
            title="CHAMPION" 
            name={sortedTeams[0].name} 
            description="First position at mealtimes for one full week"
            color="#fbbf24"
          />
        )}
        {sortedTeams.length > 1 && (
          <Certificate 
            title="RUNNER-UP" 
            name={sortedTeams[1].name} 
            description="Second position at mealtimes for one full week"
            color="#94a3b8"
          />
        )}
        <Certificate 
          title="SPORTSMANSHIP" 
          name="[Select Team]" 
          description="Voted best competitive spirit by the house"
          color="#ec4899"
        />
        <Certificate 
          title="ACTIVE INVOLVEMENT" 
          name="[All Residents]" 
          description="Recognition for spirited participation in Table Wars"
          color="#8b5cf6"
        />
      </div>
    </div>
  );
}
