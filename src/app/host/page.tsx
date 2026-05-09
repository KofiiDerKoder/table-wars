'use client';

import { HostPanel } from '@/components/views/HostPanel';
import { useEffect, useState } from 'react';

export default function ForcedHostPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <HostPanel />;
}
