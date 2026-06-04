import { AppSchema } from '../types/schema';
import { validateSchema, ValidationError } from './validator';
import { LLMProvider } from './providers';

export interface RepairResult {
  schema: AppSchema;
  success: boolean;
  errors: ValidationError[];
  retriesUsed: number;
  logs: string[];
}

export async function runRepairLoop(
  initialSchema: AppSchema,
  provider: LLMProvider,
  originalUserPrompt: string,
  onProgress?: (message: string) => void,
  injectFault: boolean = false
): Promise<RepairResult> {
  let schema = JSON.parse(JSON.stringify(initialSchema)) as AppSchema;
  const logs: string[] = [];
  
  const log = (msg: string) => {
    logs.push(msg);
    if (onProgress) onProgress(msg);
  };

  // If fault injection is requested, deliberately break the schema to demonstrate self-repair
  if (injectFault) {
    log('⚠️ Fault Injection Mode: Deliberately breaking schema properties for demonstration...');
    
    // Break 1: Delete primary key designation from users table
    if (schema.dbSchema.tables[0]) {
      log('↳ [DB Broken] Removing primaryKey identifier from users table.');
      schema.dbSchema.tables[0].columns.forEach(c => {
        if (c.name === 'id') c.primaryKey = false;
      });
    }

    // Break 2: Mismatch UI component with API endpoint
    if (schema.uiSchema.pages[1] && schema.uiSchema.pages[1].components[0]) {
      log('↳ [UI Mismatch] Pointing lead table component to non-existent endpoint API.');
      schema.uiSchema.pages[1].components[0].apiEndpointId = 'invalid-get-contacts-endpoint-id';
    }

    // Break 3: Add invalid form input field
    if (schema.uiSchema.pages[1] && schema.uiSchema.pages[1].components[1] && schema.uiSchema.pages[1].components[1].fields) {
      log('↳ [Form Error] Injecting hallucinated input field "socialSecurityNumber" which API does not accept.');
      schema.uiSchema.pages[1].components[1].fields.push({
        name: 'socialSecurityNumber',
        label: 'SSN',
        type: 'string',
        required: true
      });
    }
  }

  let errors = validateSchema(schema);
  let retriesUsed = 0;
  const maxRetries = 3;

  if (errors.length === 0) {
    log('✓ Schema validated successfully on first check. No repairs needed.');
    return { schema, success: true, errors, retriesUsed, logs };
  }

  log(`❌ Schema validation failed with ${errors.length} error(s). Starting Repair Engine...`);

  while (errors.length > 0 && retriesUsed < maxRetries) {
    retriesUsed++;
    log(`\n🛠️ Repair Attempt ${retriesUsed}/${maxRetries}...`);
    
    // Group errors by layer for targeted prompt compilation
    const errorsText = errors.map((e, idx) => `${idx + 1}. [${e.layer}] Validator: "${e.validator}" — ${e.error}`).join('\n');
    log(`Identified discrepancies:\n${errorsText}`);

    const systemPrompt = `
You are the REPAIR_ENGINE for an AI software compiler. 
Your objective is to fix structural and consistency errors inside the generated Application JSON schema.
You will be provided with the current broken schema, the original prompt, and the validation error logs.

Strict Output Contract:
You must output ONLY a valid JSON object matching the AppSchema format, correcting the listed errors.
Keep all valid tables, API endpoints, UI pages, and Auth policies. Do not delete them. Only repair the discrepancies.
Ensure:
1. Every database table has a primary key column (primaryKey: true).
2. UI Component apiEndpointId references a valid API endpoint ID.
3. UI Form field names correspond to parameters in the API endpoint requestBody.
4. Active roles in UI pages and API gateways are declared in the global roles list.

Do not write any markdown code fences, comments, or explanations. Return only the raw JSON.
`;

    const userPrompt = JSON.stringify({
      validationErrors: errors.map(e => ({ layer: e.layer, validator: e.validator, error: e.error })),
      originalPrompt: originalUserPrompt,
      brokenSchema: schema
    }, null, 2);

    try {
      log(`Calling LLM Repair Agent to resolve ${errors.length} consistency issue(s)...`);
      const responseText = await provider.generate(systemPrompt, userPrompt);
      
      // Sanitization: strip markdown code blocks if the LLM hallucinated them
      let sanitizedResponse = responseText.trim();
      if (sanitizedResponse.startsWith('```')) {
        sanitizedResponse = sanitizedResponse.replace(/^```[a-zA-Z]*\n/, '').replace(/\n```$/, '');
      }

      const repairedSchema = JSON.parse(sanitizedResponse) as AppSchema;
      
      // Perform simple verification of returned format
      if (!repairedSchema.dbSchema || !repairedSchema.apiSchema || !repairedSchema.uiSchema) {
        throw new Error('LLM returned incomplete schema missing required top-level configuration blocks.');
      }

      schema = repairedSchema;
      log(`✓ Repair Agent responded. Patch applied. Re-running validators...`);
      
      // Re-evaluate
      errors = validateSchema(schema);
      if (errors.length === 0) {
        log(`✓ Repair successful! All validators passed on attempt ${retriesUsed}.`);
        break;
      } else {
        log(`⚠️ Repair attempt ${retriesUsed} completed but ${errors.length} validation errors remain.`);
      }
    } catch (err: any) {
      log(`❌ Error executing repair iteration: ${err.message || err}`);
    }
  }

  const success = errors.length === 0;
  if (!success) {
    log(`❌ Compiler Error: Failed to repair all validation errors within ${maxRetries} attempts.`);
  }

  return { schema, success, errors, retriesUsed, logs };
}
