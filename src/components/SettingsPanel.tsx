import { useState, useEffect, FormEvent } from 'react';
import { Key, ShieldAlert, Check } from 'lucide-react';
import { CompilerOptions } from '../compiler/index';

interface SettingsPanelProps {
  options: CompilerOptions;
  onChange: (options: CompilerOptions) => void;
}

export default function SettingsPanel({ options, onChange }: SettingsPanelProps) {
  const [provider, setProvider] = useState<CompilerOptions['providerType']>(options.providerType);
  const [apiKey, setApiKey] = useState(options.apiKey || '');
  const [modelName, setModelName] = useState(options.modelName || '');
  const [injectFault, setInjectFault] = useState(options.injectFault || false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Dynamically set default models
    if (!modelName) {
      if (provider === 'gemini') setModelName('gemini-1.5-flash');
      else if (provider === 'openai') setModelName('gpt-4o-mini');
      else if (provider === 'claude') setModelName('claude-3-5-sonnet-20241022');
      else setModelName('local-mock-pipeline');
    }
  }, [provider]);

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    onChange({
      providerType: provider,
      apiKey: provider === 'mock' ? undefined : apiKey,
      modelName: provider === 'mock' ? 'local-mock-pipeline' : modelName,
      injectFault
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="glass-card" style={{ maxWidth: '650px', margin: '40px auto', width: '100%' }}>
      <div className="card-header">
        <h2 className="card-title">
          <Key size={18} className="text-indigo" />
          Compiler & Provider Settings
        </h2>
      </div>
      <form onSubmit={handleSave} className="card-body">
        
        <div className="input-group">
          <label className="input-label">LLM Provider Gateway</label>
          <select 
            className="select-input" 
            value={provider} 
            onChange={(e) => setProvider(e.target.value as CompilerOptions['providerType'])}
          >
            <option value="mock">Local Mock Mode (Default - No Keys Required)</option>
            <option value="gemini">Google Gemini AI</option>
            <option value="openai">OpenAI GPT</option>
            <option value="claude">Anthropic Claude</option>
          </select>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {provider === 'mock' 
              ? '⚡ Running in zero-latency offline mode. High-fidelity compiled templates will be served instantly.' 
              : `🔗 Direct REST API connection to ${provider}. Your API key is processed client-side and never saved to a remote server.`}
          </p>
        </div>

        {provider !== 'mock' && (
          <>
            <div className="input-group">
              <label className="input-label">Provider API Credentials Key</label>
              <input 
                type="password" 
                className="text-input" 
                placeholder={`Paste your ${provider.toUpperCase()} API key here`}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Model Engine Selector</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="text" 
                  className="text-input" 
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  placeholder="e.g. gemini-1.5-flash"
                  required
                />
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  style={{ whiteSpace: 'nowrap' }}
                  onClick={() => {
                    if (provider === 'gemini') setModelName('gemini-1.5-flash');
                    if (provider === 'openai') setModelName('gpt-4o-mini');
                    if (provider === 'claude') setModelName('claude-3-5-sonnet-20241022');
                  }}
                >
                  Reset Default
                </button>
              </div>
            </div>
          </>
        )}

        <div style={{ margin: '24px 0', padding: '16px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <ShieldAlert className="text-rose" size={24} style={{ flexShrink: 0 }} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Simulation Fault Injection</span>
                <input 
                  type="checkbox" 
                  checked={injectFault} 
                  onChange={(e) => setInjectFault(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                If enabled, the compiler deliberately corrupts Stage 3 schemas by breaking database keys, UI endpoints, and form body validation structures. This demonstrates the **Self-Repair Engine** intercepting the errors, displaying compile warnings, and rewriting the schema back to absolute correctness.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '30px' }}>
          <button type="submit" className="btn btn-primary" style={{ minWidth: '140px' }}>
            {saved ? (
              <>
                <Check size={16} /> Saved!
              </>
            ) : (
              'Save Configurations'
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
