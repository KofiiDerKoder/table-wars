'use client';

import { HostPanel } from '@/components/views/HostPanel';
import { useEffect, useState } from 'react';

export default function ForcedHostPage() {
  if (typeof window === 'undefined') return null;
  return <HostPanel />;
}
