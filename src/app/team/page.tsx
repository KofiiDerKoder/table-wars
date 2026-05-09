'use client';

import { TeamView } from '@/components/views/TeamView';
import { useEffect, useState } from 'react';

export default function ForcedTeamPage() {
  if (typeof window === 'undefined') return null;
  return <TeamView />;
}
