import { runEvaluationSuite } from './runner';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  console.log('Starting evaluation suite run with mock provider...');
  
  const options = {
    providerType: 'mock' as const
  };

  const summary = await runEvaluationSuite(options, (index, total, result) => {
    const status = result.success ? 'success' : 'failed';
    console.log(`[${index}/${total}] ${result.promptId} ... ${status} (${result.durationMs}ms, ${result.retriesUsed} retries)`);
  });

  const outputPath = join(__dirname, 'eval_results_expanded.json');
  writeFileSync(outputPath, JSON.stringify(summary, null, 2), 'utf-8');
  console.log(`\nSuccessfully completed run. Total runs: ${summary.totalRuns}. Success rate: ${summary.successRate * 100}%.`);
  console.log(`Expanded results written to: ${outputPath}`);
}

main().catch(err => {
  console.error('Error running evaluation suite:', err);
  process.exit(1);
});
