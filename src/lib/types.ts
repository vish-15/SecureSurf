
import type { AnalyzeWebsiteContentOutput } from "@/ai/flows/analyze-website-content";

export type AnalysisData = AnalyzeWebsiteContentOutput;

export interface HistoryItem extends AnalysisData {
  id: string;
  url: string;
  timestamp: number;
}

// The ThreatLevel type will now infer the new enum values from AnalyzeWebsiteContentOutput
export type ThreatLevel = AnalysisData["threatLevel"] | 'safe' | 'suspicious' | 'dangerous'; // Include old types for backward compatibility in UI
