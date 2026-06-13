import { describe, it, expect } from 'vitest';
import { DEFAULT_QUIZ_QUESTIONS, DEFAULT_TASTE_ITEMS } from '@/lib/constants';

describe('Constants - Quiz Questions', () => {
  it('should have 30 trivia questions for round 1', () => {
    const triviaQs = DEFAULT_QUIZ_QUESTIONS.filter(q => q.id.startsWith('r1'));
    expect(triviaQs).toHaveLength(30);
  });

  it('should have 25 finale questions for round 5', () => {
    const finaleQs = DEFAULT_QUIZ_QUESTIONS.filter(q => q.id.startsWith('r5'));
    expect(finaleQs).toHaveLength(25);
  });

  it('should have 55 total questions', () => {
    expect(DEFAULT_QUIZ_QUESTIONS).toHaveLength(55);
  });

  it('should have valid structure for all questions', () => {
    DEFAULT_QUIZ_QUESTIONS.forEach(q => {
      expect(q.id).toBeTruthy();
      expect(q.text).toBeTruthy();
      expect(q.options.length).toBeGreaterThanOrEqual(2);
      expect(q.correctAnswer).toBeTruthy();
      expect(q.options).toContain(q.correctAnswer);
      expect(q.category).toBeTruthy();
    });
  });

  it('should have unique question IDs', () => {
    const ids = DEFAULT_QUIZ_QUESTIONS.map(q => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should have exactly 4 options per question', () => {
    DEFAULT_QUIZ_QUESTIONS.forEach(q => {
      expect(q.options).toHaveLength(4);
    });
  });
});

describe('Constants - Taste Items', () => {
  it('should have 15 taste items', () => {
    expect(DEFAULT_TASTE_ITEMS).toHaveLength(15);
  });

  it('should have valid structure for all items', () => {
    DEFAULT_TASTE_ITEMS.forEach(item => {
      expect(item.id).toBeTruthy();
      expect(item.name).toBeTruthy();
      expect(item.category).toBeTruthy();
    });
  });

  it('should have unique item IDs', () => {
    const ids = DEFAULT_TASTE_ITEMS.map(i => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should have a hint for every item', () => {
    DEFAULT_TASTE_ITEMS.forEach(item => {
      expect(item.hint).toBeTruthy();
    });
  });
});
