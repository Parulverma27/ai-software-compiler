import { DbSchema } from '../types/schema';

export class VirtualDatabase {
  private schema: DbSchema;
  private storageKey: string;
  private data: Record<string, any[]> = {};

  constructor(appName: string, schema: DbSchema) {
    this.schema = schema;
    this.storageKey = `virtual_db_${appName.replace(/\s+/g, '_').toLowerCase()}`;
    this.initialize();
  }

  private initialize() {
    // Attempt to load from localStorage
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try {
        this.data = JSON.parse(saved);
        // Verify all tables in schema exist in data
        this.schema.tables.forEach(t => {
          if (!this.data[t.name]) this.data[t.name] = [];
        });
        return;
      } catch (e) {
        console.error('Failed to parse virtual db storage, resetting...', e);
      }
    }

    // Otherwise initialize empty tables and seed realistic data
    this.data = {};
    this.schema.tables.forEach(t => {
      this.data[t.name] = [];
    });
    
    this.seedDefaultData();
    this.save();
  }

  private save() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.data));
  }

  private seedDefaultData() {
    const tableNames = this.schema.tables.map(t => t.name);

    // Seed users first (used in CRM and Tasks)
    if (tableNames.includes('users')) {
      this.data['users'] = [
        { id: 'usr-1', name: 'Alice Admin', email: 'alice@nexus.com', role: 'Admin', plan: 'premium' },
        { id: 'usr-2', name: 'Bob Salesman', email: 'bob@nexus.com', role: 'Sales Manager', plan: 'premium' },
        { id: 'usr-3', name: 'Charlie Rep', email: 'charlie@nexus.com', role: 'General Agent', plan: 'free' }
      ];
    }

    // Seed CRM-specific data
    if (tableNames.includes('contacts')) {
      this.data['contacts'] = [
        { id: 'con-1', name: 'Sarah Connor', email: 'sarah@skynet.com', phone: '555-0199', company: 'Cyberdyne Systems', status: 'Won', agentId: 'usr-2' },
        { id: 'con-2', name: 'Bruce Wayne', email: 'bruce@waynecorp.com', phone: '555-1939', company: 'Wayne Enterprises', status: 'Contacted', agentId: 'usr-2' },
        { id: 'con-3', name: 'Clark Kent', email: 'clark@dailyplanet.com', phone: '555-1938', company: 'Daily Planet', status: 'Lead', agentId: 'usr-3' },
        { id: 'con-4', name: 'Peter Parker', email: 'peter@dailybugle.com', phone: '555-1962', company: 'Daily Bugle', status: 'Lead', agentId: 'usr-3' }
      ];
    }
    
    if (tableNames.includes('deals')) {
      this.data['deals'] = [
        { id: 'deal-1', title: 'Defense Contract Upgrade', value: 85000, stage: 'Negotiating', contactId: 'con-1' },
        { id: 'deal-2', title: 'Batcave Tech Supply', value: 250000, stage: 'Proposal', contactId: 'con-2' },
        { id: 'deal-3', title: 'Newsroom Ad Space', value: 12000, stage: 'Proposal', contactId: 'con-3' }
      ];
    }

    // Seed Task Management data
    if (tableNames.includes('tasks')) {
      this.data['tasks'] = [
        { id: 'tsk-1', title: 'Compile quarterly performance metrics', status: 'Doing', priority: 'High', dueDate: '2026-06-15', userId: 'usr-2' },
        { id: 'tsk-2', title: 'Design database entity relationships schema', status: 'Done', priority: 'High', dueDate: '2026-06-03', userId: 'usr-1' },
        { id: 'tsk-3', title: 'Draft business logic rules for free accounts', status: 'Todo', priority: 'Medium', dueDate: '2026-06-20', userId: 'usr-3' },
        { id: 'tsk-4', title: 'Review API payload structures and permissions', status: 'Todo', priority: 'Low', dueDate: '2026-06-25', userId: 'usr-3' }
      ];
    }

    // Seed E-commerce data
    if (tableNames.includes('products')) {
      this.data['products'] = [
        { id: 'prod-1', title: 'Retina Display Pro Monitor', price: 1299, stock: 15 },
        { id: 'prod-2', title: 'Mechanical Wireless Keyboard', price: 189, stock: 45 },
        { id: 'prod-3', title: 'Ergonomic Standing Office Desk', price: 650, stock: 8 },
        { id: 'prod-4', title: 'Noise Cancelling Headphones', price: 349, stock: 20 }
      ];
    }

    if (tableNames.includes('orders') && tableNames.includes('products')) {
      this.data['orders'] = [
        { id: 'ord-1', productId: 'prod-1', quantity: 1, totalPrice: 1299, customerName: 'Tony Stark' },
        { id: 'ord-2', productId: 'prod-2', quantity: 2, totalPrice: 378, customerName: 'Steve Rogers' }
      ];
    }

    // Seeding custom/fallback tables
    this.schema.tables.forEach(table => {
      if (this.data[table.name].length === 0) {
        // Create generic records
        const cols = table.columns;
        const record1: Record<string, any> = { id: `${table.name.substring(0, 3)}-1` };
        const record2: Record<string, any> = { id: `${table.name.substring(0, 3)}-2` };
        
        cols.forEach(col => {
          if (col.primaryKey) return;
          if (col.type === 'string') {
            record1[col.name] = `Sample ${col.name} A`;
            record2[col.name] = `Sample ${col.name} B`;
          } else if (col.type === 'number') {
            record1[col.name] = 100;
            record2[col.name] = 250;
          } else if (col.type === 'boolean') {
            record1[col.name] = true;
            record2[col.name] = false;
          } else if (col.type === 'date') {
            record1[col.name] = new Date().toISOString().split('T')[0];
            record2[col.name] = new Date().toISOString().split('T')[0];
          }
        });
        this.data[table.name] = [record1, record2];
      }
    });
  }

  // Clear database to seed fresh
  public resetDatabase() {
    localStorage.removeItem(this.storageKey);
    this.initialize();
  }

  public getTableData(tableName: string): any[] {
    if (!this.data[tableName]) {
      throw new Error(`Table '${tableName}' does not exist in virtual database.`);
    }
    return this.data[tableName];
  }

  public insert(tableName: string, record: Record<string, any>) {
    const tableDef = this.schema.tables.find(t => t.name === tableName);
    if (!tableDef) {
      throw new Error(`Table '${tableName}' does not exist.`);
    }

    const tableData = this.getTableData(tableName);

    // 1. Primary Key Check
    const pkCol = tableDef.columns.find(c => c.primaryKey);
    const pkName = pkCol ? pkCol.name : 'id';
    const pkValue = record[pkName] || `rec-${Math.random().toString(36).substring(2, 9)}`;
    
    const exists = tableData.some(r => r[pkName] === pkValue);
    if (exists) {
      throw new Error(`Duplicate Primary Key Exception: Record with ${pkName}='${pkValue}' already exists in table '${tableName}'.`);
    }

    const rowToInsert = { ...record, [pkName]: pkValue };

    // 2. Validate columns & data types
    tableDef.columns.forEach(col => {
      const val = rowToInsert[col.name];
      if (val === undefined || val === null) {
        if (!col.nullable && !col.primaryKey) {
          throw new Error(`Integrity Constraint Violation: Column '${col.name}' in table '${tableName}' cannot be null.`);
        }
        return;
      }

      // Type safety checks
      if (col.type === 'number' && typeof val !== 'number') {
        const parsed = Number(val);
        if (isNaN(parsed)) throw new Error(`Type Mismatch: Column '${col.name}' expects number, got value '${val}'.`);
        rowToInsert[col.name] = parsed;
      } else if (col.type === 'boolean' && typeof val !== 'boolean') {
        rowToInsert[col.name] = val === 'true' || val === true;
      }
    });

    // 3. Foreign Key Checks
    tableDef.columns.forEach(col => {
      if (col.foreignKey) {
        const val = rowToInsert[col.name];
        if (val === undefined || val === null) return; // Nullable FKs allowed

        const refTable = col.foreignKey.table;
        const refCol = col.foreignKey.column;
        const refData = this.getTableData(refTable);

        const refExists = refData.some(r => r[refCol] === val);
        if (!refExists) {
          throw new Error(`Foreign Key Constraint Violation: Column '${col.name}' value '${val}' in table '${tableName}' references non-existent row in table '${refTable}' (${refCol}).`);
        }
      }
    });

    tableData.push(rowToInsert);
    this.save();
    return rowToInsert;
  }

  public update(tableName: string, pkValue: string, updates: Record<string, any>) {
    const tableDef = this.schema.tables.find(t => t.name === tableName);
    if (!tableDef) throw new Error(`Table '${tableName}' does not exist.`);

    const pkCol = tableDef.columns.find(c => c.primaryKey);
    const pkName = pkCol ? pkCol.name : 'id';

    const tableData = this.getTableData(tableName);
    const rowIdx = tableData.findIndex(r => r[pkName] === pkValue);
    if (rowIdx === -1) {
      throw new Error(`Record Not Found: No row in '${tableName}' has ${pkName}='${pkValue}'.`);
    }

    const originalRow = tableData[rowIdx];
    const updatedRow = { ...originalRow, ...updates, [pkName]: pkValue }; // Prevent PK modifications

    // Validate type safety and foreign keys
    tableDef.columns.forEach(col => {
      const val = updatedRow[col.name];
      if (val === undefined || val === null) {
        if (!col.nullable && !col.primaryKey) {
          throw new Error(`Constraint Violation: Column '${col.name}' cannot be null.`);
        }
        return;
      }

      if (col.type === 'number' && typeof val !== 'number') {
        const parsed = Number(val);
        if (isNaN(parsed)) throw new Error(`Type Mismatch: Column '${col.name}' expects number.`);
        updatedRow[col.name] = parsed;
      }

      // Foreign Key
      if (col.foreignKey && val !== originalRow[col.name]) {
        const refTable = col.foreignKey.table;
        const refCol = col.foreignKey.column;
        const refData = this.getTableData(refTable);
        const refExists = refData.some(r => r[refCol] === val);
        if (!refExists) {
          throw new Error(`FK Error: Referenced key '${val}' not found in '${refTable}'.`);
        }
      }
    });

    tableData[rowIdx] = updatedRow;
    this.save();
    return updatedRow;
  }

  public delete(tableName: string, pkValue: string) {
    const tableDef = this.schema.tables.find(t => t.name === tableName);
    if (!tableDef) throw new Error(`Table '${tableName}' does not exist.`);

    const pkCol = tableDef.columns.find(c => c.primaryKey);
    const pkName = pkCol ? pkCol.name : 'id';

    const tableData = this.getTableData(tableName);
    const rowIdx = tableData.findIndex(r => r[pkName] === pkValue);
    if (rowIdx === -1) {
      throw new Error(`Record Not Found: Cannot delete missing row.`);
    }

    // Relational Integrity: Check if any other table references this row via foreign keys
    this.schema.tables.forEach(otherTable => {
      otherTable.columns.forEach(col => {
        if (col.foreignKey && col.foreignKey.table === tableName && col.foreignKey.column === pkName) {
          const otherData = this.getTableData(otherTable.name);
          const referencesExist = otherData.some(r => r[col.name] === pkValue);
          if (referencesExist) {
            throw new Error(`Integrity Constraint Violation: Cannot delete row from '${tableName}' because it is referenced by active records in table '${otherTable.name}' (column '${col.name}').`);
          }
        }
      });
    });

    tableData.splice(rowIdx, 1);
    this.save();
    return true;
  }
}
