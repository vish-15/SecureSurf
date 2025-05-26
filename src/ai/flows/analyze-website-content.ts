
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
    .enum(['superSafe', 'safeBlue', 'moderatelySafe', 'suspiciousYellow', 'unsafeOrange', 'highRisk'])
    .describe('The overall threat level of the website, derived strictly from the domain reputation score range.'),
  threatDescription: z.string().describe('A description of the potential threats found on the website, or a general assessment if no specific threats are found.'),
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
  reputationDescription: z.string().describe('A description of the domain reputation, reflecting the score and category.'),
  overallSafetyCategory: z
    .string()
    .describe('The overall safety category of the website, derived strictly from the domain reputation score range (e.g., "Super Safe", "Safe", "Moderately Safe", "Suspicious", "Unsafe", "High Risk").'),
});
export type AnalyzeWebsiteContentOutput = z.infer<typeof AnalyzeWebsiteContentOutputSchema>;

export async function analyzeWebsiteContent(input: AnalyzeWebsiteContentInput): Promise<AnalyzeWebsiteContentOutput> {
  return analyzeWebsiteContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeWebsiteContentPrompt',
  input: {schema: AnalyzeWebsiteContentInputSchema},
  output: {schema: AnalyzeWebsiteContentOutputSchema},
  prompt: `You are a security expert analyzing websites for malicious content and reputation.

  Your primary task is to determine the \`domainReputationScoreMin\` and \`domainReputationScoreMax\` for the given URL.
  For websites that appear to be legitimate and do not exhibit obvious high-risk indicators (e.g., standard informational sites, blogs, e-commerce platforms), aim for reputation scores that reflect a general assumption of safety (e.g., scores generally above 60-70), unless specific strong negative signals are detected. The range between min and max should capture reasonable uncertainty.

  Once you have determined the score range, you MUST select the \`threatLevel\` and \`overallSafetyCategory\` strictly based on the following score brackets. Use the midpoint or average of your score range for this categorization.
  - Score > 90: \`threatLevel: 'superSafe'\`, \`overallSafetyCategory: 'Super Safe'\`
  - Score 80-90: \`threatLevel: 'safeBlue'\`, \`overallSafetyCategory: 'Safe'\`
  - Score 60-80: \`threatLevel: 'moderatelySafe'\`, \`overallSafetyCategory: 'Moderately Safe'\`
  - Score 40-60: \`threatLevel: 'suspiciousYellow'\`, \`overallSafetyCategory: 'Suspicious'\`
  - Score 25-40: \`threatLevel: 'unsafeOrange'\`, \`overallSafetyCategory: 'Unsafe'\`
  - Score < 25: \`threatLevel: 'highRisk'\`, \`overallSafetyCategory: 'High Risk'\`

  The \`threatDescription\` should summarize any identified risks or provide a general safety assessment.
  The \`reputationDescription\` should briefly explain the reasoning behind the assigned reputation score and category.

  Analyze the content of the following website: URL: {{{url}}}

  Provide your analysis in the specified output format, ensuring strict adherence to the score-based categorization.
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
    if (output && output.domainReputationScoreMax < output.domainReputationScoreMin) {
        output.domainReputationScoreMax = output.domainReputationScoreMin;
    }
    // Additional validation to ensure AI adheres to score bucketing could be added here if needed,
    // but the prompt is made very explicit.
    return output!;
  }
);
