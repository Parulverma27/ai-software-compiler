import { useState, FormEvent } from 'react';
import { Play, Sparkles, Terminal, FileCode, CheckCircle2, AlertCircle, Wrench, RefreshCw } from 'lucide-react';
import { CompilationStep } from '../types/schema';
import { CompilationResult } from '../compiler/index';

interface WorkspaceProps {
  onCompile: (prompt: string, injectFault: boolean) => Promise<CompilationResult>;
  compiling: boolean;
  steps: CompilationStep[];
  result: CompilationResult | null;
  injectFault: boolean;
  setInjectFault: (val: boolean) => void;
  onViewCode: () => void;
  onViewApp: () => void;
}

const TEMPLATES = [
  {
    title: 'Customer CRM System',
    prompt: 'Build a CRM with login, contacts, dashboard, role-based access, and premium plan with payments. Admins can see analytics.'
  },
  {
    title: 'Collaborative Task Planner',
    prompt: 'Build a task management system. Tasks have priority, due date, and status. Users can manage tasks. Admins can view user list and task completion dashboards. Premium users can set task reminders.'
  },
  {
    title: 'E-Commerce Marketplace',
    prompt: 'Build an e-commerce system with products, inventory, order processing, and a checkout flow. Customers can buy, vendors can update stock, admins see revenue charts.'
  }
];

export default function Workspace({
  onCompile,
  compiling,
  steps,
  result,
  injectFault,
  setInjectFault,
  onViewCode,
  onViewApp
}: WorkspaceProps) {
  const [promptText, setPromptText] = useState(TEMPLATES[0].prompt);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!promptText.trim() || compiling) return;
    onCompile(promptText, injectFault);
  };

  const getStepIcon = (status: CompilationStep['status']) => {
    switch (status) {
      case 'running':
        return <RefreshCw className="animate-spin text-indigo" size={16} />;
      case 'success':
        return <CheckCircle2 className="text-emerald" size={16} />;
      case 'error':
        return <AlertCircle className="text-rose" size={16} />;
      case 'pending':
      default:
        return <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--text-muted)' }} />;
    }
  };

  return (
    <div className="workspace-grid">
      
      {/* LEFT: Compiler Console */}
      <div className="glass-card" style={{ height: 'calc(100vh - 120px)' }}>
        <div className="card-header">
          <h2 className="card-title">
            <Sparkles size={18} className="text-indigo" />
            Software Compiler Console
          </h2>
        </div>
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Natural Language Instructions</label>
              <textarea 
                className="textarea-input"
                placeholder="Describe the CRM, Task Manager, or tracking application you want to compile..."
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                disabled={compiling}
                style={{ height: '140px', fontSize: '0.92rem' }}
              />
            </div>

            {/* Template Selector Quick Keys */}
            <div>
              <span className="input-label" style={{ display: 'block', marginBottom: '8px' }}>Load Benchmarks Templates</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '20px' }}
                    onClick={() => setPromptText(tmpl.prompt)}
                    disabled={compiling}
                  >
                    {tmpl.title}
                  </button>
                ))}
              </div>
            </div>

            {/* In-Console Fault Injection Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <input 
                type="checkbox"
                id="workspace-fault-toggle"
                checked={injectFault}
                onChange={(e) => setInjectFault(e.target.checked)}
                disabled={compiling}
                style={{ cursor: 'pointer', width: '16px', height: '16px' }}
              />
              <label htmlFor="workspace-fault-toggle" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                Inject Test Schema Faults (Forces Self-Repair loop)
              </label>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={compiling || !promptText.trim()}
              style={{ width: '100%', height: '48px', gap: '10px' }}
            >
              <Play size={16} fill="white" />
              {compiling ? 'Compiling Pipeline...' : 'Run Software Compiler'}
            </button>
          </form>

          {/* Compilation Summary Stats */}
          {result && (
            <div style={{ padding: '16px', borderRadius: '12px', background: result.success ? 'rgba(16, 185, 129, 0.04)' : 'rgba(239, 68, 68, 0.04)', border: `1px solid ${result.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}`, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                  Compiler Status: {result.success ? 'SUCCESSFUL' : 'FAILED'}
                </span>
                <span className={`badge ${result.success ? 'badge-success' : 'badge-error'}`}>
                  {result.success ? 'Ready to Run' : 'Validation Fail'}
                </span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <div>⏱️ Average Latency: <strong style={{ color: 'var(--text-primary)' }}>{steps.reduce((acc, s) => acc + (s.durationMs || 0), 0)}ms</strong></div>
                <div>💰 Pipeline Cost: <strong style={{ color: 'var(--text-primary)' }}>${result.repairMetrics ? (result.repairMetrics.retries * 0.0004 + 0.0003).toFixed(5) : '0.00030'}</strong></div>
                <div>🛠️ Self-Repairs: <strong style={{ color: 'var(--text-primary)' }}>{result.repairMetrics?.retries || 0} attempts</strong></div>
                <div>📐 Schema Health: <strong style={{ color: 'var(--text-primary)' }}>{result.success ? '100%' : 'Broken'}</strong></div>
              </div>

              {result.success && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  <button className="btn btn-secondary" style={{ flex: 1, padding: '8px 12px', fontSize: '0.78rem', gap: '6px' }} onClick={onViewCode}>
                    <FileCode size={14} /> Inspect JSON
                  </button>
                  <button className="btn btn-primary" style={{ flex: 1, padding: '8px 12px', fontSize: '0.78rem', gap: '6px' }} onClick={onViewApp}>
                    <Play size={12} fill="white" /> Launch Sandbox
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* RIGHT: Step Terminal Logger */}
      <div className="glass-card" style={{ height: 'calc(100vh - 120px)' }}>
        <div className="card-header">
          <h2 className="card-title">
            <Terminal size={18} className="text-indigo" />
            Compiler Compilation Logs
          </h2>
        </div>
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="compiler-log">
            {steps.map((step) => {
              const isOpen = expandedStep === step.stage;
              return (
                <div 
                  key={step.stage} 
                  className={`step-card ${step.status}`}
                  style={{ cursor: step.output ? 'pointer' : 'default' }}
                  onClick={() => step.output && setExpandedStep(isOpen ? null : step.stage)}
                >
                  <div className={`step-icon ${step.status}`}>
                    {getStepIcon(step.status)}
                  </div>
                  <div className="step-details">
                    <div className="step-title-row">
                      <span className="step-title">{step.title}</span>
                      {step.durationMs !== undefined && (
                        <span className="step-duration">{step.durationMs}ms</span>
                      )}
                    </div>
                    <span className="step-message">{step.message}</span>
                    
                    {/* Collapsible output explorer */}
                    {step.output && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: 'var(--color-accent)', marginTop: '6px', fontWeight: 500 }}>
                        {isOpen ? 'Close inspect view' : 'Click to inspect stage payload'}
                      </div>
                    )}

                    {isOpen && step.output && (
                      <pre className="step-output" onClick={(e) => e.stopPropagation()}>
                        {step.output}
                      </pre>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Self Repair Logs explicitly rendered to wow user */}
          {result?.repairMetrics && result.repairMetrics.logs.length > 0 && (
            <div style={{ marginTop: 'auto', border: '1px dashed var(--color-warning)', padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(245, 158, 11, 0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Wrench size={16} className="text-warning" />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-warning)' }}>
                  Self-Repair Engine Diagnostics ({result.repairMetrics.retries} retries)
                </span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '120px', overflowY: 'auto' }}>
                {result.repairMetrics.logs.map((log, idx) => (
                  <div key={idx} style={{ borderLeft: '2px solid rgba(245, 158, 11, 0.3)', paddingLeft: '8px' }}>{log}</div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
