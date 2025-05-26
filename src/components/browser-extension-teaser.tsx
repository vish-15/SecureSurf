
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap } from "lucide-react";

export function BrowserExtensionTeaser() {
  return (
    <Card className="shadow-lg overflow-hidden">
      <div> {/* Children will stack vertically */}
        <div> {/* Text content container, will take full width */}
          <CardHeader>
            <div className="flex items-center text-primary mb-2">
              <Zap className="h-6 w-6 mr-2" />
              <CardTitle className="text-2xl">Browse smarter, surf securely</CardTitle>
            </div>
            <CardDescription className="text-base">
              Get real-time protection with the upcoming SecureSurf browser extension. Automatic threat detection, instant alerts, and peace of mind as you browse.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mb-6">
              <li>Instant website safety checks</li>
              <li>Proactive phishing and malware blocking</li>
              <li>Seamless integration with your browser</li>
            </ul>
            <Button variant="default" size="lg" disabled>
              Coming Soon!
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Sign up for updates (feature not yet available).
            </p>
          </CardContent>
        </div>
        {/* Image container removed */}
      </div>
    </Card>
  );
}

