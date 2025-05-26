"use client";

import { AlertTriangle, Shield, ShieldAlert, ShieldCheck, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { AnalysisData, ThreatLevel } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

type AnalysisResultsProps = {
  analysis: AnalysisData | null;
  isLoading: boolean;
  error: string | null;
};

const getThreatStyling = (level: ThreatLevel | undefined) => {
  switch (level) {
    case "safe":
      return {
        Icon: ShieldCheck,
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-500",
        borderColor: "border-green-500",
        text: "Safe",
      };
    case "suspicious":
      return {
        Icon: AlertTriangle,
        color: "text-yellow-500 dark:text-yellow-400",
        bgColor: "bg-yellow-500",
        borderColor: "border-yellow-500",
        text: "Suspicious",
      };
    case "dangerous":
      return {
        Icon: ShieldAlert,
        color: "text-destructive",
        bgColor: "bg-destructive",
        borderColor: "border-destructive",
        text: "Dangerous",
      };
    default:
      return {
        Icon: Info,
        color: "text-muted-foreground",
        bgColor: "bg-muted",
        borderColor: "border-muted",
        text: "Unknown",
      };
  }
};

export function AnalysisResults({ analysis, isLoading, error }: AnalysisResultsProps) {
  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Analysis Failed</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!analysis) {
    return null; 
  }

  const { Icon, color, bgColor, text } = getThreatStyling(analysis.threatLevel);

  return (
    <Card className="shadow-lg animate-fadeIn">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <Icon className={`h-10 w-10 ${color}`} />
          <div>
            <CardTitle className={`text-2xl ${color}`}>{text}</CardTitle>
            <CardDescription>Overall Safety Assessment</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Threat Level</h3>
          <p className={`text-lg font-semibold ${color}`}>{analysis.threatLevel.charAt(0).toUpperCase() + analysis.threatLevel.slice(1)}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Summary</h3>
          <p className="text-foreground">{analysis.threatDescription || "No specific threats detailed."}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Domain Reputation ({analysis.domainReputationScore}/100)</h3>
          <Progress value={analysis.domainReputationScore} className={`h-3 ${bgColor ? `[&>div]:bg-[${bgColor}]` : ''}`} indicatorClassName={bgColor} />
          <p className="text-sm text-muted-foreground mt-1">{analysis.reputationDescription || "No reputation details."}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Safety Category</h3>
          <p className="text-foreground">{analysis.overallSafetyCategory}</p>
        </div>
      </CardContent>
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </Card>
  );
}
