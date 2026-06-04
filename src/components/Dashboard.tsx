import { useState, useEffect } from 'react';
import { Terminal, FileCode, Play, BarChart, Settings, Bot, Sparkles, AlertCircle } from 'lucide-react';
import Workspace from './Workspace';
import CodeViewer from './CodeViewer';
import RuntimeViewer from './RuntimeViewer';
import EvaluationDashboard from './EvaluationDashboard';
import SettingsPanel from './SettingsPanel';
import { AppSchema, CompilationStep } from '../types/schema';
import { compileApplication, CompilerOptions, CompilationResult } from '../compiler/index';
import { MockProvider } from '../compiler/providers';

type TabType = 'workspace' | 'code' | 'app' | 'eval' | 'settings';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('workspace');
  const [compilerOptions, setCompilerOptions] = useState<CompilerOptions>({
    providerType: 'mock',
    modelName: 'local-mock-pipeline',
    injectFault: false
  });
  
  const [compiledSchema, setCompiledSchema] = useState<AppSchema | null>(null);
  const [compiling, setCompiling] = useState(false);
  const [steps, setSteps] = useState<CompilationStep[]>([]);
  const [compilationResult, setCompilationResult] = useState<CompilationResult | null>(null);
  const [injectFault, setInjectFault] = useState(false);

  // Sync compiler options local storage loading
  useEffect(() => {
    const saved = localStorage.getItem('compiler_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as CompilerOptions;
        setCompilerOptions(parsed);
        setInjectFault(parsed.injectFault || false);
      } catch (e) {
        console.error('Failed to load local storage configurations:', e);
      }
    }

    // Seed default schema on boot so Sandbox Preview and Code Viewer work out-of-the-box
    const mock = new MockProvider();
    // Simulate compilation for CRM prompt to fetch default AppSchema
    const seedDefault = async () => {
      const res = await mock.generate('SCHEMA_GENERATION', 'crm');
      try {
        setCompiledSchema(JSON.parse(res) as AppSchema);
      } catch (err) {
        console.error('Failed to seed default database:', err);
      }
    };
    seedDefault();
  }, []);

  const handleUpdateOptions = (newOptions: CompilerOptions) => {
    setCompilerOptions(newOptions);
    setInjectFault(newOptions.injectFault || false);
    localStorage.setItem('compiler_settings', JSON.stringify(newOptions));
  };

  const handleCompile = async (prompt: string, inject: boolean): Promise<CompilationResult> => {
    setCompiling(true);
    setCompilationResult(null);
    setActiveTab('workspace'); // Move to workspace tab to watch execution

    const currentOptions = { ...compilerOptions, injectFault: inject };

    const result = await compileApplication(
      prompt,
      currentOptions,
      (updatedSteps) => {
        setSteps(updatedSteps);
      }
    );

    setCompiling(false);
    setCompilationResult(result);
    if (result.success && result.schema) {
      setCompiledSchema(result.schema);
    }
    return result;
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'code':
        return (
          <CodeViewer 
            schema={compiledSchema} 
            onUpdateSchema={(updated) => setCompiledSchema(updated)} 
          />
        );
      case 'app':
        return <RuntimeViewer schema={compiledSchema} />;
      case 'eval':
        return <EvaluationDashboard compilerOptions={compilerOptions} />;
      case 'settings':
        return (
          <SettingsPanel 
            options={compilerOptions} 
            onChange={handleUpdateOptions} 
          />
        );
      case 'workspace':
      default:
        return (
          <Workspace 
            onCompile={handleCompile}
            compiling={compiling}
            steps={steps}
            result={compilationResult}
            injectFault={injectFault}
            setInjectFault={setInjectFault}
            onViewCode={() => setActiveTab('code')}
            onViewApp={() => setActiveTab('app')}
          />
        );
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'code': return 'Generated JSON Schema Code';
      case 'app': return 'Sandboxed Dynamic Preview Application';
      case 'eval': return 'Automated Evaluation Suite Metrics';
      case 'settings': return 'Compiler Pipeline Configurations';
      case 'workspace':
      default:
        return 'Software Compilation Workspace';
    }
  };

  return (
    <div className="app-container">
      {/* Background Neon Blurs */}
      <div className="glow-blur glow-blur-1"></div>
      <div className="glow-blur glow-blur-2"></div>

      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-icon">🤖</div>
          <div>
            <div className="logo-text">Antigravity</div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>SOFTWARE COMPILER v1.0</span>
          </div>
        </div>

        <nav className="sidebar-menu">
          <div 
            className={`menu-item ${activeTab === 'workspace' ? 'active' : ''}`}
            onClick={() => setActiveTab('workspace')}
          >
            <Terminal size={18} />
            <span>Workspace</span>
          </div>

          <div 
            className={`menu-item ${activeTab === 'code' ? 'active' : ''}`}
            onClick={() => setActiveTab('code')}
          >
            <FileCode size={18} />
            <span>Schema Inspector</span>
          </div>

          <div 
            className={`menu-item ${activeTab === 'app' ? 'active' : ''}`}
            onClick={() => setActiveTab('app')}
          >
            <Play size={18} />
            <span>Sandbox Preview</span>
          </div>

          <div 
            className={`menu-item ${activeTab === 'eval' ? 'active' : ''}`}
            onClick={() => setActiveTab('eval')}
          >
            <BarChart size={18} />
            <span>Evaluation Suite</span>
          </div>

          <div 
            className={`menu-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={18} />
            <span>Settings Panel</span>
          </div>
        </nav>

        {/* Sidebar Footer Info */}
        <div className="sidebar-footer">
          <div className="settings-summary">
            <Bot size={16} className="text-indigo" />
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Mode: <strong>{compilerOptions.providerType.toUpperCase()}</strong>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <main className="main-content">
        <header className="top-nav">
          <div className="page-title">
            <Sparkles size={18} className="text-indigo" />
            <span>{getPageTitle()}</span>
          </div>
          <div className="top-actions">
            {compilerOptions.injectFault && (
              <span className="badge badge-warning" style={{ gap: '4px', display: 'flex', alignItems: 'center' }}>
                <AlertCircle size={12} /> Fault Simulation Active
              </span>
            )}
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Environment: <strong style={{ color: 'var(--text-primary)' }}>LocalStorage Sandbox</strong>
            </span>
          </div>
        </header>

        {/* Active Panel Body View */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          {renderActiveTabContent()}
        </div>
      </main>
    </div>
  );
}
