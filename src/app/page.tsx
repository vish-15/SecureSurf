"use client";

import * as React from "react";
import { Shield } from "lucide-react";
import { ThemeToggleButton } from "@/components/theme-toggle-button";
import { UrlInputForm } from "@/components/url-input-form";
import { AnalysisResults } from "@/components/analysis-results";
import { AnalysisHistory } from "@/components/analysis-history";
import { BrowserExtensionTeaser } from "@/components/browser-extension-teaser";
import type { AnalysisData, HistoryItem } from "@/lib/types";
import useLocalStorage from "@/lib/hooks/use-local-storage";
import { analyzeUrlAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";


const MAX_HISTORY_ITEMS = 10;

export default function SecureSurfPage() {
  const [currentUrl, setCurrentUrl] = React.useState<string>("");
  const [analysisResult, setAnalysisResult] = React.useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  
  const [analysisHistory, setAnalysisHistory] = useLocalStorage<HistoryItem[]>("secureSurfHistory", []);
  const { toast } = useToast();

  const handleAnalyze = async (urlToAnalyze: string) => {
    setCurrentUrl(urlToAnalyze);
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    const result = await analyzeUrlAction(urlToAnalyze);

    setIsLoading(false);
    if ("error" in result) {
      setError(result.error);
      toast({
        title: "Analysis Failed",
        description: result.error,
        variant: "destructive",
      });
    } else {
      setAnalysisResult(result);
      setError(null); // Clear previous errors
      
      // Add to history
      setAnalysisHistory(prevHistory => {
        const newHistoryItem: HistoryItem = {
          ...result,
          id: Date.now().toString() + Math.random().toString(36).substring(2,7), // simple unique id
          url: urlToAnalyze,
          timestamp: Date.now(),
        };
        
        // Remove if already exists to update its position and data
        const filteredHistory = prevHistory.filter(item => item.url !== urlToAnalyze);
        const updatedHistory = [newHistoryItem, ...filteredHistory];
        
        return updatedHistory.slice(0, MAX_HISTORY_ITEMS);
      });
      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed ${urlToAnalyze}.`,
      });
    }
  };

  const handleReanalyze = (url: string) => {
    // Set the URL in the form (UrlInputForm needs to accept an initialUrl prop or be updated via form.setValue)
    // For simplicity, we can just trigger handleAnalyze which will also set currentUrl
    // This also helps if the form component is not directly controlled by currentUrl state here.
    // It's better to pass initialUrl to UrlInputForm and let it re-render.
    // For now, directly calling handleAnalyze will work for re-analysis logic.
    const formInput = document.getElementById('url-input') as HTMLInputElement | null;
    if (formInput) {
        formInput.value = url; // Visually update input, though form state might need explicit update
    }
    handleAnalyze(url); 
  };

  const handleClearHistory = () => {
    setAnalysisHistory([]);
    toast({
      title: "History Cleared",
      description: "Your analysis history has been cleared.",
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between max-w-5xl mx-auto px-4">
          <div className="flex items-center gap-2">
            <Shield className="h-7 w-7 text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold text-primary">SecureSurf</h1>
          </div>
          <ThemeToggleButton />
        </div>
      </header>

      <main className="flex-1 container py-8 max-w-3xl mx-auto px-4">
        <div className="grid gap-10">
          <section id="url-input" aria-labelledby="url-input-heading">
            <Card className="shadow-xl rounded-xl">
              <CardHeader>
                <CardTitle id="url-input-heading" className="text-2xl">Analyze Website Security</CardTitle>
                <CardDescription>Enter a URL to check for potential threats and get a safety rating.</CardDescription>
              </CardHeader>
              <CardContent>
                <UrlInputForm onSubmit={handleAnalyze} isLoading={isLoading} initialUrl={currentUrl} />
              </CardContent>
            </Card>
          </section>

          {(isLoading || analysisResult || error) && (
            <section id="results" aria-labelledby="results-heading">
               {/* The AnalysisResults component has its own Card and CardHeader with title, so no need for an external heading here */}
              <AnalysisResults analysis={analysisResult} isLoading={isLoading} error={error} />
            </section>
          )}
          
          <Separator />

          <section id="history" aria-labelledby="history-heading">
            <AnalysisHistory
              history={analysisHistory}
              onReanalyze={handleReanalyze}
              onClearHistory={handleClearHistory}
              isLoading={isLoading}
            />
          </section>

          <Separator />

          <section id="browser-extension" aria-labelledby="browser-extension-heading">
            <BrowserExtensionTeaser />
          </section>
        </div>
      </main>

      <footer className="py-6 md:px-8 md:py-0 border-t mt-12 bg-background/80">
        <div className="container flex flex-col items-center justify-center gap-2 h-20 md:flex-row max-w-5xl mx-auto px-4">
          <p className="text-xs text-center text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} SecureSurf. All rights reserved. This tool is for informational purposes only.
          </p>
        </div>
      </footer>
    </div>
  );
}
