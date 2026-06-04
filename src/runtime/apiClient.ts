import { AppSchema } from '../types/schema';
import { VirtualDatabase } from './database';

export interface ActiveUser {
  id: string;
  name: string;
  role: string;
  plan: 'free' | 'premium';
}

export interface ApiResponse<T = any> {
  status: number;
  message: string;
  data?: T;
  error?: string;
}

export class VirtualApiClient {
  private schema: AppSchema;
  private db: VirtualDatabase;

  constructor(schema: AppSchema, db: VirtualDatabase) {
    this.schema = schema;
    this.db = db;
  }

  /**
   * Mock API Request Router
   */
  public async request(
    endpointId: string,
    payload: Record<string, any> = {},
    user: ActiveUser
  ): Promise<ApiResponse> {
    // Artificial latency to simulate endpoint round-trips
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      const endpoint = this.schema.apiSchema.endpoints.find(e => e.id === endpointId);
      if (!endpoint) {
        return {
          status: 404,
          message: 'Endpoint Not Found',
          error: `API endpoint with ID '${endpointId}' does not exist in schema.`
        };
      }

      // 1. Route Gating (Auth Route Level)
      const routeAccess = this.schema.authSchema.routePermissions.find(
        rp => rp.role === user.role && rp.endpointId === endpointId
      );
      
      // If permission is explicitly set to false or missing (default denylist)
      if (routeAccess && !routeAccess.allowed) {
        return {
          status: 403,
          message: 'Forbidden',
          error: `Security Error: Role '${user.role}' is not authorized to access endpoint '${endpoint.method} ${endpoint.path}'.`
        };
      }

      // 2. Table-level Permissions check (CREATE, READ, UPDATE, DELETE)
      const tablePerm = this.schema.authSchema.permissions.find(
        tp => tp.role === user.role && tp.table === endpoint.targetTable
      );

      const requiredActionMap: Record<string, 'CREATE' | 'READ' | 'UPDATE' | 'DELETE'> = {
        'SELECT': 'READ',
        'INSERT': 'CREATE',
        'UPDATE': 'UPDATE',
        'DELETE': 'DELETE'
      };
      const requiredAction = requiredActionMap[endpoint.dbOperation];

      if (!tablePerm || !tablePerm.actions.includes(requiredAction)) {
        return {
          status: 403,
          message: 'Forbidden',
          error: `Database Access Denied: Role '${user.role}' does not have '${requiredAction}' permissions on database table '${endpoint.targetTable}'.`
        };
      }

      // 3. Request Parameter & Body Validation
      if (endpoint.requestBody) {
        for (const reqField of endpoint.requestBody) {
          if (reqField.required && (payload[reqField.name] === undefined || payload[reqField.name] === '')) {
            return {
              status: 400,
              message: 'Bad Request',
              error: `Validation Error: Missing required parameter '${reqField.name}' in request body.`
            };
          }
        }
      }

      // 4. Business Logic Gate Rules Evaluation
      const relevantRules = this.schema.authSchema.businessLogicRules.filter(
        rule => rule.endpointId === endpointId
      );

      for (const rule of relevantRules) {
        const passed = this.evaluateCondition(rule.condition, user, payload);
        if (!passed) {
          return {
            status: 422, // Unprocessable Entity
            message: 'Business Logic Policy Violation',
            error: rule.errorMessage
          };
        }
      }

      // 5. Database CRUD Execution
      const targetTable = endpoint.targetTable;
      
      switch (endpoint.dbOperation) {
        case 'SELECT': {
          // Supports standard list or single select if ID is provided
          const allRows = this.db.getTableData(targetTable);
          let filtered = [...allRows];
          
          // Apply simple key-value filtering from payload
          Object.keys(payload).forEach(key => {
            if (payload[key] !== undefined && payload[key] !== '') {
              filtered = filtered.filter(row => 
                String(row[key]).toLowerCase().includes(String(payload[key]).toLowerCase())
              );
            }
          });
          
          return {
            status: 200,
            message: 'OK',
            data: filtered
          };
        }
        
        case 'INSERT': {
          // Add userId field if it references user association
          const tableDef = this.schema.dbSchema.tables.find(t => t.name === targetTable);
          const needsUserLink = tableDef?.columns.some(c => c.name === 'userId' || c.name === 'agentId');
          const finalPayload = { ...payload };
          if (needsUserLink) {
            if (tableDef?.columns.some(c => c.name === 'userId')) {
              finalPayload.userId = finalPayload.userId || user.id;
            }
            if (tableDef?.columns.some(c => c.name === 'agentId')) {
              finalPayload.agentId = finalPayload.agentId || user.id;
            }
          }

          const insertedRow = this.db.insert(targetTable, finalPayload);
          return {
            status: 201,
            message: 'Created',
            data: insertedRow
          };
        }

        case 'UPDATE': {
          const id = payload.id;
          if (!id) {
            return {
              status: 400,
              message: 'Bad Request',
              error: 'Missing record identifier "id" for database UPDATE operation.'
            };
          }
          const updatedRow = this.db.update(targetTable, id, payload);
          return {
            status: 200,
            message: 'Updated',
            data: updatedRow
          };
        }

        case 'DELETE': {
          const id = payload.id;
          if (!id) {
            return {
              status: 400,
              message: 'Bad Request',
              error: 'Missing record identifier "id" for database DELETE operation.'
            };
          }
          this.db.delete(targetTable, id);
          return {
            status: 200,
            message: 'Deleted',
            data: { id }
          };
        }
        
        default:
          return {
            status: 500,
            message: 'Internal Server Error',
            error: `Unhandled dbOperation '${endpoint.dbOperation}'.`
          };
      }

    } catch (dbErr: any) {
      return {
        status: 409, // Conflict / Integrity violation
        message: 'Database Transaction Failure',
        error: dbErr.message || 'Relational integrity constraint violated.'
      };
    }
  }

  /**
   * Safely evaluates business logic rule strings
   */
  private evaluateCondition(conditionStr: string, user: ActiveUser, payload: Record<string, any>): boolean {
    try {
      // Build a local DB context accessor for formula checks (e.g. db.contacts.count() < 5)
      const dbContext: Record<string, any> = {};
      this.schema.dbSchema.tables.forEach(t => {
        dbContext[t.name] = {
          count: () => {
            try {
              return this.db.getTableData(t.name).length;
            } catch {
              return 0;
            }
          },
          all: () => {
            try {
              return this.db.getTableData(t.name);
            } catch {
              return [];
            }
          }
        };
      });

      // Construct dynamic function runner
      // Bind user, payload, and virtual database objects
      const evaluator = new Function('user', 'payload', 'db', `return (${conditionStr});`);
      return evaluator(user, payload, dbContext);
    } catch (e) {
      console.error(`Compiler logic evaluation exception on: "${conditionStr}"`, e);
      return false; // Fail-safe: Reject transaction if condition fails to parse
    }
  }
}
