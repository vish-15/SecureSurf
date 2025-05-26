
"use client";

import * as React from "react";
import { AlertTriangle, ShieldAlert, ShieldCheck, Info, Award } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { AnalysisData, ThreatLevel as AppThreatLevel } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

type AnalysisResultsProps = {
  analysis: AnalysisData | null;
  isLoading: boolean;
  error: string | null;
};

const getThreatStyling = (level: AppThreatLevel | undefined) => {
  switch (level) {
    case "superSafe":
      return {
        Icon: Award,
        color: "text-[hsl(var(--super-safe-foreground))]",
        indicatorClassName: "bg-[hsl(var(--super-safe-background))]",
        text: "Super Safe",
      };
    case "safeBlue":
    case "safe": // Backward compatibility
      return {
        Icon: ShieldCheck,
        color: "text-[hsl(var(--safe-blue-foreground))]",
        indicatorClassName: "bg-[hsl(var(--safe-blue-background))]",
        text: "Safe",
      };
    case "moderatelySafe":
      return {
        Icon: ShieldCheck, // Changed from AlertTriangle
        color: "text-[hsl(var(--moderate-green-foreground))]",
        indicatorClassName: "bg-[hsl(var(--moderate-green-background))]",
        text: "Moderately Safe",
      };
    case "suspiciousYellow":
    case "suspicious": // Backward compatibility
      return {
        Icon: AlertTriangle,
        color: "text-[hsl(var(--suspicious-yellow-foreground))]", 
        indicatorClassName: "bg-[hsl(var(--suspicious-yellow-background))]",
        text: "Suspicious",
      };
    case "unsafeOrange":
      return {
        Icon: ShieldAlert,
        color: "text-[hsl(var(--unsafe-orange-foreground))]",
        indicatorClassName: "bg-[hsl(var(--unsafe-orange-background))]",
        text: "Unsafe",
      };
    case "highRisk":
    case "dangerous": // Backward compatibility
      return {
        Icon: ShieldAlert,
        color: "text-destructive", 
        indicatorClassName: "bg-destructive",
        text: "High Risk",
      };
    default:
      return {
        Icon: Info,
        color: "text-muted-foreground",
        indicatorClassName: "bg-muted",
        text: "Unknown",
      };
  }
};

export function AnalysisResults({ analysis, isLoading, error }: AnalysisResultsProps) {
  const [displayedScore, setDisplayedScore] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (analysis && analysis.domainReputationScoreMin !== undefined && analysis.domainReputationScoreMax !== undefined) {
      const { domainReputationScoreMin, domainReputationScoreMax } = analysis;
      if (domainReputationScoreMin <= domainReputationScoreMax) {
        const min = Math.max(0, domainReputationScoreMin);
        const max = Math.min(100, domainReputationScoreMax);
        const score = min + Math.random() * (max - min);
        setDisplayedScore(Math.round(score));
      } else {
        setDisplayedScore(Math.round(Math.min(100, Math.max(0, domainReputationScoreMin))));
      }
    } else {
      setDisplayedScore(null);
    }
  }, [analysis]);

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

  const { Icon, color, indicatorClassName, text } = getThreatStyling(analysis.threatLevel);
  const scoreMin = analysis.domainReputationScoreMin ?? 0;

  return (
    <Card className="shadow-lg animate-fadeIn">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <Icon className={`h-10 w-10 ${color}`} />
          <div>
            <CardTitle className={`text-2xl ${color}`}>{text}</CardTitle>
            <CardDescription>Overall Safety Assessment for {analysis.overallSafetyCategory}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Summary</h3>
          <p className="text-foreground">{analysis.threatDescription || "No specific threats detailed."}</p>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-sm font-medium text-muted-foreground">
              Domain Reputation 
            </h3>
            {displayedScore !== null && (
              <span className={`text-2xl font-bold ${color}`}>
                {displayedScore}/100
              </span>
            )}
          </div>
          <Progress value={displayedScore ?? scoreMin} className="h-3" indicatorClassName={indicatorClassName} />
          <p className="text-sm text-muted-foreground mt-1">{analysis.reputationDescription || "No reputation details."}</p>
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
