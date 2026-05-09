'use client';

import { TeamView } from '@/components/views/TeamView';
import { useEffect, useState } from 'react';

export default function ForcedTeamPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <TeamView />;
}
