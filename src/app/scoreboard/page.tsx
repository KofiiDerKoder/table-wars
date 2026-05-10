'use client';

import dynamic from 'next/dynamic';

const LiveScoreboard = dynamic(() => import('@/components/views/LiveScoreboard').then(mod => ({ default: mod.LiveScoreboard })), { ssr: false });

export default function ForcedScoreboardPage() {
  return <LiveScoreboard />;
}