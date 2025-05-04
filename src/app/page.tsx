'use client';

import * as React from 'react';
import { useState } from 'react';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { analyzeWebsiteContent, type AnalyzeWebsiteContentOutput } from '@/ai/flows/analyze-website-content';
import { ShieldCheck, ShieldAlert, ShieldX, ShieldQuestion, Loader2, ExternalLink, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const FormSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid URL (e.g., https://example.com)' }),
});

type AnalysisResult = AnalyzeWebsiteContentOutput & { url: string };

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      url: '',
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    setAnalysisResult(null); // Clear previous results

    try {
      // Fetch website content (placeholder - in a real app, this would be a server-side call for security)
      // For this example, we'll simulate fetching and send a placeholder content.
      // Note: Directly fetching arbitrary URLs client-side is generally insecure and blocked by CORS.
      // This should be handled by a backend endpoint that fetches the content.
      const simulatedContent = `<html><head><title>Example</title></head><body>Example Content for ${data.url}</body></html>`;

      const result = await analyzeWebsiteContent({ url: data.url, content: simulatedContent });
      setAnalysisResult({ ...result, url: data.url });
      toast({
        title: "Analysis Complete",
        description: `Finished analyzing ${data.url}`,
      });
    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysisResult(null);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "Could not analyze the website. Please check the URL or try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const getSafetyIndicator = (score: number | undefined): React.ReactNode => {
    if (score === undefined) return <ShieldQuestion className="h-5 w-5 text-muted-foreground" />;
    if (score >= 80) return <ShieldCheck className="h-5 w-5 text-green-500" />;
    if (score >= 50) return <ShieldAlert className="h-5 w-5 text-yellow-500" />;
    return <ShieldX className="h-5 w-5 text-red-500" />;
  };

  const getThreatLevelColor = (level: string | undefined): string => {
    switch (level?.toLowerCase()) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-blue-500';
      case 'safe': return 'text-green-500';
      default: return 'text-muted-foreground';
    }
  };

  const getThreatLevelIcon = (level: string | undefined): React.ReactNode => {
     switch (level?.toLowerCase()) {
      case 'high': return <ShieldX className="h-5 w-5 text-red-500" />;
      case 'medium': return <ShieldAlert className="h-5 w-5 text-yellow-500" />;
      case 'low': return <ShieldCheck className="h-5 w-5 text-blue-500" />; // Using check for low risk
      case 'safe': return <ShieldCheck className="h-5 w-5 text-green-500" />;
      default: return <ShieldQuestion className="h-5 w-5 text-muted-foreground" />;
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex items-center">
             <ShieldCheck className="h-6 w-6 mr-2 text-primary" />
            <span className="font-bold text-lg">SecureSurf</span>
          </div>
          {/* <nav className="flex items-center space-x-6 text-sm font-medium">
             Could add navigation links here if needed
          </nav> */}
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
          <Card className="w-full max-w-2xl mx-auto shadow-lg animate-in fade-in duration-500">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Analysis Results</span>
                 <a href={analysisResult.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center">
                   {analysisResult.url} <ExternalLink className="ml-1 h-4 w-4" />
                 </a>
              </CardTitle>
              <CardDescription>Summary of the security analysis for the provided URL.</CardDescription>
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
                      <span className="ml-2">Domain Reputation</span>
                    </h3>
                    <p className="text-sm text-muted-foreground">{analysisResult.reputationDescription || 'No reputation details available.'}</p>
                 </div>
                 <div className="text-center w-full sm:w-auto mt-2 sm:mt-0">
                   <div className="text-3xl font-bold">{analysisResult.reputationScore ?? '--'} / 100</div>
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
          {/* <nav className="flex items-center gap-4 text-sm text-muted-foreground md:gap-6">
             Optional footer links
          </nav> */}
        </div>
      </footer>
    </div>
  );
}
