'use client';

import { LiveScoreboard } from '@/components/views/LiveScoreboard';
import { useEffect, useState } from 'react';

export default function ForcedScoreboardPage() {
  if (typeof window === 'undefined') return null;
  return <LiveScoreboard />;
}
