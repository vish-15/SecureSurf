
'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { analyzeWebsiteContent, type AnalyzeWebsiteContentOutput } from '@/ai/flows/analyze-website-content';
import { ShieldCheck, ShieldAlert, ShieldX, ShieldQuestion, Loader2, ExternalLink, AlertCircle, Trash2, History, Moon, Sun, RotateCcw, VerifiedIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const FormSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid URL (e.g., https://example.com)' }),
});

type AnalysisResult = AnalyzeWebsiteContentOutput & { url: string; timestamp: number };
type AnalysisHistoryItem = AnalysisResult;

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistoryItem[]>([]);
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      url: '',
    },
  });

  // Theme Management
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = storedTheme || (systemPrefersDark ? 'dark' : 'light');
    setCurrentTheme(initialTheme);
  }, []);

  useEffect(() => {
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', currentTheme);
  }, [currentTheme]);

  const toggleTheme = () => {
    setCurrentTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Analysis History Management
  useEffect(() => {
    const storedHistory = localStorage.getItem('analysisHistory');
    if (storedHistory) {
      setAnalysisHistory(JSON.parse(storedHistory));
    }
  }, []);

  const saveHistory = (newResult: AnalysisResult) => {
    setAnalysisHistory(prevHistory => {
      const updatedHistory = [newResult, ...prevHistory.slice(0, 9)]; // Keep last 10 results
      localStorage.setItem('analysisHistory', JSON.stringify(updatedHistory));
      return updatedHistory;
    });
  };

  const clearHistory = () => {
    setAnalysisHistory([]);
    localStorage.removeItem('analysisHistory');
    toast({
      title: "History Cleared",
      description: "Your analysis history has been cleared.",
    });
  };

  const handleReanalyze = (url: string) => {
    form.setValue('url', url);
    onSubmit({ url });
  };


  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    setAnalysisResult(null);

    try {
      const fetchResponse = await fetch(`/api/fetch-content?url=${encodeURIComponent(data.url)}`);
      if (!fetchResponse.ok) {
        let errorMessage = `Failed to fetch website content (status: ${fetchResponse.status})`;
        try {
            const errorData = await fetchResponse.json();
            errorMessage = errorData.error || errorMessage;
        } catch (e) {
            // If parsing JSON fails, use the default error message
        }
        throw new Error(errorMessage);
      }
      const { content: websiteContent } = await fetchResponse.json();

      if (!websiteContent) {
        throw new Error('Fetched content is empty.');
      }

      const result = await analyzeWebsiteContent({ url: data.url, content: websiteContent });
      const resultWithTimestamp = { ...result, url: data.url, timestamp: Date.now() };
      setAnalysisResult(resultWithTimestamp);
      saveHistory(resultWithTimestamp);
      toast({
        title: "Analysis Complete",
        description: `Finished analyzing ${data.url}`,
      });
    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysisResult(null);
      const errorMessage = error instanceof Error ? error.message : "Could not analyze the website. Please check the URL or try again later.";
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  const getSafetyIndicator = (score: number | undefined): React.ReactNode => {
    if (score === undefined) return <ShieldQuestion className="h-5 w-5 text-muted-foreground" />;
    if (score >= 90) return <ShieldCheck className="h-5 w-5 text-purple-600" />; // Super Safe
    if (score >= 70) return <ShieldCheck className="h-5 w-5 text-green-500" />;   // Safe
    if (score >= 50) return <ShieldAlert className="h-5 w-5 text-orange-500" />; // Medium
    if (score >= 30) return <ShieldAlert className="h-5 w-5 text-yellow-500" />; // Low
    return <ShieldX className="h-5 w-5 text-red-500" />; // Critical
  };
  
  const getReputationCategoryColor = (score: number | undefined): string => {
    if (score === undefined) return 'text-muted-foreground';
    if (score >= 90) return 'text-purple-600';
    if (score >= 70) return 'text-green-500';
    if (score >= 50) return 'text-orange-500';
    if (score >= 30) return 'text-yellow-500';
    return 'text-red-500';
  };


  const getThreatLevelColor = (level: string | undefined): string => {
    switch (level?.toLowerCase()) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-blue-500'; // Kept as blue for AI, distinct from reputation's 'low'
      case 'safe': return 'text-green-500';
      default: return 'text-muted-foreground';
    }
  };

  const getThreatLevelIcon = (level: string | undefined): React.ReactNode => {
     switch (level?.toLowerCase()) {
      case 'high': return <ShieldX className="h-5 w-5 text-red-500" />;
      case 'medium': return <ShieldAlert className="h-5 w-5 text-yellow-500" />;
      case 'low': return <ShieldCheck className="h-5 w-5 text-blue-500" />; // Kept as blue ShieldCheck
      case 'safe': return <ShieldCheck className="h-5 w-5 text-green-500" />;
      default: return <ShieldQuestion className="h-5 w-5 text-muted-foreground" />;
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center">
             <ShieldCheck className="h-6 w-6 mr-2 text-primary" />
            <span className="font-bold text-lg">SecureSurf</span>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {currentTheme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      <main className="flex-1 container py-8 md:py-12">
        <section className="text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-primary">
            Analyze Website Security Instantly
          </h1>
          <p className="mt-3 text-lg text-muted-foreground sm:mt-5 sm:text-xl">
            Enter a URL to check for potential threats and assess its safety.
          </p>
        </section>

        <Card className="w-full max-w-2xl mx-auto mb-12 shadow-lg">
          <CardHeader>
            <CardTitle>Enter Website URL</CardTitle>
            <CardDescription>We'll analyze the content and reputation for security risks.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-4">
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="sr-only">Website URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze'
                  )}
                </Button>
              </form>
            </Form>
             <Alert variant="default" className="mt-4 bg-secondary/50 border-secondary">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Note</AlertTitle>
                <AlertDescription>
                  Content analysis is performed by AI and may not be perfect. Reputation score is based on available data. Always exercise caution online.
                </AlertDescription>
              </Alert>
          </CardContent>
        </Card>

        {isLoading && (
          <div className="flex justify-center items-center mb-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2 text-muted-foreground">Analyzing website...</p>
          </div>
        )}

        {analysisResult && !isLoading && (
          <Card className="w-full max-w-2xl mx-auto shadow-lg animate-in fade-in duration-500 mb-12">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Analysis Results</span>
                 <a href={analysisResult.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center">
                   {analysisResult.url} <ExternalLink className="ml-1 h-4 w-4" />
                 </a>
              </CardTitle>
              <CardDescription>Summary of the security analysis for the provided URL. Analyzed on {new Date(analysisResult.timestamp).toLocaleString()}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-md bg-secondary/30 border">
                 <div>
                    <h3 className="text-lg font-semibold mb-1 flex items-center">
                      {getThreatLevelIcon(analysisResult.threatLevel)}
                      <span className="ml-2">AI Threat Assessment</span>
                    </h3>
                    <p className={`text-xl font-bold ${getThreatLevelColor(analysisResult.threatLevel)}`}>
                      {analysisResult.threatLevel ? analysisResult.threatLevel.charAt(0).toUpperCase() + analysisResult.threatLevel.slice(1) : 'Unknown'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{analysisResult.threatDescription || 'No specific threats described.'}</p>
                 </div>
              </div>

               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-md bg-secondary/30 border">
                 <div>
                    <h3 className="text-lg font-semibold mb-1 flex items-center">
                      {getSafetyIndicator(analysisResult.reputationScore)}
                      <span className="ml-2">Domain Reputation: <span className={`${getReputationCategoryColor(analysisResult.reputationScore)} font-semibold`}>{analysisResult.reputationCategory}</span></span>
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">{analysisResult.reputationDescription || 'No reputation details available.'}</p>
                 </div>
                 <div className="text-center w-full sm:w-auto mt-2 sm:mt-0">
                   <div className={`text-3xl font-bold ${getReputationCategoryColor(analysisResult.reputationScore)}`}>{analysisResult.reputationScore ?? '--'} / 100</div>
                   <Progress value={analysisResult.reputationScore} className="w-full sm:w-24 h-2 mt-2" aria-label={`Reputation Score: ${analysisResult.reputationScore ?? 'Unknown'} out of 100`} />
                 </div>
              </div>

              {analysisResult.threatLevel?.toLowerCase() === 'high' && (
                 <Alert variant="destructive">
                   <AlertCircle className="h-4 w-4" />
                   <AlertTitle>High Threat Detected!</AlertTitle>
                   <AlertDescription>
                     This website shows strong indicators of malicious activity. Proceed with extreme caution or avoid visiting.
                   </AlertDescription>
                 </Alert>
              )}
               {analysisResult.threatLevel?.toLowerCase() === 'medium' && (
                 <Alert variant="default" className="bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-300">
                   <AlertCircle className="h-4 w-4" />
                   <AlertTitle>Potential Risk</AlertTitle>
                   <AlertDescription>
                     Some potential risks were detected. Be cautious if you interact with this site.
                   </AlertDescription>
                 </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {analysisHistory.length > 0 && (
          <Card className="w-full max-w-2xl mx-auto shadow-lg mb-12">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center"><History className="mr-2 h-5 w-5"/>Analysis History</CardTitle>
                <CardDescription>Your recent website analyses.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={clearHistory} aria-label="Clear history">
                <Trash2 className="mr-2 h-4 w-4" /> Clear
              </Button>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-4">
                <ul className="space-y-4">
                  {analysisHistory.map((item) => (
                    <li key={item.timestamp}>
                      <Card className="bg-secondary/20 hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                           <div className="flex justify-between items-start">
                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline truncate flex-1 mr-2" title={item.url}>
                                {item.url}
                            </a>
                            <div className="flex items-center text-sm text-muted-foreground">
                                {getThreatLevelIcon(item.threatLevel)}
                                <span className={`ml-1 font-medium ${getThreatLevelColor(item.threatLevel)}`}>{item.threatLevel?.charAt(0).toUpperCase() + item.threatLevel?.slice(1)}</span>
                                <span className="mx-2">|</span>
                                {getSafetyIndicator(item.reputationScore)}
                                <span className={`ml-1 font-medium ${getReputationCategoryColor(item.reputationScore)}`}>{item.reputationScore}/100 ({item.reputationCategory})</span>
                            </div>
                           </div>
                          <p className="text-xs text-muted-foreground pt-1">
                            Analyzed: {new Date(item.timestamp).toLocaleString()}
                          </p>
                        </CardHeader>
                        <CardContent className="pb-3 pt-0">
                           <p className="text-sm text-muted-foreground truncate" title={item.threatDescription}>
                             AI: {item.threatDescription || 'No specific threats described.'}
                           </p>
                           <p className="text-sm text-muted-foreground truncate" title={item.reputationDescription}>
                             Reputation: {item.reputationDescription || 'No reputation details available.'}
                           </p>
                        </CardContent>
                        <CardFooter className="pt-0 pb-3">
                           <Button variant="ghost" size="sm" onClick={() => handleReanalyze(item.url)} className="text-primary hover:text-primary/80">
                             <RotateCcw className="mr-2 h-4 w-4" /> Re-analyze
                           </Button>
                        </CardFooter>
                      </Card>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        <section className="mt-16 text-center py-12 bg-secondary/50 rounded-lg border">
           <h2 className="text-2xl font-semibold mb-4 text-primary">Stay Safe While Browsing</h2>
           <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
             Integrate SecureSurf directly into your browser for real-time protection as you navigate the web. Get instant safety ratings and warnings without needing to manually check URLs.
           </p>
           <Button variant="outline" disabled>
             Browser Extension Coming Soon! <ExternalLink className="ml-2 h-4 w-4" />
           </Button>
           <p className="text-xs text-muted-foreground mt-4">(Browser extension functionality is not implemented in this version)</p>
        </section>
      </main>

      <footer className="border-t">
        <div className="container flex flex-col items-center justify-between gap-4 py-6 md:h-16 md:flex-row md:py-0">
          <div className="text-center text-sm text-muted-foreground md:text-left">
            © {new Date().getFullYear()} SecureSurf. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}