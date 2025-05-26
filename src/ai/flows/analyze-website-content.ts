
'use server';
/**
 * @fileOverview Analyzes website content for malicious activities.
 *
 * - analyzeWebsiteContent - A function that analyzes website content for potential threats.
 * - AnalyzeWebsiteContentInput - The input type for the analyzeWebsiteContent function.
 * - AnalyzeWebsiteContentOutput - The return type for the analyzeWebsiteContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeWebsiteContentInputSchema = z.object({
  url: z.string().url().describe('The URL of the website to analyze.'),
});
export type AnalyzeWebsiteContentInput = z.infer<typeof AnalyzeWebsiteContentInputSchema>;

const AnalyzeWebsiteContentOutputSchema = z.object({
  threatLevel: z
    .enum(['safe', 'suspicious', 'dangerous'])
    .describe('The overall threat level of the website.'),
  threatDescription: z.string().describe('A description of the potential threats found on the website.'),
  domainReputationScoreMin: z
    .number()
    .min(0)
    .max(100)
    .describe('The minimum estimated domain reputation score, from 0 to 100. This represents the most pessimistic, yet plausible, score.'),
  domainReputationScoreMax: z
    .number()
    .min(0)
    .max(100)
    .describe('The maximum estimated domain reputation score, from 0 to 100. This represents the most optimistic, yet plausible, score. Ensure this value is greater than or equal to domainReputationScoreMin.'),
  reputationDescription: z.string().describe('A description of the domain reputation.'),
  overallSafetyCategory: z
    .string()
    .describe('The overall safety category of the website, e.g., "Phishing", "Malware", "Safe".'),
});
export type AnalyzeWebsiteContentOutput = z.infer<typeof AnalyzeWebsiteContentOutputSchema>;

export async function analyzeWebsiteContent(input: AnalyzeWebsiteContentInput): Promise<AnalyzeWebsiteContentOutput> {
  return analyzeWebsiteContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeWebsiteContentPrompt',
  input: {schema: AnalyzeWebsiteContentInputSchema},
  output: {schema: AnalyzeWebsiteContentOutputSchema},
  prompt: `You are a security expert analyzing websites for malicious content.

  Analyze the content of the following website for phishing attempts, malware distribution, and other malicious activities.

  URL: {{{url}}}

  Based on your analysis, provide the following information:

  - threatLevel: The overall threat level of the website (safe, suspicious, or dangerous).
  - threatDescription: A description of the potential threats found on the website.
  - domainReputationScoreMin: The lower bound of the estimated domain reputation score (0-100). This represents the most pessimistic, yet plausible, score.
  - domainReputationScoreMax: The upper bound of the estimated domain reputation score (0-100). This represents the most optimistic, yet plausible, score. Ensure this value is greater than or equal to domainReputationScoreMin. The range between min and max should reflect typical variability or confidence in the assessment.
  - reputationDescription: A description of the domain reputation.
  - overallSafetyCategory: The overall safety category of the website (e.g., "Phishing", "Malware", "Safe").

  Ensure that the threatLevel accurately reflects the severity of the identified threats, and that the descriptions are clear and concise.
  `,
});

const analyzeWebsiteContentFlow = ai.defineFlow(
  {
    name: 'analyzeWebsiteContentFlow',
    inputSchema: AnalyzeWebsiteContentInputSchema,
    outputSchema: AnalyzeWebsiteContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    // Ensure max is not less than min, if AI fails to follow instruction
    if (output && output.domainReputationScoreMax < output.domainReputationScoreMin) {
        // Swap them or set max to min
        output.domainReputationScoreMax = output.domainReputationScoreMin;
    }
    return output!;
  }
);
