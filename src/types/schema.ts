export interface TableColumn {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date';
  primaryKey: boolean;
  nullable?: boolean;
  foreignKey?: {
    table: string;
    column: string;
  };
}

export interface TableDefinition {
  name: string;
  description: string;
  columns: TableColumn[];
}

export interface DbSchema {
  tables: TableDefinition[];
}

export interface ApiEndpoint {
  id: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  description: string;
  targetTable: string; // The database table this endpoint interacts with
  dbOperation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  requestParams?: { name: string; type: string; required: boolean }[];
  requestBody?: { name: string; type: string; required: boolean }[];
  responseBody?: { name: string; type: string }[];
}

export interface ApiSchema {
  endpoints: ApiEndpoint[];
}

export type UIComponentType = 'StatCard' | 'DataTable' | 'Form' | 'DetailView' | 'Chart';

export interface UIComponent {
  id: string;
  type: UIComponentType;
  title: string;
  targetTable: string; // The db table it reads/writes
  apiEndpointId: string; // The API it calls to fetch/submit data
  // For Form component
  fields?: { name: string; label: string; type: string; required: boolean }[];
  // For DataTable component
  columns?: { key: string; label: string; type: string }[];
  // For StatCard component
  metricField?: string;
  aggregate?: 'COUNT' | 'SUM' | 'AVG';
  // For Chart component
  chartType?: 'bar' | 'line' | 'pie';
  xAxisKey?: string;
  yAxisKey?: string;
}

export interface PageDefinition {
  id: string;
  title: string;
  route: string;
  layout: 'dashboard' | 'split' | 'single';
  allowedRoles: string[];
  components: UIComponent[];
}

export interface NavigationItem {
  label: string;
  route: string;
  icon: string;
  allowedRoles: string[];
}

export interface UiSchema {
  pages: PageDefinition[];
  navigation: NavigationItem[];
}

export interface RolePermission {
  role: string;
  table: string;
  actions: ('CREATE' | 'READ' | 'UPDATE' | 'DELETE')[];
}

export interface RoutePermission {
  role: string;
  endpointId: string;
  allowed: boolean;
}

export interface BusinessLogicRule {
  id: string;
  name: string;
  description: string;
  endpointId: string;
  condition: string; // e.g. "user.plan === 'premium' || db.contacts.count() < 5"
  errorMessage: string;
}

export interface AuthSchema {
  roles: string[];
  permissions: RolePermission[];
  routePermissions: RoutePermission[];
  businessLogicRules: BusinessLogicRule[];
}

export interface AppSchema {
  metadata: {
    appName: string;
    description: string;
    version: string;
  };
  dbSchema: DbSchema;
  apiSchema: ApiSchema;
  uiSchema: UiSchema;
  authSchema: AuthSchema;
}

export interface CompilationStep {
  stage: 'intent' | 'design' | 'schema' | 'repair' | 'done';
  title: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message: string;
  timestamp: string;
  durationMs?: number;
  output?: string;
}
