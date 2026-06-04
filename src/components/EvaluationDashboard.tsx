import { useState, Fragment } from 'react';
import { List, Play, CheckCircle, DollarSign, Clock, Wrench } from 'lucide-react';
import cachedResults from '../evaluation/eval_results.json';
import { runEvaluationSuite, EvalSummary, EvalRunResult } from '../evaluation/runner';
import { CompilerOptions } from '../compiler/index';

interface EvaluationDashboardProps {
  compilerOptions: CompilerOptions;
}

export default function EvaluationDashboard({ compilerOptions }: EvaluationDashboardProps) {
  const [summary, setSummary] = useState<EvalSummary>(cachedResults as EvalSummary);
  const [evaluating, setEvaluating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 20 });
  const [selectedRun, setSelectedRun] = useState<EvalRunResult | null>(null);

  const handleRunEvaluation = async () => {
    if (evaluating) return;
    setEvaluating(true);
    setProgress({ current: 0, total: 20 });
    setSelectedRun(null);

    try {
      const liveSummary = await runEvaluationSuite(
        compilerOptions,
        (current, total, runResult) => {
          setProgress({ current, total });
          // Update list incrementally for rich visualization
          setSummary(prev => {
            const list = [...prev.detailedResults];
            const idx = list.findIndex(r => r.promptId === runResult.promptId);
            if (idx !== -1) list[idx] = runResult;
            else list.push(runResult);
            
            // Recompute running summary metrics
            const totalRuns = list.length;
            const successes = list.filter(r => r.success).length;
            const totalDuration = list.reduce((acc, r) => acc + r.durationMs, 0);
            const totalRetries = list.reduce((acc, r) => acc + r.retriesUsed, 0);
            const totalCost = list.reduce((acc, r) => acc + r.costUSD, 0);
            
            return {
              totalRuns,
              successRate: successes / totalRuns,
              averageLatencyMs: totalDuration / totalRuns,
              averageRetries: totalRetries / totalRuns,
              totalCostUSD: totalCost,
              failuresByType: prev.failuresByType,
              detailedResults: list
            };
          });
        }
      );
      setSummary(liveSummary);
    } catch (e) {
      console.error('Live evaluation run error:', e);
    } finally {
      setEvaluating(false);
    }
  };

  // Group stats by Category for comparison charts
  const categories = ['normal', 'vague', 'incomplete', 'conflicting'];
  const categoryStats = categories.map(cat => {
    const runs = summary.detailedResults.filter(r => r.category === cat);
    const successes = runs.filter(r => r.success).length;
    const avgDuration = runs.length > 0 ? Math.round(runs.reduce((acc, r) => acc + r.durationMs, 0) / runs.length) : 0;
    const avgRetries = runs.length > 0 ? (runs.reduce((acc, r) => acc + r.retriesUsed, 0) / runs.length).toFixed(1) : 0;
    
    return {
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
      count: runs.length,
      successRate: runs.length > 0 ? successes / runs.length : 0,
      avgDuration,
      avgRetries
    };
  });

  return (
    <div className="workspace-grid" style={{ gridTemplateColumns: '1fr', padding: '24px', overflowY: 'auto' }}>
      
      {/* Top Controller */}
      <div className="glass-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Compiler Evaluation Framework</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Benchmarking 20 test templates: 10 structured product cases & 10 edge case scenarios.
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {evaluating && (
            <div style={{ fontSize: '0.82rem', color: 'var(--color-accent)', fontWeight: 600 }}>
              🔄 Compiling templates: {progress.current} / {progress.total}
            </div>
          )}
          <button 
            className="btn btn-primary" 
            onClick={handleRunEvaluation} 
            disabled={evaluating}
            style={{ gap: '8px' }}
          >
            <Play size={14} fill="white" />
            {evaluating ? 'Executing Suite...' : 'Trigger Live Evaluation Suite'}
          </button>
        </div>
      </div>

      {/* Progress Track */}
      {evaluating && (
        <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ width: `${(progress.current / progress.total) * 100}%`, height: '100%', backgroundColor: 'var(--color-accent)', transition: 'width 0.2s ease' }}></div>
        </div>
      )}

      {/* Key Metrics Grid */}
      <div className="eval-grid">
        
        <div className="eval-stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="eval-stat-val" style={{ color: 'var(--color-success)' }}>
              {(summary.successRate * 100).toFixed(0)}%
            </span>
            <CheckCircle size={20} className="text-emerald" style={{ opacity: 0.7 }} />
          </div>
          <span className="eval-stat-label">Compile Success Rate</span>
        </div>

        <div className="eval-stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="eval-stat-val">
              {Math.round(summary.averageLatencyMs)}ms
            </span>
            <Clock size={20} className="text-indigo" style={{ opacity: 0.7 }} />
          </div>
          <span className="eval-stat-label">Average Latency</span>
        </div>

        <div className="eval-stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="eval-stat-val" style={{ color: 'var(--color-warning)' }}>
              {summary.averageRetries.toFixed(2)}
            </span>
            <Wrench size={20} className="text-warning" style={{ opacity: 0.7 }} />
          </div>
          <span className="eval-stat-label">Avg Self-Repair Iterations</span>
        </div>

        <div className="eval-stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="eval-stat-val" style={{ color: 'var(--color-purple)' }}>
              ${summary.totalCostUSD.toFixed(5)}
            </span>
            <DollarSign size={20} className="text-purple" style={{ opacity: 0.7 }} />
          </div>
          <span className="eval-stat-label">Total Cost (Gemini pricing)</span>
        </div>

      </div>

      {/* Analytical Comparison Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        
        {/* Chart 1: Latency by category */}
        <div className="glass-card">
          <div className="card-header">
            <h3 className="card-title">
              <Clock size={16} className="text-indigo" />
              Latency Clocks by Prompt Category (ms)
            </h3>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {categoryStats.map(stat => {
              const maxVal = Math.max(...categoryStats.map(s => s.avgDuration), 1000);
              const percentage = (stat.avgDuration / maxVal) * 100;
              return (
                <div key={stat.name} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8rem' }}>
                  <span style={{ width: '90px', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'right' }}>{stat.name}</span>
                  <div style={{ flex: 1, backgroundColor: 'var(--bg-primary)', height: '20px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${percentage}%`, height: '100%', background: 'linear-gradient(90deg, var(--color-accent), var(--color-purple))', borderRadius: '4px' }}></div>
                  </div>
                  <span style={{ width: '60px', color: 'var(--text-primary)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{stat.avgDuration}ms</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Repairs by category */}
        <div className="glass-card">
          <div className="card-header">
            <h3 className="card-title">
              <Wrench size={16} className="text-warning" />
              Average Self-Repairs Needed
            </h3>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {categoryStats.map(stat => {
              const maxVal = Math.max(...categoryStats.map(s => Number(s.avgRetries)), 2);
              const percentage = (Number(stat.avgRetries) / maxVal) * 100;
              return (
                <div key={stat.name} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8rem' }}>
                  <span style={{ width: '90px', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'right' }}>{stat.name}</span>
                  <div style={{ flex: 1, backgroundColor: 'var(--bg-primary)', height: '20px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${percentage}%`, height: '100%', background: 'linear-gradient(90deg, var(--color-warning), var(--color-error))', borderRadius: '4px' }}></div>
                  </div>
                  <span style={{ width: '60px', color: 'var(--text-primary)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{stat.avgRetries} loops</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Trace Log Audit List */}
      <div className="glass-card">
        <div className="card-header">
          <h3 className="card-title">
            <List size={16} className="text-indigo" />
            Evaluation Trace Runs
          </h3>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          
          <div className="eval-table-container">
            <table className="eval-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>ID</th>
                  <th>Test Case Name</th>
                  <th style={{ width: '100px' }}>Category</th>
                  <th style={{ width: '90px' }}>Compile Status</th>
                  <th style={{ width: '90px' }}>Latency</th>
                  <th style={{ width: '80px' }}>Repairs</th>
                  <th style={{ width: '90px' }}>Cost</th>
                </tr>
              </thead>
              <tbody>
                {summary.detailedResults.map(run => (
                  <Fragment key={run.promptId}>
                    <tr 
                      style={{ cursor: 'pointer', backgroundColor: selectedRun?.promptId === run.promptId ? 'rgba(255,255,255,0.02)' : 'transparent' }}
                      onClick={() => setSelectedRun(selectedRun?.promptId === run.promptId ? null : run)}
                    >
                      <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{run.promptId}</td>
                      <td style={{ fontWeight: 600 }}>{run.title}</td>
                      <td>
                        <span className={`badge badge-info`} style={{ textTransform: 'uppercase', fontSize: '0.68rem' }}>
                          {run.category}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${run.success ? 'badge-success' : 'badge-error'}`}>
                          {run.success ? 'Success' : 'Fail'}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{run.durationMs}ms</td>
                      <td style={{ fontFamily: 'var(--font-mono)', textAlign: 'center' }}>{run.retriesUsed}</td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>${run.costUSD.toFixed(5)}</td>
                    </tr>
                    
                    {/* Collapsible Details Row */}
                    {selectedRun?.promptId === run.promptId && (
                      <tr>
                        <td colSpan={7} style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', padding: '20px 24px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div>
                              <strong style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>INSTRUCTIONS PROMPT:</strong>
                              <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '4px' }}>"{run.promptText}"</p>
                            </div>
                            
                            {run.unresolvedErrors.length > 0 ? (
                              <div>
                                <strong style={{ fontSize: '0.8rem', color: 'var(--color-error)' }}>UNRESOLVED COMPILER ERRORS:</strong>
                                <ul style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '20px', marginTop: '4px' }}>
                                  {run.unresolvedErrors.map((err, idx) => (
                                    <li key={idx} style={{ color: 'var(--color-error)' }}>{err}</li>
                                  ))}
                                </ul>
                              </div>
                            ) : (
                              <div>
                                <strong style={{ fontSize: '0.8rem', color: 'var(--color-success)' }}>COMPILER OUTCOMES:</strong>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                  ✓ Compilation succeeded. The programmatic validators returned 0 errors after {run.retriesUsed} repair cycles. The generated schema is fully compatible with the browser sandbox runtime.
                                </p>
                              </div>
                            )}
                            
                            <div style={{ display: 'flex', gap: '20px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              <span>Timestamp: {new Date(run.timestamp).toLocaleString()}</span>
                              <span>Initial discrepancies caught: {run.initialErrorsCount}</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>

    </div>
  );
}
