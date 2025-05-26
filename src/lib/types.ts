import type { AnalyzeWebsiteContentOutput } from "@/ai/flows/analyze-website-content";

export type AnalysisData = AnalyzeWebsiteContentOutput;

export interface HistoryItem extends AnalysisData {
  id: string;
  url: string;
  timestamp: number;
}

export type ThreatLevel = AnalysisData["threatLevel"];
