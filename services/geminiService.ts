
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, Sentiment } from "../types";

const GEMINI_API_KEY = "AIzaSyDsGZJUmZ80cxbcxxt6h46Chy5fkCATMaU";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    if (!GEMINI_API_KEY) {
      throw new Error("API Key is missing");
    }
    this.ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  }

  async analyzeBatch(texts: string[]): Promise<AnalysisResult[]> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Perform sentiment analysis on the following texts. For each text, identify:
        1. Sentiment (Positive, Negative, or Neutral)
        2. Confidence Score (0.0 to 1.0)
        3. Key sentiment-driving keywords or phrases
        4. A brief explanation of why this sentiment was chosen.

        Texts:
        ${texts.map((t, i) => `[${i + 1}] ${t}`).join('\n')}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              sentiment: { type: Type.STRING, description: 'Positive, Negative, or Neutral' },
              confidence: { type: Type.NUMBER },
              keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
              explanation: { type: Type.STRING }
            },
            required: ['sentiment', 'confidence', 'keywords', 'explanation']
          }
        }
      }
    });

    const jsonResults = JSON.parse(response.text || '[]');
    
    return texts.map((text, index) => {
      const result = jsonResults[index] || {
        sentiment: 'Neutral',
        confidence: 0,
        keywords: [],
        explanation: 'Error processing this segment.'
      };

      return {
        id: Math.random().toString(36).substr(2, 9),
        text,
        sentiment: result.sentiment as Sentiment,
        confidence: result.confidence,
        keywords: result.keywords,
        explanation: result.explanation
      };
    });
  }
}

export const geminiService = new GeminiService();
