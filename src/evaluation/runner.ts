import { evaluationDataset } from './dataset';
import { compileApplication, CompilerOptions } from '../compiler/index';
import { ValidationError } from '../compiler/validator';

export interface EvalRunResult {
  promptId: string;
  title: string;
  type: 'benchmark' | 'edge_case';
  category: string;
  promptText: string;
  success: boolean;
  durationMs: number;
  retriesUsed: number;
  initialErrorsCount: number;
  costUSD: number;
  unresolvedErrors: string[];
  timestamp: string;
}

export interface EvalSummary {
  totalRuns: number;
  successRate: number;
  averageLatencyMs: number;
  averageRetries: number;
  totalCostUSD: number;
  failuresByType: Record<string, number>;
  detailedResults: EvalRunResult[];
}

// Pricing rates (e.g. Gemini 1.5 Flash rates: $0.075 per 1M input, $0.30 per 1M output tokens)
const INPUT_PRICE_PER_TOKEN = 0.075 / 1000000;
const OUTPUT_PRICE_PER_TOKEN = 0.30 / 1000000;

// Simple characters-to-tokens conversion estimate (average 4 characters per English token)
function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

export async function runEvaluationSuite(
  options: CompilerOptions,
  onProgress?: (index: number, total: number, currentResult: EvalRunResult) => void
): Promise<EvalSummary> {
  const detailedResults: EvalRunResult[] = [];
  let totalCost = 0;
  let totalDuration = 0;
  let successfulRuns = 0;
  let totalRetries = 0;
  const failuresByType: Record<string, number> = {
    syntax: 0,
    dbSchema: 0,
    apiSchema: 0,
    uiSchema: 0,
    authSchema: 0
  };

  const totalPrompts = evaluationDataset.length;

  for (let i = 0; i < totalPrompts; i++) {
    const item = evaluationDataset[i];
    const startTime = Date.now();

    // Setup compilation progress hook (silent for batch evaluation)
    const compilerRes = await compileApplication(
      item.prompt,
      options,
      () => {}
    );

    const endTime = Date.now();
    const duration = endTime - startTime;
    totalDuration += duration;

    // Token Cost Calculations
    // Accumulate total inputs and outputs across all pipeline stages
    let totalInputChars = 0;
    let totalOutputChars = 0;
    
    compilerRes.steps.forEach(step => {
      // Input is user prompt + system prompts
      totalInputChars += (item.prompt.length + 1000); 
      if (step.output) {
        totalOutputChars += step.output.length;
      }
    });

    const inputTokens = estimateTokens(String(totalInputChars));
    const outputTokens = estimateTokens(String(totalOutputChars));
    const cost = (inputTokens * INPUT_PRICE_PER_TOKEN) + (outputTokens * OUTPUT_PRICE_PER_TOKEN);
    totalCost += cost;

    const retries = compilerRes.repairMetrics?.retries || 0;
    totalRetries += retries;

    const success = compilerRes.success;
    if (success) {
      successfulRuns++;
    }

    const unresolvedErrors: string[] = [];
    if (!success && compilerRes.steps) {
      const repairStep = compilerRes.steps.find(s => s.stage === 'repair');
      if (repairStep && repairStep.output) {
        try {
          const errs = JSON.parse(repairStep.output) as ValidationError[];
          errs.forEach(e => {
            unresolvedErrors.push(`[${e.layer}] ${e.error}`);
            failuresByType[e.layer] = (failuresByType[e.layer] || 0) + 1;
          });
        } catch {
          unresolvedErrors.push(repairStep.message);
        }
      }
    }

    const runResult: EvalRunResult = {
      promptId: item.id,
      title: item.title,
      type: item.type,
      category: item.category,
      promptText: item.prompt,
      success,
      durationMs: duration,
      retriesUsed: retries,
      initialErrorsCount: compilerRes.repairMetrics?.initialErrorsCount || 0,
      costUSD: cost,
      unresolvedErrors,
      timestamp: new Date().toISOString()
    };

    detailedResults.push(runResult);

    if (onProgress) {
      onProgress(i + 1, totalPrompts, runResult);
    }
  }

  return {
    totalRuns: totalPrompts,
    successRate: successfulRuns / totalPrompts,
    averageLatencyMs: totalDuration / totalPrompts,
    averageRetries: totalRetries / totalPrompts,
    totalCostUSD: totalCost,
    failuresByType,
    detailedResults
  };
}
