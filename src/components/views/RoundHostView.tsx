'use client';

import { useGameStore } from '@/store/useGameStore';
import { QuizControls, PlacementControls, TasteTestControls, FinaleControls } from '@/components/RoundControls';

export function RoundHostView() {
  const rounds = useGameStore(s => s.rounds);
  const currentRoundOrder = useGameStore(s => s.currentRound);

  const currentRoundDef = rounds.find(r => r.order === currentRoundOrder);

  if (!currentRoundDef) return <div>No rounds defined</div>;

  switch (currentRoundDef.type) {
    case 'quiz':
      return <QuizControls />;
    case 'placement':
      return <PlacementControls round={currentRoundOrder} />;
    case 'taste':
      return <TasteTestControls />;
    case 'finale':
      return <FinaleControls />;
    default:
      return <div>Unknown round type: {currentRoundDef.type}</div>;
  }
}
