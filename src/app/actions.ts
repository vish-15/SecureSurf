"use server";

import { analyzeWebsiteContent } from "@/ai/flows/analyze-website-content";
import type { AnalysisData } from "@/lib/types";

export async function analyzeUrlAction(url: string): Promise<AnalysisData | { error: string }> {
  if (!url || !/^https?:\/\/.+/.test(url)) {
    return { error: "Invalid URL format. Please include http:// or https://" };
  }
  try {
    const result = await analyzeWebsiteContent({ url });
    return result;
  } catch (error) {
    console.error("Error analyzing URL:", error);
    // Check if error is an instance of Error and has a message property
    if (error instanceof Error) {
        return { error: `Failed to analyze URL: ${error.message}` };
    }
    return { error: "Failed to analyze URL due to an unknown error." };
  }
}
