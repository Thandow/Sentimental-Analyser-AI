
export enum Sentiment {
  POSITIVE = 'Positive',
  NEGATIVE = 'Negative',
  NEUTRAL = 'Neutral'
}

export interface AnalysisResult {
  id: string;
  text: string;
  sentiment: Sentiment;
  confidence: number;
  keywords: string[];
  explanation: string;
  source?: string;
}

export interface BatchSummary {
  total: number;
  positive: number;
  negative: number;
  neutral: number;
  avgConfidence: number;
}
