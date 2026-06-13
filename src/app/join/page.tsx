/**
 * TABLE WARS! - Page: join
 * 
 * Route handler for the join view.
 * 
 * Last Updated: May 13, 2026
 */
'use client';

import { useGameStore } from '@/store/useGameStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Zap } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * JoinPage component - Allows users to join a game session using a session code
 */
export default function JoinPage() {

  // State variables for session code and loading state
  const [code, setCode] = useState(''); // Stores the session code input by user
  const [isJoining, setIsJoining] = useState(false); // Tracks if join request is in progress


  // Store and router hooks
  const joinSession = useGameStore(s => s.joinSession);
  const setView = useGameStore(s => s.setView);
  const competitionName = useGameStore(s => s.competitionName);
  const router = useRouter(); // Router for navigation

  /**
   * Handles the join session process
   * Validates code, attempts to join session, and handles response
   */
  const handleJoin = async () => {
    // Return if code is less than 6 characters
    if (code.length < 6) return;
    // Set joining state to true to show loading indicator
    setIsJoining(true);
    // Attempt to join session with uppercase code
    const result = await joinSession(code.toUpperCase());
    // Reset joining state
    setIsJoining(false);
    
    // If join was successful
    if (result) {
      // Mark session as started in localStorage
      localStorage.setItem('tablewars-started', 'true');
      // Set view to team
      setView('team');
      // Navigate to home page
      router.push('/');
    } else {
      // Show error message for invalid session code
      alert('Invalid session code. Please check with your host.');
    }
  };

  // JSX for the join page UI
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
      {/* Main card container */}
      <Card className="w-full max-w-md bg-slate-900 border-slate-800 shadow-2xl overflow-hidden">
        {/* Card header with title and trophy icon */}
        <CardHeader className="text-center pt-10 pb-6 border-b border-slate-800">
          <Trophy className="mx-auto text-blue-500 mb-4" size={48} />
          <CardTitle className="text-3xl font-black tracking-tighter text-white uppercase">
            JOIN <span className="text-blue-600">{competitionName}</span>
          </CardTitle>
          <p className="text-slate-500 font-medium text-sm mt-2 uppercase tracking-widest">Team Participation Portal</p>
        </CardHeader>
        {/* Card content with input and button */}
        <CardContent className="p-8 space-y-8">
          {/* Input section for session code */}
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

          {/* Join button with loading state */}
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

          {/* Instruction text */}
          <p className="text-center text-slate-600 text-[10px] font-bold uppercase tracking-widest px-4">
            Ask your game host for the 6-character code displayed at the top of their dashboard.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
