import { AppSchema, CompilationStep } from '../types/schema';
import { LLMProvider, MockProvider, GeminiProvider, OpenAIProvider, ClaudeProvider } from './providers';
import { runRepairLoop, RepairResult } from './repairEngine';
import { validateSchema } from './validator';

export interface CompilerOptions {
  providerType: 'mock' | 'gemini' | 'openai' | 'claude';
  apiKey?: string;
  modelName?: string;
  injectFault?: boolean;
}

export interface CompilationResult {
  schema: AppSchema | null;
  success: boolean;
  steps: CompilationStep[];
  repairMetrics?: {
    retries: number;
    initialErrorsCount: number;
    logs: string[];
  };
}

export async function compileApplication(
  prompt: string,
  options: CompilerOptions,
  onStepChange: (steps: CompilationStep[]) => void
): Promise<CompilationResult> {
  const steps: CompilationStep[] = [
    {
      stage: 'intent',
      title: 'Stage 1: Intent Extraction',
      status: 'pending',
      message: 'Extracting features, roles, and schema requirements from prompt...',
      timestamp: new Date().toISOString()
    },
    {
      stage: 'design',
      title: 'Stage 2: System Design Layer',
      status: 'pending',
      message: 'Constructing app architecture, entity models, and security gates...',
      timestamp: new Date().toISOString()
    },
    {
      stage: 'schema',
      title: 'Stage 3: Schema Generation',
      status: 'pending',
      message: 'Generating database, API endpoints, user interfaces, and auth JSON schemas...',
      timestamp: new Date().toISOString()
    },
    {
      stage: 'repair',
      title: 'Stage 4: Refinement & Validation',
      status: 'pending',
      message: 'Running static checking and automated repair engine...',
      timestamp: new Date().toISOString()
    }
  ];

  const updateStep = (
    stage: 'intent' | 'design' | 'schema' | 'repair' | 'done',
    status: 'pending' | 'running' | 'success' | 'error',
    message: string,
    output?: string,
    durationMs?: number
  ) => {
    const idx = steps.findIndex(s => s.stage === stage);
    if (idx !== -1) {
      steps[idx] = {
        ...steps[idx],
        status,
        message,
        timestamp: new Date().toISOString(),
        output,
        durationMs
      };
      onStepChange([...steps]);
    }
  };

  // Instantiate selected LLM provider
  let provider: LLMProvider;
  switch (options.providerType) {
    case 'gemini':
      if (!options.apiKey) throw new Error('Gemini API key is required');
      provider = new GeminiProvider(options.apiKey, options.modelName || 'gemini-1.5-flash');
      break;
    case 'openai':
      if (!options.apiKey) throw new Error('OpenAI API key is required');
      provider = new OpenAIProvider(options.apiKey, options.modelName || 'gpt-4o-mini');
      break;
    case 'claude':
      if (!options.apiKey) throw new Error('Claude API key is required');
      provider = new ClaudeProvider(options.apiKey, options.modelName || 'claude-3-5-sonnet-20241022');
      break;
    case 'mock':
    default:
      provider = new MockProvider();
      break;
  }

  try {
    // ============================================
    // STAGE 1: INTENT EXTRACTION
    // ============================================
    updateStep('intent', 'running', 'Parsing open-ended instructions into structured Intermediate Representation...');
    const startIntent = Date.now();
    
    const intentSystemPrompt = `
You are the INTENT_EXTRACTION compiler stage.
Analyze the user's natural language request and parse it into a structured Intermediate Representation (IR) JSON containing:
- appName: Guess a suitable product name.
- description: Brief description of the app.
- roles: List of user personas/access levels implied (e.g. Admin, Customer, Manager).
- entities: Core database tables identified (e.g. users, tasks, logs).
- requirements: Extracted core functional requirements.
- ambiguities: List of conflicting or missing details you noticed.

Do not write code fences, comments, or extra text. Output ONLY valid JSON.
`;
    const intentOutput = await provider.generate(intentSystemPrompt, prompt);
    const endIntent = Date.now();
    updateStep('intent', 'success', 'User intent successfully analyzed and mapped.', intentOutput, endIntent - startIntent);
    
    // Slight pause for visual timing in front-end
    await new Promise(r => setTimeout(r, 600));

    // ============================================
    // STAGE 2: SYSTEM DESIGN LAYER
    // ============================================
    updateStep('design', 'running', 'Constructing relational architecture and security profiles...');
    const startDesign = Date.now();
    
    const designSystemPrompt = `
You are the SYSTEM_DESIGN compiler stage.
Based on the parsed Intent IR, design the backend architecture.
Output a JSON containing:
- architectureType: e.g. "CRUD Relational"
- databaseEngine: e.g. "SQLite / In-Memory"
- componentsLayout: e.g. "Sidebar Grid"
- designDecision: Bulleted list explaining relationship constraints, join columns, and role scopes.

Output ONLY valid JSON. No markdown code blocks.
`;
    const designOutput = await provider.generate(designSystemPrompt, intentOutput);
    const endDesign = Date.now();
    updateStep('design', 'success', 'App architecture design blueprint finalized.', designOutput, endDesign - startDesign);
    
    await new Promise(r => setTimeout(r, 600));

    // ============================================
    // STAGE 3: SCHEMA GENERATION
    // ============================================
    updateStep('schema', 'running', 'Generating database DDL, REST API endpoints, layout cards, and policy rules...');
    const startSchema = Date.now();
    
    const schemaSystemPrompt = `
You are the SCHEMA_GENERATION compiler stage.
Convert the architecture blueprint into a strict AppSchema containing:
1. metadata: { appName, description, version }
2. dbSchema: { tables: [ { name, description, columns: [ { name, type: 'string'|'number'|'boolean'|'date', primaryKey, nullable, foreignKey: { table, column } } ] } ] }
3. apiSchema: { endpoints: [ { id, path, method: 'GET'|'POST'|'PUT'|'DELETE', description, targetTable, dbOperation: 'SELECT'|'INSERT'|'UPDATE'|'DELETE', requestParams, requestBody, responseBody } ] }
4. uiSchema: { pages: [ { id, title, route, layout: 'dashboard'|'split'|'single', allowedRoles, components: [ { id, type: 'StatCard'|'DataTable'|'Form'|'Chart'|'DetailView', title, targetTable, apiEndpointId, fields: [ { name, label, type, required } ], columns: [ { key, label, type } ], metricField, aggregate, chartType, xAxisKey, yAxisKey } ] } ], navigation }
5. authSchema: { roles: string[], permissions: [ { role, table, actions } ], routePermissions: [ { role, endpointId, allowed } ], businessLogicRules: [ { id, name, description, endpointId, condition, errorMessage } ] }

Ensure the schema conforms exactly to these structures. All fields must link correctly.
Output ONLY raw JSON. No markdown code boxes.
`;
    const schemaOutput = await provider.generate(schemaSystemPrompt, `${intentOutput}\n\n${designOutput}`);
    const endSchema = Date.now();
    
    let generatedSchema: AppSchema;
    try {
      let cleanJson = schemaOutput.trim();
      if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.replace(/^```[a-zA-Z]*\n/, '').replace(/\n```$/, '');
      }
      generatedSchema = JSON.parse(cleanJson) as AppSchema;
      updateStep('schema', 'success', 'Strict UI, API, DB, and Auth JSON schemas generated.', JSON.stringify(generatedSchema, null, 2), endSchema - startSchema);
    } catch (err: any) {
      updateStep('schema', 'error', `Failed to parse generated schema JSON: ${err.message}`);
      return { schema: null, success: false, steps };
    }

    await new Promise(r => setTimeout(r, 600));

    // ============================================
    // STAGE 4: REFINEMENT & VALIDATION (REPAIR)
    // ============================================
    updateStep('repair', 'running', 'Analyzing schemas for type integrity and logical consistency...');
    const startRepair = Date.now();
    
    const initialErrors = validateSchema(generatedSchema);
    
    // Execute repair engine
    const repairResult: RepairResult = await runRepairLoop(
      generatedSchema,
      provider,
      prompt,
      (logMsg) => {
        updateStep('repair', 'running', logMsg);
      },
      options.injectFault
    );
    
    const endRepair = Date.now();
    const repairDuration = endRepair - startRepair;

    if (repairResult.success) {
      updateStep(
        'repair',
        'success',
        `Validation passed. Successfully resolved inconsistencies inside ${repairResult.retriesUsed} repair loop(s).`,
        JSON.stringify(repairResult.schema, null, 2),
        repairDuration
      );
      return {
        schema: repairResult.schema,
        success: true,
        steps,
        repairMetrics: {
          retries: repairResult.retriesUsed,
          initialErrorsCount: initialErrors.length,
          logs: repairResult.logs
        }
      };
    } else {
      updateStep(
        'repair',
        'error',
        `Validation failed. ${repairResult.errors.length} unresolved errors remain. Core compilation halted.`,
        JSON.stringify(repairResult.errors, null, 2),
        repairDuration
      );
      return {
        schema: null,
        success: false,
        steps,
        repairMetrics: {
          retries: repairResult.retriesUsed,
          initialErrorsCount: initialErrors.length,
          logs: repairResult.logs
        }
      };
    }

  } catch (err: any) {
    console.error('Compilation pipeline error:', err);
    // Find the first running/pending stage and mark it as failed
    const runningStage = steps.find(s => s.status === 'running') || steps.find(s => s.status === 'pending');
    if (runningStage) {
      updateStep(runningStage.stage, 'error', `Pipeline execution failed: ${err.message || err}`);
    }
    return { schema: null, success: false, steps };
  }
}
