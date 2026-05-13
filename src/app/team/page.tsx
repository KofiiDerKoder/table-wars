/**
 * TABLE WARS! - Page: team
 * 
 * Route handler for the team view.
 * 
 * Last Updated: May 13, 2026
 */
'use client';

import dynamic from 'next/dynamic';

const TeamView = dynamic(() => import('@/components/views/TeamView').then(mod => ({ default: mod.TeamView })), { ssr: false });

export default function ForcedTeamPage() {
  return <TeamView />;
}