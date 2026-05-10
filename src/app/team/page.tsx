'use client';

import dynamic from 'next/dynamic';

const TeamView = dynamic(() => import('@/components/views/TeamView').then(mod => ({ default: mod.TeamView })), { ssr: false });

export default function ForcedTeamPage() {
  return <TeamView />;
}