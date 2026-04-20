declare module "@aws/aurora-dsql-node-postgres-connector" {
  export class AuroraDSQLClient {
    constructor(config: Record<string, unknown>);
    connect(): Promise<void>;
    query(sql: string): Promise<{
      rowCount: number;
      rows: unknown[];
    }>;
    end(): Promise<void>;
  }
}
