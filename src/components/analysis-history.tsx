
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { HistoryItem, ThreatLevel as AppThreatLevel } from "@/lib/types"; 
import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, RotateCcw, ShieldAlert, ShieldCheck, Trash2, Info, Award } from "lucide-react";

type AnalysisHistoryProps = {
  history: HistoryItem[];
  onReanalyze: (url: string) => void;
  onClearHistory: () => void;
  isLoading: boolean;
};

const getThreatDetails = (level: AppThreatLevel | undefined) => {
  switch (level) {
    case "superSafe":
      return { IconCmp: Award, colorClass: "text-[hsl(var(--super-safe-foreground))]" };
    case "safeBlue":
    case "safe": // Backward compatibility
      return { IconCmp: ShieldCheck, colorClass: "text-[hsl(var(--safe-blue-foreground))]" };
    case "moderatelySafe":
      return { IconCmp: ShieldCheck, colorClass: "text-[hsl(var(--moderate-green-foreground))]" }; // Changed icon and color
    case "suspiciousYellow":
    case "suspicious": // Backward compatibility
      return { IconCmp: AlertTriangle, colorClass: "text-[hsl(var(--suspicious-yellow-foreground))]" };
    case "unsafeOrange":
      return { IconCmp: ShieldAlert, colorClass: "text-[hsl(var(--unsafe-orange-foreground))]" };
    case "highRisk":
    case "dangerous": // Backward compatibility
      return { IconCmp: ShieldAlert, colorClass: "text-destructive" };
    default:
      return { IconCmp: Info, colorClass: "text-gray-500" };
  }
};

const ThreatIcon = ({ level }: { level: AppThreatLevel | undefined }) => {
  const { IconCmp, colorClass } = getThreatDetails(level);
  return <IconCmp className={`h-5 w-5 ${colorClass}`} />;
};

const getStatusColorClass = (level: AppThreatLevel | undefined) => {
  return getThreatDetails(level).colorClass;
};

export function AnalysisHistory({ history, onReanalyze, onClearHistory, isLoading }: AnalysisHistoryProps) {
  if (!history || history.length === 0) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Analysis History</CardTitle>
          <CardDescription>No analyses performed yet. Enter a URL above to start.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Analysis History</CardTitle>
          <CardDescription>Review your past 10 unique website analyses.</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={onClearHistory} disabled={isLoading}>
          <Trash2 className="mr-2 h-4 w-4" />
          Clear History
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {history.map((item) => {
              const reputationText = (item.domainReputationScoreMin !== undefined && item.domainReputationScoreMax !== undefined)
                ? `${item.domainReputationScoreMin}-${item.domainReputationScoreMax}`
                // @ts-expect-error Property 'domainReputationScore' may not exist on type 'HistoryItem' for new items.
                : item.domainReputationScore?.toString() ?? 'N/A';
              
              const statusColorClass = getStatusColorClass(item.threatLevel);

              return (
                <div key={item.id} className="p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <ThreatIcon level={item.threatLevel} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate text-primary" title={item.url}>{item.url}</p>
                        <p className="text-xs text-muted-foreground">
                          Analyzed {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onReanalyze(item.url)}
                      disabled={isLoading}
                      aria-label={`Re-analyze ${item.url}`}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                  <Separator className="my-2" />
                   <div className="text-xs text-muted-foreground space-y-0.5">
                      <p>Status: <span className={`font-medium ${statusColorClass}`}>{item.overallSafetyCategory}</span></p>
                      <p>Reputation: <span className="font-medium">{reputationText}</span></p>
                      <p className="truncate" title={item.threatDescription}>Summary: {item.threatDescription.length > 60 ? item.threatDescription.substring(0, 60) + '...' : item.threatDescription || 'N/A'}</p>
                   </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
