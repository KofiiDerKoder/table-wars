import type { QuizQuestion } from '@/store/useGameStore';

export interface ParsedQuestion {
  text: string;
  options: string[];
  correctAnswer: string;
  category: string;
}

function parseCSVLine(content: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < content.length && content[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        result.push(current.trim());
        current = '';
      } else if (ch === '\n' || ch === '\r') {
        // skip line breaks inside CSV split
      } else {
        current += ch;
      }
    }
  }
  result.push(current.trim());
  return result;
}

export function parseCSV(content: string): ParsedQuestion[] {
  const lines = content.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase());
  const textIdx = headers.indexOf('text');
  const opt1Idx = headers.indexOf('option1');
  const opt2Idx = headers.indexOf('option2');
  const opt3Idx = headers.indexOf('option3');
  const opt4Idx = headers.indexOf('option4');
  const correctIdx = headers.indexOf('correctanswer');
  const catIdx = headers.indexOf('category');

  if (textIdx === -1 || opt1Idx === -1 || correctIdx === -1) return [];

  const results: ParsedQuestion[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const text = values[textIdx]?.trim();
    if (!text) continue;
    const options = [values[opt1Idx]?.trim(), values[opt2Idx]?.trim(), values[opt3Idx]?.trim(), values[opt4Idx]?.trim()].filter(Boolean);
    const correctAnswer = values[correctIdx]?.trim();
    const category = catIdx !== -1 && values[catIdx]?.trim() ? values[catIdx].trim() : 'General';
    if (text && options.length >= 2 && correctAnswer) {
      results.push({ text, options, correctAnswer, category });
    }
  }
  return results;
}

export function parseBulkPaste(content: string, delimiter: string = '|'): ParsedQuestion[] {
  const lines = content.split(/\r?\n/).filter(line => line.trim());
  const results: ParsedQuestion[] = [];

  for (const line of lines) {
    const parts = line.split(delimiter).map(p => p.trim());
    if (parts.length < 6) continue;
    const text = parts[0];
    const options = parts.slice(1, 5).filter(Boolean);
    const correctAnswer = parts[5];
    const category = parts[6]?.trim() || 'General';
    if (text && options.length >= 2 && correctAnswer) {
      results.push({ text, options, correctAnswer, category });
    }
  }
  return results;
}

export function parseJSON(content: string): ParsedQuestion[] {
  let data: any[];
  try {
    data = JSON.parse(content);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];
  return data
    .filter((item: any) => item.text && Array.isArray(item.options) && item.options.length >= 2 && item.correctAnswer)
    .map((item: any) => ({
      text: item.text,
      options: item.options.filter(Boolean),
      correctAnswer: item.correctAnswer,
      category: item.category || 'General',
    }));
}

export function questionsToQuizQuestion(parsed: ParsedQuestion[]): QuizQuestion[] {
  return parsed.map(q => ({
    id: crypto.randomUUID(),
    text: q.text,
    options: q.options,
    correctAnswer: q.correctAnswer,
    category: q.category || 'General',
  }));
}
