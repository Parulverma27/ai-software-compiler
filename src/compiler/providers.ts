import { AppSchema } from '../types/schema';

export interface LLMProvider {
  generate(systemPrompt: string, userPrompt: string): Promise<string>;
}

// REST call to Google Gemini API
export class GeminiProvider implements LLMProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'gemini-1.5-flash') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generate(systemPrompt: string, userPrompt: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { text: `${systemPrompt}\n\nUser Request: ${userPrompt}` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('Empty response from Gemini API');
    }
    return text;
  }
}

// REST call to OpenAI API
export class OpenAIProvider implements LLMProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'gpt-4o-mini') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generate(systemPrompt: string, userPrompt: string): Promise<string> {
    const url = 'https://api.openai.com/v1/chat/completions';
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) {
      throw new Error('Empty response from OpenAI API');
    }
    return text;
  }
}

// REST call to Anthropic Claude API
export class ClaudeProvider implements LLMProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'claude-3-5-sonnet-20241022') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generate(systemPrompt: string, userPrompt: string): Promise<string> {
    const url = 'https://api.anthropic.com/v1/messages';
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'dangerously-allow-html-user-aspect': 'true' // In front-ends
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 4000,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text;
    if (!text) {
      throw new Error('Empty response from Claude API');
    }
    return text;
  }
}

// Mock Provider which holds high-fidelity offline schemas and fallbacks
export class MockProvider implements LLMProvider {
  async generate(systemPrompt: string, userPrompt: string): Promise<string> {
    // Artificial latency to simulate compiler thinking
    await new Promise(resolve => setTimeout(resolve, 800));

    const promptLower = userPrompt.toLowerCase();
    
    // Stage 1: Intent Extraction Check
    if (systemPrompt.includes('INTENT_EXTRACTION')) {
      if (promptLower.includes('crm') || promptLower.includes('contact')) {
        return JSON.stringify({
          appName: 'Customer Relationship Manager',
          description: 'A premium CRM application for tracking contacts, deals, and analytics, featuring payment gating for premium plans and role-based permissions.',
          roles: ['Admin', 'Sales Manager', 'General Agent'],
          entities: ['users', 'contacts', 'deals', 'payments'],
          requirements: [
            'User login and roles',
            'Contact management (CRUD)',
            'Deal tracking and pipeline aggregates',
            'Admin analytics dashboard',
            'Premium payment plan gating'
          ],
          ambiguities: [
            'How is the user designated as Premium? (Assumed: a boolean field `isPremium` in `users` or linked to active payments).'
          ]
        }, null, 2);
      }
      
      if (promptLower.includes('task') || promptLower.includes('todo')) {
        return JSON.stringify({
          appName: 'TaskSync Enterprise',
          description: 'A task management system featuring custom priorities, categories, task creation, admin dashboards, and premium reminders.',
          roles: ['Admin', 'Member', 'Guest'],
          entities: ['users', 'tasks', 'reminders'],
          requirements: [
            'User accounts with roles',
            'Task tracking with status, due date, and priority',
            'Admin dashboard for task completion rates',
            'Premium reminder settings'
          ],
          ambiguities: [
            'Can guests create tasks? (Assumed: Guests can read-only, Members can create/edit tasks, Admins manage users).'
          ]
        }, null, 2);
      }

      if (promptLower.includes('shop') || promptLower.includes('e-commerce') || promptLower.includes('store') || promptLower.includes('product')) {
        return JSON.stringify({
          appName: 'VendFlow Market',
          description: 'An e-commerce management application linking product listings, inventory control, and customer orders with role gating.',
          roles: ['Admin', 'Vendor', 'Customer'],
          entities: ['users', 'products', 'orders', 'inventory'],
          requirements: [
            'Customer product listings and cart checkout',
            'Vendor inventory updates and product management',
            'Admin sales and revenue analytics'
          ],
          ambiguities: [
            'Are customers allowed to view other vendors\' stocks directly? (Assumed: Customers can view general product stock count, Vendors manage their own items).'
          ]
        }, null, 2);
      }

      // Default fallback Intent
      const appName = userPrompt.split(' ').slice(1, 4).join(' ') || 'Custom Schema Application';
      return JSON.stringify({
        appName: appName.charAt(0).toUpperCase() + appName.slice(1),
        description: `Custom app compiled from: "${userPrompt}"`,
        roles: ['Admin', 'Member'],
        entities: ['users', 'items', 'logs'],
        requirements: ['Authentication', 'CRUD on items', 'Admin logs list'],
        ambiguities: ['No specific entities listed; generated default items database tables.']
      }, null, 2);
    }

    // Stage 2: System Design Check
    if (systemPrompt.includes('SYSTEM_DESIGN')) {
      // Return architecture blueprints
      return JSON.stringify({
        architectureType: 'Relational CRUD Application',
        databaseEngine: 'SQLite / Virtual localStorage',
        componentsLayout: 'Sidebar Navigation + Main Content Area',
        designDecision: 'Normalized tables with cascade delete on user deletion. API paths mapped to standard REST endpoints.'
      }, null, 2);
    }

    // Stage 3: Schema Generation Check
    if (systemPrompt.includes('SCHEMA_GENERATION')) {
      if (promptLower.includes('crm') || promptLower.includes('contact')) {
        return JSON.stringify(crmSchema, null, 2);
      }
      if (promptLower.includes('task') || promptLower.includes('todo')) {
        return JSON.stringify(tasksSchema, null, 2);
      }
      if (promptLower.includes('shop') || promptLower.includes('e-commerce') || promptLower.includes('store') || promptLower.includes('product')) {
        return JSON.stringify(ecommerceSchema, null, 2);
      }
      
      // Fallback dynamic generator
      return JSON.stringify(getFallbackSchema(userPrompt), null, 2);
    }

    // Stage 4: Repair Engine Prompt
    if (systemPrompt.includes('REPAIR_ENGINE')) {
      // The user wants us to fix a schema section. We extract the original, apply the fix, and return.
      // For mock purposes, if we are in repair mode, it means a validation failed.
      // We will parse the incorrect schema and return it corrected.
      // Let's assume it fixes whatever was broken.
      try {
        const errorDetails = JSON.parse(userPrompt);
        return JSON.stringify(errorDetails.originalSchema, null, 2);
      } catch {
        return userPrompt;
      }
    }

    return '{}';
  }
}

// Pre-compiled High Fidelity CRM Schema
const crmSchema: AppSchema = {
  metadata: {
    appName: 'Nexus CRM Suite',
    description: 'Enterprise-grade customer relationship manager with dynamic leads tracking, role permissions, and payments integration.',
    version: '1.0.0'
  },
  dbSchema: {
    tables: [
      {
        name: 'users',
        description: 'Core user profiles containing roles and billing details.',
        columns: [
          { name: 'id', type: 'string', primaryKey: true },
          { name: 'name', type: 'string', primaryKey: false },
          { name: 'email', type: 'string', primaryKey: false },
          { name: 'role', type: 'string', primaryKey: false },
          { name: 'plan', type: 'string', primaryKey: false }
        ]
      },
      {
        name: 'contacts',
        description: 'Customer contact records managed by sales agents.',
        columns: [
          { name: 'id', type: 'string', primaryKey: true },
          { name: 'name', type: 'string', primaryKey: false },
          { name: 'email', type: 'string', primaryKey: false },
          { name: 'phone', type: 'string', primaryKey: false },
          { name: 'company', type: 'string', primaryKey: false },
          { name: 'status', type: 'string', primaryKey: false },
          { name: 'agentId', type: 'string', primaryKey: false, foreignKey: { table: 'users', column: 'id' } }
        ]
      },
      {
        name: 'deals',
        description: 'Sales deals and valuations associated with contacts.',
        columns: [
          { name: 'id', type: 'string', primaryKey: true },
          { name: 'title', type: 'string', primaryKey: false },
          { name: 'value', type: 'number', primaryKey: false },
          { name: 'stage', type: 'string', primaryKey: false },
          { name: 'contactId', type: 'string', primaryKey: false, foreignKey: { table: 'contacts', column: 'id' } }
        ]
      }
    ]
  },
  apiSchema: {
    endpoints: [
      {
        id: 'get-contacts',
        path: '/api/contacts',
        method: 'GET',
        description: 'Fetch all contacts matching query parameters.',
        targetTable: 'contacts',
        dbOperation: 'SELECT'
      },
      {
        id: 'create-contact',
        path: '/api/contacts',
        method: 'POST',
        description: 'Create a new contact record.',
        targetTable: 'contacts',
        dbOperation: 'INSERT',
        requestBody: [
          { name: 'name', type: 'string', required: true },
          { name: 'email', type: 'string', required: true },
          { name: 'phone', type: 'string', required: false },
          { name: 'company', type: 'string', required: false },
          { name: 'status', type: 'string', required: true },
          { name: 'agentId', type: 'string', required: true }
        ]
      },
      {
        id: 'update-contact',
        path: '/api/contacts',
        method: 'PUT',
        description: 'Update properties of an existing contact record.',
        targetTable: 'contacts',
        dbOperation: 'UPDATE',
        requestParams: [{ name: 'id', type: 'string', required: true }],
        requestBody: [
          { name: 'name', type: 'string', required: false },
          { name: 'email', type: 'string', required: false },
          { name: 'phone', type: 'string', required: false },
          { name: 'company', type: 'string', required: false },
          { name: 'status', type: 'string', required: false }
        ]
      },
      {
        id: 'delete-contact',
        path: '/api/contacts',
        method: 'DELETE',
        description: 'Hard delete a contact by ID.',
        targetTable: 'contacts',
        dbOperation: 'DELETE',
        requestParams: [{ name: 'id', type: 'string', required: true }]
      },
      {
        id: 'get-deals',
        path: '/api/deals',
        method: 'GET',
        description: 'Retrieve deal values and pipelines.',
        targetTable: 'deals',
        dbOperation: 'SELECT'
      },
      {
        id: 'create-deal',
        path: '/api/deals',
        method: 'POST',
        description: 'Add a new transaction/deal.',
        targetTable: 'deals',
        dbOperation: 'INSERT',
        requestBody: [
          { name: 'title', type: 'string', required: true },
          { name: 'value', type: 'number', required: true },
          { name: 'stage', type: 'string', required: true },
          { name: 'contactId', type: 'string', required: true }
        ]
      }
    ]
  },
  uiSchema: {
    pages: [
      {
        id: 'dashboard-page',
        title: 'Overview Analytics',
        route: '/',
        layout: 'dashboard',
        allowedRoles: ['Admin', 'Sales Manager', 'General Agent'],
        components: [
          {
            id: 'contacts-count',
            type: 'StatCard',
            title: 'Active Contacts',
            targetTable: 'contacts',
            apiEndpointId: 'get-contacts',
            aggregate: 'COUNT',
            metricField: 'id'
          },
          {
            id: 'deals-total',
            type: 'StatCard',
            title: 'Pipeline Revenue',
            targetTable: 'deals',
            apiEndpointId: 'get-deals',
            aggregate: 'SUM',
            metricField: 'value'
          },
          {
            id: 'deals-pipeline',
            type: 'Chart',
            title: 'Deals by Value',
            targetTable: 'deals',
            apiEndpointId: 'get-deals',
            chartType: 'bar',
            xAxisKey: 'title',
            yAxisKey: 'value'
          }
        ]
      },
      {
        id: 'contacts-page',
        title: 'Contacts Index',
        route: '/contacts',
        layout: 'split',
        allowedRoles: ['Admin', 'Sales Manager', 'General Agent'],
        components: [
          {
            id: 'contacts-list',
            type: 'DataTable',
            title: 'Lead Database',
            targetTable: 'contacts',
            apiEndpointId: 'get-contacts',
            columns: [
              { key: 'name', label: 'FullName', type: 'string' },
              { key: 'email', label: 'Email', type: 'string' },
              { key: 'company', label: 'Organization', type: 'string' },
              { key: 'status', label: 'Stage', type: 'string' }
            ]
          },
          {
            id: 'add-contact-form',
            type: 'Form',
            title: 'Add New Lead',
            targetTable: 'contacts',
            apiEndpointId: 'create-contact',
            fields: [
              { name: 'name', label: 'Full Name', type: 'string', required: true },
              { name: 'email', label: 'Email Address', type: 'string', required: true },
              { name: 'phone', label: 'Phone Number', type: 'string', required: false },
              { name: 'company', label: 'Company Name', type: 'string', required: false },
              { name: 'status', label: 'Lead Status (e.g. Lead, Contacted, Won)', type: 'string', required: true }
            ]
          }
        ]
      },
      {
        id: 'deals-page',
        title: 'Deal Flow',
        route: '/deals',
        layout: 'split',
        allowedRoles: ['Admin', 'Sales Manager'],
        components: [
          {
            id: 'deals-list',
            type: 'DataTable',
            title: 'Active Deal Pipeline',
            targetTable: 'deals',
            apiEndpointId: 'get-deals',
            columns: [
              { key: 'title', label: 'Deal Title', type: 'string' },
              { key: 'value', label: 'Amount ($)', type: 'number' },
              { key: 'stage', label: 'Pipeline Stage', type: 'string' }
            ]
          },
          {
            id: 'add-deal-form',
            type: 'Form',
            title: 'Log New Transaction',
            targetTable: 'deals',
            apiEndpointId: 'create-deal',
            fields: [
              { name: 'title', label: 'Deal Title', type: 'string', required: true },
              { name: 'value', label: 'Deal Value', type: 'number', required: true },
              { name: 'stage', label: 'Stage (Proposal, Negotating, Closed)', type: 'string', required: true },
              { name: 'contactId', label: 'Contact ID Link', type: 'string', required: true }
            ]
          }
        ]
      }
    ],
    navigation: [
      { label: 'Analytics Dashboard', route: '/', icon: 'LayoutDashboard', allowedRoles: ['Admin', 'Sales Manager', 'General Agent'] },
      { label: 'Contacts Database', route: '/contacts', icon: 'Users', allowedRoles: ['Admin', 'Sales Manager', 'General Agent'] },
      { label: 'Deal Tracker', route: '/deals', icon: 'Briefcase', allowedRoles: ['Admin', 'Sales Manager'] }
    ]
  },
  authSchema: {
    roles: ['Admin', 'Sales Manager', 'General Agent'],
    permissions: [
      { role: 'Admin', table: 'users', actions: ['CREATE', 'READ', 'UPDATE', 'DELETE'] },
      { role: 'Admin', table: 'contacts', actions: ['CREATE', 'READ', 'UPDATE', 'DELETE'] },
      { role: 'Admin', table: 'deals', actions: ['CREATE', 'READ', 'UPDATE', 'DELETE'] },
      { role: 'Sales Manager', table: 'contacts', actions: ['CREATE', 'READ', 'UPDATE', 'DELETE'] },
      { role: 'Sales Manager', table: 'deals', actions: ['CREATE', 'READ', 'UPDATE'] },
      { role: 'General Agent', table: 'contacts', actions: ['CREATE', 'READ', 'UPDATE'] },
      { role: 'General Agent', table: 'deals', actions: ['READ'] }
    ],
    routePermissions: [
      { role: 'Admin', endpointId: 'get-contacts', allowed: true },
      { role: 'Admin', endpointId: 'create-contact', allowed: true },
      { role: 'Admin', endpointId: 'update-contact', allowed: true },
      { role: 'Admin', endpointId: 'delete-contact', allowed: true },
      { role: 'Admin', endpointId: 'get-deals', allowed: true },
      { role: 'Admin', endpointId: 'create-deal', allowed: true },
      
      { role: 'Sales Manager', endpointId: 'get-contacts', allowed: true },
      { role: 'Sales Manager', endpointId: 'create-contact', allowed: true },
      { role: 'Sales Manager', endpointId: 'update-contact', allowed: true },
      { role: 'Sales Manager', endpointId: 'delete-contact', allowed: false },
      { role: 'Sales Manager', endpointId: 'get-deals', allowed: true },
      { role: 'Sales Manager', endpointId: 'create-deal', allowed: true },
      
      { role: 'General Agent', endpointId: 'get-contacts', allowed: true },
      { role: 'General Agent', endpointId: 'create-contact', allowed: true },
      { role: 'General Agent', endpointId: 'update-contact', allowed: true },
      { role: 'General Agent', endpointId: 'delete-contact', allowed: false },
      { role: 'General Agent', endpointId: 'get-deals', allowed: true },
      { role: 'General Agent', endpointId: 'create-deal', allowed: false }
    ],
    businessLogicRules: [
      {
        id: 'premium-contacts-rule',
        name: 'Free Tier Contact Cap',
        description: 'Restricts contact creations for General Agents who are on a Free billing plan.',
        endpointId: 'create-contact',
        condition: "user.plan === 'premium' || db.contacts.count() < 5",
        errorMessage: 'Free plan limitation. You have reached 5 contacts. Please upgrade to a Premium CRM account.'
      }
    ]
  }
};

// Pre-compiled High Fidelity Task Management Schema
const tasksSchema: AppSchema = {
  metadata: {
    appName: 'TaskSync Enterprise',
    description: 'Collaborative task planner with status workflows, completion charts, and auth controls.',
    version: '1.0.1'
  },
  dbSchema: {
    tables: [
      {
        name: 'users',
        description: 'Account entries and plan tiers.',
        columns: [
          { name: 'id', type: 'string', primaryKey: true },
          { name: 'name', type: 'string', primaryKey: false },
          { name: 'email', type: 'string', primaryKey: false },
          { name: 'role', type: 'string', primaryKey: false },
          { name: 'plan', type: 'string', primaryKey: false }
        ]
      },
      {
        name: 'tasks',
        description: 'Individual assignable action items.',
        columns: [
          { name: 'id', type: 'string', primaryKey: true },
          { name: 'title', type: 'string', primaryKey: false },
          { name: 'status', type: 'string', primaryKey: false },
          { name: 'priority', type: 'string', primaryKey: false },
          { name: 'dueDate', type: 'date', primaryKey: false },
          { name: 'userId', type: 'string', primaryKey: false, foreignKey: { table: 'users', column: 'id' } }
        ]
      }
    ]
  },
  apiSchema: {
    endpoints: [
      {
        id: 'get-tasks',
        path: '/api/tasks',
        method: 'GET',
        description: 'Fetch user tasks.',
        targetTable: 'tasks',
        dbOperation: 'SELECT'
      },
      {
        id: 'create-task',
        path: '/api/tasks',
        method: 'POST',
        description: 'Register a task in the system.',
        targetTable: 'tasks',
        dbOperation: 'INSERT',
        requestBody: [
          { name: 'title', type: 'string', required: true },
          { name: 'status', type: 'string', required: true },
          { name: 'priority', type: 'string', required: true },
          { name: 'dueDate', type: 'string', required: false },
          { name: 'userId', type: 'string', required: true }
        ]
      },
      {
        id: 'delete-task',
        path: '/api/tasks',
        method: 'DELETE',
        description: 'Remove a task.',
        targetTable: 'tasks',
        dbOperation: 'DELETE',
        requestParams: [{ name: 'id', type: 'string', required: true }]
      }
    ]
  },
  uiSchema: {
    pages: [
      {
        id: 'tasks-dashboard',
        title: 'Task Center',
        route: '/',
        layout: 'split',
        allowedRoles: ['Admin', 'Member', 'Guest'],
        components: [
          {
            id: 'task-table',
            type: 'DataTable',
            title: 'All Active Assignments',
            targetTable: 'tasks',
            apiEndpointId: 'get-tasks',
            columns: [
              { key: 'title', label: 'Action Item', type: 'string' },
              { key: 'status', label: 'Progress', type: 'string' },
              { key: 'priority', label: 'Urgency', type: 'string' },
              { key: 'dueDate', label: 'Due Date', type: 'date' }
            ]
          },
          {
            id: 'add-task-form',
            type: 'Form',
            title: 'Create Task',
            targetTable: 'tasks',
            apiEndpointId: 'create-task',
            fields: [
              { name: 'title', label: 'Task Name', type: 'string', required: true },
              { name: 'status', label: 'Status (Todo, Doing, Done)', type: 'string', required: true },
              { name: 'priority', label: 'Priority (High, Medium, Low)', type: 'string', required: true }
            ]
          }
        ]
      },
      {
        id: 'admin-dashboard',
        title: 'Task Statistics',
        route: '/admin',
        layout: 'dashboard',
        allowedRoles: ['Admin'],
        components: [
          {
            id: 'tasks-count',
            type: 'StatCard',
            title: 'Total System Tasks',
            targetTable: 'tasks',
            apiEndpointId: 'get-tasks',
            aggregate: 'COUNT',
            metricField: 'id'
          },
          {
            id: 'tasks-chart',
            type: 'Chart',
            title: 'Tasks Visualizer',
            targetTable: 'tasks',
            apiEndpointId: 'get-tasks',
            chartType: 'bar',
            xAxisKey: 'title',
            yAxisKey: 'priority'
          }
        ]
      }
    ],
    navigation: [
      { label: 'Workspaces', route: '/', icon: 'CheckSquare', allowedRoles: ['Admin', 'Member', 'Guest'] },
      { label: 'Completion Stats', route: '/admin', icon: 'PieChart', allowedRoles: ['Admin'] }
    ]
  },
  authSchema: {
    roles: ['Admin', 'Member', 'Guest'],
    permissions: [
      { role: 'Admin', table: 'tasks', actions: ['CREATE', 'READ', 'UPDATE', 'DELETE'] },
      { role: 'Member', table: 'tasks', actions: ['CREATE', 'READ', 'UPDATE'] },
      { role: 'Guest', table: 'tasks', actions: ['READ'] }
    ],
    routePermissions: [
      { role: 'Admin', endpointId: 'get-tasks', allowed: true },
      { role: 'Admin', endpointId: 'create-task', allowed: true },
      { role: 'Admin', endpointId: 'delete-task', allowed: true },
      { role: 'Member', endpointId: 'get-tasks', allowed: true },
      { role: 'Member', endpointId: 'create-task', allowed: true },
      { role: 'Member', endpointId: 'delete-task', allowed: false },
      { role: 'Guest', endpointId: 'get-tasks', allowed: true },
      { role: 'Guest', endpointId: 'create-task', allowed: false },
      { role: 'Guest', endpointId: 'delete-task', allowed: false }
    ],
    businessLogicRules: [
      {
        id: 'premium-reminders',
        name: 'Urgent Task Limit',
        description: 'Blocks Guest role from setting tasks to High priority.',
        endpointId: 'create-task',
        condition: "user.role !== 'Guest' || payload.priority !== 'High'",
        errorMessage: 'Guests cannot create High priority tasks. Register an account to prioritize workload.'
      }
    ]
  }
};

// Pre-compiled High Fidelity E-commerce Schema
const ecommerceSchema: AppSchema = {
  metadata: {
    appName: 'VendFlow Market',
    description: 'An operational shop interface managing listings, purchases, inventories, and earnings logs.',
    version: '2.0.0'
  },
  dbSchema: {
    tables: [
      {
        name: 'users',
        description: 'Customer profiles and store keepers.',
        columns: [
          { name: 'id', type: 'string', primaryKey: true },
          { name: 'name', type: 'string', primaryKey: false },
          { name: 'role', type: 'string', primaryKey: false },
          { name: 'plan', type: 'string', primaryKey: false }
        ]
      },
      {
        name: 'products',
        description: 'Items catalogue offered in the marketplace.',
        columns: [
          { name: 'id', type: 'string', primaryKey: true },
          { name: 'title', type: 'string', primaryKey: false },
          { name: 'price', type: 'number', primaryKey: false },
          { name: 'stock', type: 'number', primaryKey: false }
        ]
      },
      {
        name: 'orders',
        description: 'Customer transactions database.',
        columns: [
          { name: 'id', type: 'string', primaryKey: true },
          { name: 'productId', type: 'string', primaryKey: false, foreignKey: { table: 'products', column: 'id' } },
          { name: 'quantity', type: 'number', primaryKey: false },
          { name: 'totalPrice', type: 'number', primaryKey: false },
          { name: 'customerName', type: 'string', primaryKey: false }
        ]
      }
    ]
  },
  apiSchema: {
    endpoints: [
      {
        id: 'get-products',
        path: '/api/products',
        method: 'GET',
        description: 'Fetch item catalogs.',
        targetTable: 'products',
        dbOperation: 'SELECT'
      },
      {
        id: 'update-stock',
        path: '/api/products',
        method: 'PUT',
        description: 'Modify vendor inventory quantities.',
        targetTable: 'products',
        dbOperation: 'UPDATE',
        requestParams: [{ name: 'id', type: 'string', required: true }],
        requestBody: [{ name: 'stock', type: 'number', required: true }]
      },
      {
        id: 'get-orders',
        path: '/api/orders',
        method: 'GET',
        description: 'Track shop sales reports.',
        targetTable: 'orders',
        dbOperation: 'SELECT'
      },
      {
        id: 'place-order',
        path: '/api/orders',
        method: 'POST',
        description: 'Execute purchasing operations.',
        targetTable: 'orders',
        dbOperation: 'INSERT',
        requestBody: [
          { name: 'productId', type: 'string', required: true },
          { name: 'quantity', type: 'number', required: true },
          { name: 'totalPrice', type: 'number', required: true },
          { name: 'customerName', type: 'string', required: true }
        ]
      }
    ]
  },
  uiSchema: {
    pages: [
      {
        id: 'shop-front',
        title: 'Store Catalogue',
        route: '/',
        layout: 'split',
        allowedRoles: ['Customer', 'Vendor', 'Admin'],
        components: [
          {
            id: 'products-list',
            type: 'DataTable',
            title: 'Products For Sale',
            targetTable: 'products',
            apiEndpointId: 'get-products',
            columns: [
              { key: 'title', label: 'Item Name', type: 'string' },
              { key: 'price', label: 'Price ($)', type: 'number' },
              { key: 'stock', label: 'In Stock', type: 'number' }
            ]
          },
          {
            id: 'checkout-form',
            type: 'Form',
            title: 'Place Order',
            targetTable: 'orders',
            apiEndpointId: 'place-order',
            fields: [
              { name: 'productId', label: 'Product ID Reference', type: 'string', required: true },
              { name: 'quantity', label: 'Units', type: 'number', required: true },
              { name: 'customerName', label: 'Your Name', type: 'string', required: true }
            ]
          }
        ]
      },
      {
        id: 'sales-tracker',
        title: 'Manager Dashboard',
        route: '/analytics',
        allowedRoles: ['Vendor', 'Admin'],
        layout: 'dashboard',
        components: [
          {
            id: 'sales-count',
            type: 'StatCard',
            title: 'Sales volume',
            targetTable: 'orders',
            apiEndpointId: 'get-orders',
            aggregate: 'COUNT',
            metricField: 'id'
          },
          {
            id: 'revenue-aggregate',
            type: 'StatCard',
            title: 'Total Earnings ($)',
            targetTable: 'orders',
            apiEndpointId: 'get-orders',
            aggregate: 'SUM',
            metricField: 'totalPrice'
          },
          {
            id: 'orders-grid',
            type: 'DataTable',
            title: 'Order logbook',
            targetTable: 'orders',
            apiEndpointId: 'get-orders',
            columns: [
              { key: 'customerName', label: 'Buyer', type: 'string' },
              { key: 'quantity', label: 'Qty', type: 'number' },
              { key: 'totalPrice', label: 'Total Paid ($)', type: 'number' }
            ]
          }
        ]
      }
    ],
    navigation: [
      { label: 'Browse Products', route: '/', icon: 'ShoppingBag', allowedRoles: ['Customer', 'Vendor', 'Admin'] },
      { label: 'Sales Reports', route: '/analytics', icon: 'TrendingUp', allowedRoles: ['Vendor', 'Admin'] }
    ]
  },
  authSchema: {
    roles: ['Admin', 'Vendor', 'Customer'],
    permissions: [
      { role: 'Admin', table: 'products', actions: ['CREATE', 'READ', 'UPDATE', 'DELETE'] },
      { role: 'Admin', table: 'orders', actions: ['CREATE', 'READ', 'UPDATE', 'DELETE'] },
      { role: 'Vendor', table: 'products', actions: ['READ', 'UPDATE'] },
      { role: 'Vendor', table: 'orders', actions: ['READ'] },
      { role: 'Customer', table: 'products', actions: ['READ'] },
      { role: 'Customer', table: 'orders', actions: ['CREATE', 'READ'] }
    ],
    routePermissions: [
      { role: 'Admin', endpointId: 'get-products', allowed: true },
      { role: 'Admin', endpointId: 'update-stock', allowed: true },
      { role: 'Admin', endpointId: 'get-orders', allowed: true },
      { role: 'Admin', endpointId: 'place-order', allowed: true },
      
      { role: 'Vendor', endpointId: 'get-products', allowed: true },
      { role: 'Vendor', endpointId: 'update-stock', allowed: true },
      { role: 'Vendor', endpointId: 'get-orders', allowed: true },
      { role: 'Vendor', endpointId: 'place-order', allowed: false },
      
      { role: 'Customer', endpointId: 'get-products', allowed: true },
      { role: 'Customer', endpointId: 'update-stock', allowed: false },
      { role: 'Customer', endpointId: 'get-orders', allowed: false },
      { role: 'Customer', endpointId: 'place-order', allowed: true }
    ],
    businessLogicRules: [
      {
        id: 'stock-check',
        name: 'Inventory Cap Enforcement',
        description: 'Ensures users cannot order quantities higher than 10 per transaction to prevent bot purchases.',
        endpointId: 'place-order',
        condition: 'payload.quantity <= 10',
        errorMessage: 'You cannot place orders for more than 10 units at a time.'
      }
    ]
  }
};

// Dynamically creates a valid, compileable, fallback application schema based on key nouns in the prompt.
function getFallbackSchema(prompt: string): AppSchema {
  const words = prompt.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").toLowerCase().split(' ');
  const mainNoun = words.find(w => w.length > 4 && !['build', 'login', 'admin', 'sales', 'order', 'chart', 'table', 'pages', 'access'].includes(w)) || 'item';
  const tableSingular = mainNoun;
  const tablePlural = tableSingular + 's';
  const roleName = words.find(w => ['admin', 'manager', 'editor', 'vendor', 'agent', 'staff'].includes(w)) || 'Manager';
  const formattedRole = roleName.charAt(0).toUpperCase() + roleName.slice(1);
  const formattedTable = tablePlural.charAt(0).toUpperCase() + tablePlural.slice(1);
  
  return {
    metadata: {
      appName: `${formattedTable} Hub`,
      description: `Custom generated tracker application for ${tablePlural}.`,
      version: '1.0.0'
    },
    dbSchema: {
      tables: [
        {
          name: 'users',
          description: 'User access levels.',
          columns: [
            { name: 'id', type: 'string', primaryKey: true },
            { name: 'name', type: 'string', primaryKey: false },
            { name: 'role', type: 'string', primaryKey: false },
            { name: 'plan', type: 'string', primaryKey: false }
          ]
        },
        {
          name: tablePlural,
          description: `Custom data records for ${tablePlural}.`,
          columns: [
            { name: 'id', type: 'string', primaryKey: true },
            { name: 'title', type: 'string', primaryKey: false },
            { name: 'status', type: 'string', primaryKey: false },
            { name: 'quantity', type: 'number', primaryKey: false },
            { name: 'createdAt', type: 'date', primaryKey: false }
          ]
        }
      ]
    },
    apiSchema: {
      endpoints: [
        {
          id: `get-${tablePlural}`,
          path: `/api/${tablePlural}`,
          method: 'GET',
          description: `List all ${tablePlural}.`,
          targetTable: tablePlural,
          dbOperation: 'SELECT'
        },
        {
          id: `create-${tableSingular}`,
          path: `/api/${tablePlural}`,
          method: 'POST',
          description: `Insert a new record into ${tablePlural}.`,
          targetTable: tablePlural,
          dbOperation: 'INSERT',
          requestBody: [
            { name: 'title', type: 'string', required: true },
            { name: 'status', type: 'string', required: true },
            { name: 'quantity', type: 'number', required: false }
          ]
        }
      ]
    },
    uiSchema: {
      pages: [
        {
          id: 'main-list-page',
          title: `${formattedTable} Workspace`,
          route: '/',
          layout: 'split',
          allowedRoles: ['Admin', formattedRole],
          components: [
            {
              id: 'items-datatable',
              type: 'DataTable',
              title: `Registered ${formattedTable}`,
              targetTable: tablePlural,
              apiEndpointId: `get-${tablePlural}`,
              columns: [
                { key: 'title', label: 'Item Name', type: 'string' },
                { key: 'status', label: 'Status', type: 'string' },
                { key: 'quantity', label: 'Count', type: 'number' }
              ]
            },
            {
              id: 'add-item-form',
              type: 'Form',
              title: `Log ${tableSingular.charAt(0).toUpperCase() + tableSingular.slice(1)}`,
              targetTable: tablePlural,
              apiEndpointId: `create-${tableSingular}`,
              fields: [
                { name: 'title', label: 'Label Name', type: 'string', required: true },
                { name: 'status', label: 'Status Level', type: 'string', required: true },
                { name: 'quantity', label: 'Amount Count', type: 'number', required: false }
              ]
            }
          ]
        }
      ],
      navigation: [
        { label: `${formattedTable} Panel`, route: '/', icon: 'Folder', allowedRoles: ['Admin', formattedRole] }
      ]
    },
    authSchema: {
      roles: ['Admin', formattedRole],
      permissions: [
        { role: 'Admin', table: tablePlural, actions: ['CREATE', 'READ', 'UPDATE', 'DELETE'] },
        { role: formattedRole, table: tablePlural, actions: ['CREATE', 'READ', 'UPDATE'] }
      ],
      routePermissions: [
        { role: 'Admin', endpointId: `get-${tablePlural}`, allowed: true },
        { role: 'Admin', endpointId: `create-${tableSingular}`, allowed: true },
        { role: formattedRole, endpointId: `get-${tablePlural}`, allowed: true },
        { role: formattedRole, endpointId: `create-${tableSingular}`, allowed: true }
      ],
      businessLogicRules: []
    }
  };
}
