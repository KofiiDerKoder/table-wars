'use client';

import { useEffect, useState, useRef } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { Button } from '@/components/ui/button';
import { Printer, Download, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const Certificate = ({ id, title, name, description, color }: { id?: string, title: string, name: string, description: string, color: string }) => (
  <div id={id} className="w-[800px] h-[600px] border-[20px] border-double bg-white p-12 flex flex-col items-center justify-between shadow-2xl mb-12 print:break-after-always print:shadow-none print:mb-0" style={{ borderColor: color }}>
    <div className="text-center w-full">
      <h2 className="text-5xl font-black uppercase tracking-widest text-slate-900 mb-4">{title}</h2>
      <div className="w-24 h-1 bg-slate-900 mx-auto" />
    </div>
    <div className="text-center">
      <p className="text-xl font-bold text-slate-600 uppercase tracking-widest">This certificate is awarded to</p>
      <h1 className="text-7xl font-black text-slate-950 mt-4 leading-tight">{name.toUpperCase()}</h1>
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

export default function CertificatesPage() {
  const { teams, initialize } = useGameStore();
  const [mounted, setMounted] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    if (!mounted) {
      initialize();
    }
  }, []);

  const exportPDF = async () => {
    setIsExporting(true);
    const pdf = new jsPDF('landscape', 'px', [800, 600]);
    
    const ids = ['cert-winner', 'cert-runnerup', 'cert-spirit', 'cert-involvement'];
    
    for (let i = 0; i < ids.length; i++) {
      const element = document.getElementById(ids[i]);
      if (element) {
        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        if (i > 0) pdf.addPage([800, 600], 'landscape');
        pdf.addImage(imgData, 'PNG', 0, 0, 800, 600);
      }
    }
    
    pdf.save('table-wars-certificates.pdf');
    setIsExporting(false);
  };

  if (!mounted) return null;

  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

  return (
    <div className="min-h-screen bg-slate-100 p-8 pb-24">
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-12 print:hidden">
        <Button variant="ghost" onClick={() => router.back()} className="font-black uppercase tracking-widest">
          <ChevronLeft className="mr-2" /> Back
        </Button>
        <div className="flex gap-4">
          <Button onClick={() => window.print()} variant="outline" className="font-black uppercase tracking-widest">
            <Printer className="mr-2" /> Browser Print
          </Button>
          <Button onClick={exportPDF} disabled={isExporting} className="bg-slate-900 font-black uppercase tracking-widest">
            <Download className="mr-2" /> {isExporting ? 'Generating...' : 'Export PDF'}
          </Button>
        </div>
      </div>

      <div className="flex flex-col items-center">
        {sortedTeams.length > 0 && (
          <Certificate 
            id="cert-winner"
            title="CHAMPION" 
            name={sortedTeams[0].name} 
            description="First position at mealtimes for one full week"
            color="#fbbf24"
          />
        )}
        {sortedTeams.length > 1 && (
          <Certificate 
            id="cert-runnerup"
            title="RUNNER-UP" 
            name={sortedTeams[1].name} 
            description="Second position at mealtimes for one full week"
            color="#94a3b8"
          />
        )}
        <Certificate 
          id="cert-spirit"
          title="SPORTSMANSHIP" 
          name="Spirit Award" 
          description="Voted best competitive spirit by the house"
          color="#ec4899"
        />
        <Certificate 
          id="cert-involvement"
          title="ACTIVE INVOLVEMENT" 
          name="Resident Group" 
          description="Recognition for spirited participation in Table Wars"
          color="#8b5cf6"
        />
      </div>
    </div>
  );
}