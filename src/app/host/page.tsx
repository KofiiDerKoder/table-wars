'use client';

import dynamic from 'next/dynamic';

const HostPanel = dynamic(() => import('@/components/views/HostPanel').then(mod => ({ default: mod.HostPanel })), { ssr: false });

export default function ForcedHostPage() {
  return <HostPanel />;
}