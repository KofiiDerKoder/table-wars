/**
 * TABLE WARS! - Page: host
 * 
 * Route handler for the host view.
 * 
 * Last Updated: May 13, 2026
 */
'use client';

import dynamic from 'next/dynamic';

const HostPanel = dynamic(() => import('@/components/views/HostPanel').then(mod => ({ default: mod.HostPanel })), { ssr: false });

export default function ForcedHostPage() {
  return <HostPanel />;
}