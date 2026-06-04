import { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Briefcase, Key, Shield, RefreshCw, Plus, Trash2, Search, X, CheckSquare, ShoppingBag, Folder, TrendingUp } from 'lucide-react';
import { AppSchema, UIComponent } from '../types/schema';
import { VirtualDatabase } from '../runtime/database';
import { VirtualApiClient, ActiveUser } from '../runtime/apiClient';
import { generateMockUsers } from '../runtime/auth';

interface RuntimeViewerProps {
  schema: AppSchema | null;
}

export default function RuntimeViewer({ schema }: RuntimeViewerProps) {
  const [db, setDb] = useState<VirtualDatabase | null>(null);
  const [api, setApi] = useState<VirtualApiClient | null>(null);
  const [mockUsers, setMockUsers] = useState<ActiveUser[]>([]);
  const [currentUser, setCurrentUser] = useState<ActiveUser | null>(null);
  const [currentPath, setCurrentPath] = useState('/');
  const [dbRefreshTrigger, setDbRefreshTrigger] = useState(0);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Initialize DB, API Client, and Simulated User list from compiled schemas
  useEffect(() => {
    if (!schema) return;
    const vdb = new VirtualDatabase(schema.metadata.appName, schema.dbSchema);
    const client = new VirtualApiClient(schema, vdb);
    const users = generateMockUsers(schema.authSchema.roles);
    
    setDb(vdb);
    setApi(client);
    setMockUsers(users);
    setCurrentUser(users[0] || null);
    setCurrentPath('/');
    setDbRefreshTrigger(0);
  }, [schema]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleResetDb = () => {
    if (db) {
      db.resetDatabase();
      setDbRefreshTrigger(prev => prev + 1);
      showNotification('success', 'Virtual database reset and re-seeded successfully.');
    }
  };

  if (!schema || !db || !api || !currentUser) {
    return (
      <div className="glass-card" style={{ height: 'calc(100vh - 120px)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw size={48} className="animate-spin" style={{ marginBottom: '16px', opacity: 0.3 }} />
          <p>Initializing sandbox runtime player...</p>
        </div>
      </div>
    );
  }

  // Get pages from UI Schema
  const pages = schema.uiSchema.pages || [];
  const activePage = pages.find(p => p.route === currentPath);

  // Check if active user role can view this page
  const hasPageAccess = activePage && activePage.allowedRoles.includes(currentUser.role);

  // Render navigation icon dynamically
  const getNavIcon = (iconName: string) => {
    switch (iconName) {
      case 'LayoutDashboard': return <LayoutDashboard size={18} />;
      case 'Users': return <Users size={18} />;
      case 'Briefcase': return <Briefcase size={18} />;
      case 'CheckSquare': return <CheckSquare size={18} />;
      case 'ShoppingBag': return <ShoppingBag size={18} />;
      case 'TrendingUp': return <TrendingUp size={18} />;
      case 'Folder':
      default:
        return <Folder size={18} />;
    }
  };

  return (
    <div className="runtime-frame">
      {/* Dynamic Notifications Alerts */}
      {notification && (
        <div className={`runtime-notification ${notification.type}`}>
          {notification.type === 'success' ? <CheckSquare size={18} /> : <Shield size={18} />}
          <span>{notification.message}</span>
          <button style={{ marginLeft: '10px', opacity: 0.7, cursor: 'pointer' }} onClick={() => setNotification(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Browser Bar */}
      <div className="runtime-browser-bar">
        <div className="browser-dots">
          <span className="browser-dot browser-dot-red"></span>
          <span className="browser-dot browser-dot-yellow"></span>
          <span className="browser-dot browser-dot-green"></span>
        </div>
        
        {/* URL Bar */}
        <div className="browser-address-bar">
          <Key size={12} />
          <span>https://virtual-sandbox.io{currentPath}</span>
        </div>

        {/* User Persona Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>Switch Role Profile:</span>
          <select 
            style={{ fontSize: '0.78rem', padding: '4px 8px', borderRadius: '4px', backgroundColor: 'white', border: '1px solid #cbd5e1', color: '#1e293b', fontWeight: 500 }}
            value={currentUser.id}
            onChange={(e) => {
              const u = mockUsers.find(mu => mu.id === e.target.value);
              if (u) setCurrentUser(u);
            }}
          >
            {mockUsers.map(u => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role}) — {u.plan.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* DB Action Button */}
        <button 
          onClick={handleResetDb} 
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', padding: '4px 10px', backgroundColor: '#64748b', color: 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
        >
          <RefreshCw size={12} /> Reset DB
        </button>
      </div>

      {/* Sandbox Application Interface */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        
        {/* Virtual Application Sidebar */}
        <div style={{ width: '220px', backgroundColor: '#0f172a', color: '#94a3b8', borderRight: '1px solid #334155', display: 'flex', flexDirection: 'column', padding: '16px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 8px 16px 8px', borderBottom: '1px solid #1e293b', marginBottom: '16px' }}>
            <div style={{ width: 24, height: 24, borderRadius: 4, background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem', fontWeight: 800 }}>V</div>
            <span style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {schema.metadata.appName}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
            {schema.uiSchema.navigation.map((nav, idx) => {
              // Navigation visibility check: hide nav items restricted by role
              const hasNavAccess = nav.allowedRoles.includes(currentUser.role);
              if (!hasNavAccess) return null;

              const isActive = currentPath === nav.route;
              return (
                <div
                  key={idx}
                  onClick={() => setCurrentPath(nav.route)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    color: isActive ? 'white' : '#94a3b8',
                    backgroundColor: isActive ? '#1e293b' : 'transparent',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {getNavIcon(nav.icon)}
                  <span>{nav.label}</span>
                </div>
              );
            })}
          </div>

          <div style={{ padding: '12px 8px', borderTop: '1px solid #1e293b', fontSize: '0.75rem', color: '#64748b' }}>
            🔐 Active Role Mode:<br />
            <strong style={{ color: '#cbd5e1' }}>{currentUser.role}</strong>
          </div>
        </div>

        {/* Virtual Application Main Screen */}
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>
              {activePage ? activePage.title : 'Page Not Found'}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#64748b' }}>
              <span>Status:</span>
              <span className="badge badge-success">Compiled & Live</span>
            </div>
          </div>

          {/* Access Denied Shield */}
          {!hasPageAccess ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', border: '1px solid #fecdd3', borderRadius: '12px', backgroundColor: '#fff1f2', color: '#be123c', maxWidth: '500px', margin: '40px auto' }}>
              <Shield size={48} style={{ margin: '0 auto 16px auto', color: '#e11d48' }} />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>Security: Access Denied</h2>
              <p style={{ fontSize: '0.88rem' }}>
                Your current role <strong>{currentUser.role}</strong> does not have authorization to view the page at <code>{currentPath}</code>.
              </p>
              <p style={{ fontSize: '0.78rem', color: '#be123c', marginTop: '6px' }}>
                Switch your user role in the top header selector to access this resource.
              </p>
            </div>
          ) : (
            // Page Components Grid Render
            <div style={{
              display: 'grid',
              gridTemplateColumns: activePage.layout === 'split' ? '1.4fr 1fr' : '1fr',
              gap: '24px'
            }}>
              
              {/* Render StatCards at the top of Dashboard layouts */}
              {activePage.layout === 'dashboard' && (
                <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                  {activePage.components.filter(c => c.type === 'StatCard').map(comp => (
                    <RuntimeStatCard key={comp.id} component={comp} api={api} trigger={dbRefreshTrigger} />
                  ))}
                </div>
              )}

              {/* Main Content Component List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {activePage.components.filter(c => c.type !== 'StatCard').map(comp => {
                  if (comp.type === 'DataTable') {
                    return (
                      <RuntimeDataTable 
                        key={comp.id} 
                        component={comp} 
                        api={api} 
                        user={currentUser} 
                        trigger={dbRefreshTrigger} 
                        onRefresh={() => setDbRefreshTrigger(p => p + 1)}
                        showNotification={showNotification}
                      />
                    );
                  }
                  if (comp.type === 'Chart') {
                    return (
                      <RuntimeChart 
                        key={comp.id} 
                        component={comp} 
                        api={api} 
                        trigger={dbRefreshTrigger} 
                      />
                    );
                  }
                  return null;
                })}
              </div>

              {/* Sidebar Component (Forms in splits) */}
              {activePage.layout === 'split' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {activePage.components.filter(c => c.type === 'Form').map(comp => (
                    <RuntimeForm 
                      key={comp.id} 
                      component={comp} 
                      api={api} 
                      user={currentUser} 
                      onSuccess={() => {
                        setDbRefreshTrigger(p => p + 1);
                        showNotification('success', `Record logged successfully.`);
                      }}
                      onFailure={(err) => showNotification('error', err)}
                    />
                  ))}
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// SUB COMPONENT: RUNTIME STAT CARD
// ----------------------------------------------------------------------
function RuntimeStatCard({ component, api, trigger }: { component: UIComponent; api: VirtualApiClient; trigger: number }) {
  const [value, setValue] = useState<number | string>('...');

  useEffect(() => {
    let active = true;
    const fetchStat = async () => {
      // Query table
      const res = await api.request(component.apiEndpointId, {}, { id: 'admin', name: 'admin', role: 'Admin', plan: 'premium' });
      if (!active) return;
      if (res.status === 200 && Array.isArray(res.data)) {
        const dataList = res.data;
        const field = component.metricField || 'id';
        const agg = component.aggregate || 'COUNT';

        if (agg === 'COUNT') {
          setValue(dataList.length);
        } else if (agg === 'SUM') {
          const sum = dataList.reduce((acc, row) => acc + (Number(row[field]) || 0), 0);
          setValue(sum.toLocaleString());
        } else if (agg === 'AVG') {
          const sum = dataList.reduce((acc, row) => acc + (Number(row[field]) || 0), 0);
          const avg = dataList.length > 0 ? (sum / dataList.length).toFixed(1) : 0;
          setValue(avg);
        }
      } else {
        setValue('ERR');
      }
    };
    fetchStat();
    return () => { active = false; };
  }, [component, trigger]);

  return (
    <div style={{ padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>{component.title}</span>
      <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-mono)' }}>{value}</span>
    </div>
  );
}

// ----------------------------------------------------------------------
// SUB COMPONENT: RUNTIME DATA TABLE
// ----------------------------------------------------------------------
interface TableProps {
  component: UIComponent;
  api: VirtualApiClient;
  user: ActiveUser;
  trigger: number;
  onRefresh: () => void;
  showNotification: (type: 'success' | 'error', msg: string) => void;
}

function RuntimeDataTable({ component, api, user, trigger, onRefresh, showNotification }: TableProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg(null);
    const filterPayload = searchTerm ? { name: searchTerm } : {};
    const res = await api.request(component.apiEndpointId, filterPayload, user);
    
    if (res.status === 200) {
      setData(res.data || []);
    } else {
      setErrorMsg(res.error || 'Failed to pull dataset.');
      setData([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [component, trigger, user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    
    // Find delete endpoint
    const deleteEpId = `delete-${component.targetTable.replace(/s$/, '')}`;
    const res = await api.request(deleteEpId, { id }, user);
    if (res.status === 200) {
      showNotification('success', 'Record deleted successfully.');
      onRefresh();
    } else {
      showNotification('error', res.error || 'Deleter policy failed.');
    }
  };

  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: 'white', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      
      {/* Title + Search */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{component.title}</h3>
        
        <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '4px 10px', gap: '6px' }}>
          <Search size={14} style={{ color: '#64748b' }} />
          <input 
            type="text" 
            placeholder="Search records..." 
            style={{ fontSize: '0.78rem', color: '#1e293b', border: 'none', outline: 'none' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && <X size={12} style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => { setSearchTerm(''); setTimeout(fetchData, 10); }} />}
        </form>
      </div>

      {errorMsg ? (
        <div style={{ padding: '30px', textAlign: 'center', color: '#e11d48', fontSize: '0.85rem', fontWeight: 500 }}>
          ⚠️ API Fetch Denied: {errorMsg}
        </div>
      ) : loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '0.82rem' }}>
          Querying virtual endpoint...
        </div>
      ) : data.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '0.82rem' }}>
          No records matched filters in table '{component.targetTable}'.
        </div>
      ) : (
        /* Actual Grid */
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#475569' }}>
                {component.columns?.map(col => (
                  <th key={col.key} style={{ padding: '12px 20px', fontWeight: 600 }}>{col.label}</th>
                ))}
                <th style={{ padding: '12px 20px', fontWeight: 600, width: '80px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={row.id || idx} style={{ borderBottom: '1px solid #f1f5f9', color: '#0f172a' }}>
                  {component.columns?.map(col => (
                    <td key={col.key} style={{ padding: '12px 20px' }}>
                      {col.type === 'date' && row[col.key] 
                        ? new Date(row[col.key]).toISOString().split('T')[0] 
                        : String(row[col.key] || '')}
                    </td>
                  ))}
                  <td style={{ padding: '12px 20px', display: 'flex', justifyContent: 'center' }}>
                    <button 
                      onClick={() => handleDelete(row.id)}
                      style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center', transition: 'all 0.15s ease' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// SUB COMPONENT: RUNTIME FORM
// ----------------------------------------------------------------------
interface FormProps {
  component: UIComponent;
  api: VirtualApiClient;
  user: ActiveUser;
  onSuccess: () => void;
  onFailure: (err: string) => void;
}

function RuntimeForm({ component, api, user, onSuccess, onFailure }: FormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Clear form
    setFormData({});
  }, [component]);

  const handleChange = (name: string, value: any, type: string) => {
    let cleanVal = value;
    if (type === 'number') {
      cleanVal = value === '' ? '' : Number(value);
    }
    setFormData(prev => ({ ...prev, [name]: cleanVal }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const res = await api.request(component.apiEndpointId, formData, user);
    setSubmitting(false);

    if (res.status === 201) {
      setFormData({});
      onSuccess();
    } else {
      onFailure(res.error || 'Endpoint rejected submission.');
    }
  };

  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: 'white', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
        {component.title}
      </h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {component.fields?.map(field => (
          <div key={field.name} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>
              {field.label} {field.required && <strong style={{ color: '#ef4444' }}>*</strong>}
            </label>
            <input 
              type={field.type === 'number' ? 'number' : 'text'}
              style={{ fontSize: '0.82rem', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', width: '100%', outline: 'none', color: '#1e293b' }}
              value={formData[field.name] === undefined ? '' : formData[field.name]}
              onChange={(e) => handleChange(field.name, e.target.value, field.type)}
              required={field.required}
            />
          </div>
        ))}
        
        <button 
          type="submit" 
          disabled={submitting}
          style={{ 
            marginTop: '10px', 
            padding: '10px 16px', 
            borderRadius: '6px', 
            backgroundColor: '#6366f1', 
            color: 'white', 
            fontWeight: 600, 
            fontSize: '0.82rem', 
            border: 'none', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '8px', 
            boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.2)' 
          }}
        >
          <Plus size={16} />
          {submitting ? 'Submitting...' : 'Submit Entry'}
        </button>
      </form>
    </div>
  );
}

// ----------------------------------------------------------------------
// SUB COMPONENT: RUNTIME CUSTOM SVG CHART
// ----------------------------------------------------------------------
function RuntimeChart({ component, api, trigger }: { component: UIComponent; api: VirtualApiClient; trigger: number }) {
  const [chartData, setChartData] = useState<{ x: string; y: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchChartData = async () => {
      setLoading(true);
      const res = await api.request(component.apiEndpointId, {}, { id: 'admin', name: 'admin', role: 'Admin', plan: 'premium' });
      if (!active) return;

      if (res.status === 200 && Array.isArray(res.data)) {
        const xKey = component.xAxisKey || 'title';
        const yKey = component.yAxisKey || 'value';

        const mapped = res.data.map(row => ({
          x: String(row[xKey] || 'Item'),
          y: Number(row[yKey]) || 10
        }));
        setChartData(mapped);
      } else {
        setChartData([]);
      }
      setLoading(false);
    };

    fetchChartData();
    return () => { active = false; };
  }, [component, trigger]);

  const maxVal = Math.max(...chartData.map(d => d.y), 10);

  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: 'white', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>{component.title}</h3>
      
      {loading ? (
        <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: '#64748b' }}>
          Loading chart metrics...
        </div>
      ) : chartData.length === 0 ? (
        <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: '#64748b' }}>
          No data values plotted.
        </div>
      ) : (
        /* Custom Flex bar visualization representing dynamic dashboard aesthetics */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {chartData.map((d, idx) => {
            const percent = Math.max((d.y / maxVal) * 100, 5); // min 5% bar
            return (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.78rem' }}>
                <span style={{ width: '130px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', color: '#475569', fontWeight: 500, textAlign: 'right' }}>
                  {d.x}
                </span>
                <div style={{ flex: 1, backgroundColor: '#f1f5f9', height: '18px', borderRadius: '3px', overflow: 'hidden', position: 'relative' }}>
                  <div style={{ width: `${percent}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #a855f7)', borderRadius: '3px', transition: 'width 0.4s ease-in-out' }}></div>
                </div>
                <span style={{ width: '60px', color: '#0f172a', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  {d.y.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
