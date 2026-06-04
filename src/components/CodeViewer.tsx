import { useState, useEffect } from 'react';
import { FileJson, Database, Globe, Eye, Shield, Save, CheckCircle, AlertTriangle } from 'lucide-react';
import { AppSchema } from '../types/schema';
import { validateSchema, ValidationError } from '../compiler/validator';

interface CodeViewerProps {
  schema: AppSchema | null;
  onUpdateSchema: (updated: AppSchema) => void;
}

type TabType = 'full' | 'db' | 'api' | 'ui' | 'auth';

export default function CodeViewer({ schema, onUpdateSchema }: CodeViewerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('full');
  const [jsonText, setJsonText] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state with selected tab schema segment
  useEffect(() => {
    if (!schema) return;
    
    let segment: any = schema;
    if (activeTab === 'db') segment = schema.dbSchema;
    else if (activeTab === 'api') segment = schema.apiSchema;
    else if (activeTab === 'ui') segment = schema.uiSchema;
    else if (activeTab === 'auth') segment = schema.authSchema;

    setJsonText(JSON.stringify(segment, null, 2));
    setValidationErrors([]);
  }, [schema, activeTab]);

  if (!schema) {
    return (
      <div className="glass-card" style={{ height: 'calc(100vh - 120px)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <FileJson size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
          <p>No compiled application schema detected.</p>
          <p style={{ fontSize: '0.8rem' }}>Please compile a prompt in the Workspace first.</p>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    try {
      const parsedSegment = JSON.parse(jsonText);
      let updatedSchema = { ...schema };

      // Reassemble main schema based on edited tab
      if (activeTab === 'full') {
        updatedSchema = parsedSegment;
      } else if (activeTab === 'db') {
        updatedSchema.dbSchema = parsedSegment;
      } else if (activeTab === 'api') {
        updatedSchema.apiSchema = parsedSegment;
      } else if (activeTab === 'ui') {
        updatedSchema.uiSchema = parsedSegment;
      } else if (activeTab === 'auth') {
        updatedSchema.authSchema = parsedSegment;
      }

      // Run validators
      const errors = validateSchema(updatedSchema);
      setValidationErrors(errors);

      if (errors.length === 0) {
        onUpdateSchema(updatedSchema);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } catch (e: any) {
      setValidationErrors([
        {
          layer: 'syntax',
          validator: 'JSON Syntactic Parser',
          error: `Invalid JSON syntax: ${e.message}`
        }
      ]);
    }
  };

  const getTabIcon = (tab: TabType) => {
    switch (tab) {
      case 'db': return <Database size={14} />;
      case 'api': return <Globe size={14} />;
      case 'ui': return <Eye size={14} />;
      case 'auth': return <Shield size={14} />;
      case 'full':
      default:
        return <FileJson size={14} />;
    }
  };

  return (
    <div className="workspace-grid" style={{ gridTemplateColumns: '1fr' }}>
      <div className="glass-card" style={{ height: 'calc(100vh - 120px)' }}>
        
        {/* Code Tabs Header */}
        <div className="code-tab-container">
          <div 
            className={`code-tab ${activeTab === 'full' ? 'active' : ''}`}
            onClick={() => setActiveTab('full')}
          >
            {getTabIcon('full')} Unified Config
          </div>
          <div 
            className={`code-tab ${activeTab === 'db' ? 'active' : ''}`}
            onClick={() => setActiveTab('db')}
          >
            {getTabIcon('db')} Database Schema (dbSchema)
          </div>
          <div 
            className={`code-tab ${activeTab === 'api' ? 'active' : ''}`}
            onClick={() => setActiveTab('api')}
          >
            {getTabIcon('api')} API Routes (apiSchema)
          </div>
          <div 
            className={`code-tab ${activeTab === 'ui' ? 'active' : ''}`}
            onClick={() => setActiveTab('ui')}
          >
            {getTabIcon('ui')} Layout & Pages (uiSchema)
          </div>
          <div 
            className={`code-tab ${activeTab === 'auth' ? 'active' : ''}`}
            onClick={() => setActiveTab('auth')}
          >
            {getTabIcon('auth')} Security Policies (authSchema)
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', paddingRight: '12px' }}>
            <button 
              className="btn btn-primary" 
              style={{ padding: '6px 12px', fontSize: '0.78rem', gap: '6px' }}
              onClick={handleSave}
            >
              <Save size={14} /> Save & Re-validate
            </button>
          </div>
        </div>

        {/* Validation Errors Notifications Panel */}
        {validationErrors.length > 0 && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', borderBottom: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px 24px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: 'var(--color-error)', fontSize: '0.85rem' }}>
              <AlertTriangle size={16} /> Compilation Intercepted: {validationErrors.length} Schema Discrepancy Found
            </div>
            <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              {validationErrors.map((err, idx) => (
                <li key={idx}>
                  <strong style={{ color: 'var(--text-primary)' }}>[{err.layer}]</strong> ({err.validator}): {err.error}
                </li>
              ))}
            </ul>
          </div>
        )}

        {saveSuccess && (
          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', borderBottom: '1px solid rgba(16, 185, 129, 0.2)', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: 'var(--color-success)', fontSize: '0.85rem' }}>
            <CheckCircle size={16} /> Schema successfully validated and updated! Preview runtime synchronized.
          </div>
        )}

        {/* Code Editor Area */}
        <textarea
          className="code-block-pre"
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          style={{ 
            border: 'none', 
            outline: 'none', 
            resize: 'none', 
            width: '100%', 
            height: '100%', 
            background: '#04070f',
            padding: '24px',
            color: '#a7b2c6',
            lineHeight: 1.6
          }}
        />
        
      </div>
    </div>
  );
}
