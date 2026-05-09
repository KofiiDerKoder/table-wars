'use client';

import { LiveScoreboard } from '@/components/views/LiveScoreboard';
import { useEffect, useState } from 'react';

export default function ForcedScoreboardPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <LiveScoreboard />;
}
