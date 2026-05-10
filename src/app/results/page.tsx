'use client';

import dynamic from 'next/dynamic';

const ResultsView = dynamic(() => import('@/components/views/ResultsView').then(mod => ({ default: mod.ResultsView })), { ssr: false });

export default function ResultsPage() {
  return <ResultsView />;
}