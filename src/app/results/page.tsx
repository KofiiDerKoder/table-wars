/**
 * TABLE WARS! - Page: results
 * 
 * Route handler for the results view.
 * 
 * Last Updated: May 13, 2026
 */
'use client';

import dynamic from 'next/dynamic';

const ResultsView = dynamic(() => import('@/components/views/ResultsView').then(mod => ({ default: mod.ResultsView })), { ssr: false });

/**
 * Default export function for the ResultsPage component
 * This component serves as a container for the results display
 * @returns {JSX.Element} The ResultsView component to be rendered
 */
export default function ResultsPage() {
  return <ResultsView />;
}