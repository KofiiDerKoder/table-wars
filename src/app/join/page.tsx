'use client';

import { useGameStore } from '@/store/useGameStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Zap } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function JoinPage() {
  const [code, setCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const joinSession = useGameStore(s => s.joinSession);
  const setView = useGameStore(s => s.setView);
  const router = useRouter();

  const handleJoin = async () => {
    if (code.length < 6) return;
    setIsJoining(true);
    const result = await joinSession(code.toUpperCase());
    setIsJoining(false);
    
    if (result) {
      setView('team');
      router.push('/');
    } else {
      alert('Invalid session code. Please check with your host.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
      <Card className="w-full max-w-md bg-slate-900 border-slate-800 shadow-2xl overflow-hidden">
        <CardHeader className="text-center pt-10 pb-6 border-b border-slate-800">
          <Trophy className="mx-auto text-blue-500 mb-4" size={48} />
          <CardTitle className="text-3xl font-black tracking-tighter text-white uppercase">
            JOIN <span className="text-blue-600">TABLE WARS!</span>
          </CardTitle>
          <p className="text-slate-500 font-medium text-sm mt-2 uppercase tracking-widest">Team Participation Portal</p>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="space-y-4">
            <Label htmlFor="code" className="text-xs font-black uppercase tracking-widest text-slate-400">Enter Session Code</Label>
            <Input 
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. AB3X9K"
              maxLength={6}
              className="h-16 text-center text-4xl font-black uppercase tracking-widest bg-slate-950 border-slate-800 text-white focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <Button 
            onClick={handleJoin}
            disabled={code.length < 6 || isJoining}
            className="w-full h-16 text-xl font-black uppercase tracking-widest shadow-xl shadow-blue-900/20 bg-blue-600 hover:bg-blue-700"
          >
            {isJoining ? (
              <span className="flex items-center gap-2">
                <Zap className="animate-spin" size={20} /> SYNCING...
              </span>
            ) : (
              'CONNECT DEVICE'
            )}
          </Button>

          <p className="text-center text-slate-600 text-[10px] font-bold uppercase tracking-widest px-4">
            Ask your game host for the 6-character code displayed at the top of their dashboard.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
