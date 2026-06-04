import { AppSchema } from '../types/schema';

export interface ValidationError {
  layer: 'syntax' | 'dbSchema' | 'apiSchema' | 'uiSchema' | 'authSchema';
  validator: string;
  error: string;
}

export function validateSchema(schema: AppSchema): ValidationError[] {
  const errors: ValidationError[] = [];

  // 1. Syntactic / Shape Validation
  if (!schema.metadata || !schema.metadata.appName) {
    errors.push({
      layer: 'syntax',
      validator: 'App Metadata Validator',
      error: 'Application metadata or appName is missing.'
    });
  }

  const tables = schema.dbSchema?.tables || [];
  const endpoints = schema.apiSchema?.endpoints || [];
  const pages = schema.uiSchema?.pages || [];
  const roles = schema.authSchema?.roles || [];

  // 2. Database Schema Integrity
  tables.forEach(table => {
    if (!table.name) {
      errors.push({
        layer: 'dbSchema',
        validator: 'Database Integrity Check',
        error: `A database table definition is missing a name.`
      });
      return;
    }

    // Check for primary key
    const hasPrimaryKey = table.columns?.some(c => c.primaryKey);
    if (!hasPrimaryKey) {
      errors.push({
        layer: 'dbSchema',
        validator: 'Database Integrity Check',
        error: `Database table '${table.name}' must have at least one column designated as 'primaryKey: true'.`
      });
    }

    // Verify foreign keys
    table.columns?.forEach(col => {
      if (col.foreignKey) {
        const targetTableName = col.foreignKey.table;
        const targetColName = col.foreignKey.column;

        const targetTable = tables.find(t => t.name === targetTableName);
        if (!targetTable) {
          errors.push({
            layer: 'dbSchema',
            validator: 'Database Foreign Key Check',
            error: `Column '${col.name}' in table '${table.name}' references non-existent foreign table '${targetTableName}'.`
          });
        } else {
          const targetCol = targetTable.columns?.find(c => c.name === targetColName);
          if (!targetCol) {
            errors.push({
              layer: 'dbSchema',
              validator: 'Database Foreign Key Check',
              error: `Column '${col.name}' in table '${table.name}' references non-existent foreign column '${targetColName}' in table '${targetTableName}'.`
            });
          }
        }
      }
    });
  });

  // 3. API-to-DB Consistency
  endpoints.forEach(ep => {
    if (!ep.path || !ep.method) {
      errors.push({
        layer: 'apiSchema',
        validator: 'API Path Check',
        error: `Endpoint '${ep.id || 'unnamed'}' is missing a path or HTTP method.`
      });
      return;
    }

    // Verify endpoint references a valid database table
    const targetTable = tables.find(t => t.name === ep.targetTable);
    if (!targetTable) {
      errors.push({
        layer: 'apiSchema',
        validator: 'API-to-DB Consistency',
        error: `API Endpoint '${ep.method} ${ep.path}' targets database table '${ep.targetTable}' which does not exist in dbSchema.`
      });
    } else {
      // For INSERT and UPDATE, verify that body params exist in the target table columns
      if (ep.dbOperation === 'INSERT' || ep.dbOperation === 'UPDATE') {
        ep.requestBody?.forEach(param => {
          const matchingCol = targetTable.columns.find(c => c.name === param.name);
          if (!matchingCol) {
            errors.push({
              layer: 'apiSchema',
              validator: 'API-to-DB Consistency',
              error: `API Endpoint '${ep.method} ${ep.path}' requestBody contains parameter '${param.name}' which does not exist in target database table '${ep.targetTable}'.`
            });
          }
        });
      }
    }
  });

  // 4. UI-to-API Mapping
  pages.forEach(page => {
    page.components?.forEach(comp => {
      // StatCard, DataTable, Form, Chart, DetailView must specify a targetTable
      const targetTable = tables.find(t => t.name === comp.targetTable);
      if (!targetTable) {
        errors.push({
          layer: 'uiSchema',
          validator: 'UI-to-DB Alignment',
          error: `UI Page '${page.title}' Component '${comp.title}' targets table '${comp.targetTable}' which does not exist in dbSchema.`
        });
      }

      // Check if component points to valid endpoint ID
      const endpoint = endpoints.find(e => e.id === comp.apiEndpointId);
      if (!endpoint) {
        errors.push({
          layer: 'uiSchema',
          validator: 'UI-to-API Mapping',
          error: `UI Page '${page.title}' Component '${comp.title}' calls apiEndpointId '${comp.apiEndpointId}' which does not exist in apiSchema.`
        });
      } else {
        // Form field consistency check
        if (comp.type === 'Form' && comp.fields) {
          comp.fields.forEach(field => {
            const bodyParam = endpoint.requestBody?.find(p => p.name === field.name);
            if (!bodyParam) {
              errors.push({
                layer: 'uiSchema',
                validator: 'UI Form Field Check',
                error: `Form Component '${comp.title}' in page '${page.title}' contains input field '${field.name}' which is not accepted by the target API endpoint '${endpoint.method} ${endpoint.path}' requestBody.`
              });
            }
          });
        }
      }
    });

    // Page roles check
    page.allowedRoles?.forEach(role => {
      if (!roles.includes(role)) {
        errors.push({
          layer: 'uiSchema',
          validator: 'Role Alignment Check',
          error: `UI Page '${page.title}' allows role '${role}' which is not registered in authSchema.roles.`
        });
      }
    });
  });

  // 5. Auth-to-API / DB Gating Alignment
  schema.authSchema?.permissions?.forEach(perm => {
    if (!roles.includes(perm.role)) {
      errors.push({
        layer: 'authSchema',
        validator: 'Auth Table Permission',
        error: `Permission definition references role '${perm.role}' which is not in authSchema.roles.`
      });
    }

    const tableExists = tables.some(t => t.name === perm.table);
    if (!tableExists) {
      errors.push({
        layer: 'authSchema',
        validator: 'Auth Table Permission',
        error: `Permission role '${perm.role}' targets table '${perm.table}' which does not exist in dbSchema.`
      });
    }
  });

  schema.authSchema?.routePermissions?.forEach(rp => {
    if (!roles.includes(rp.role)) {
      errors.push({
        layer: 'authSchema',
        validator: 'Auth Route Permission',
        error: `Route permission references role '${rp.role}' which is not in authSchema.roles.`
      });
    }

    const endpointExists = endpoints.some(e => e.id === rp.endpointId);
    if (!endpointExists) {
      errors.push({
        layer: 'authSchema',
        validator: 'Auth Route Permission',
        error: `Route permission role '${rp.role}' targets endpointId '${rp.endpointId}' which does not exist in apiSchema.`
      });
    }
  });

  schema.authSchema?.businessLogicRules?.forEach(rule => {
    const endpointExists = endpoints.some(e => e.id === rule.endpointId);
    if (!endpointExists) {
      errors.push({
        layer: 'authSchema',
        validator: 'Auth Business Logic Rule',
        error: `Business Logic Rule '${rule.name}' targets endpointId '${rule.endpointId}' which does not exist in apiSchema.`
      });
    }
  });

  return errors;
}
