declare module 'sql.js' {
  interface Database {
    run(sql: string, params?: unknown[]): Database
    exec(sql: string, params?: unknown[]): QueryExecResult[]
    each(sql: string, params: unknown[], callback: (row: Record<string, unknown>) => void, done: () => void): Database
    prepare(sql: string): Statement
    export(): Uint8Array
    close(): void
    getRowsModified(): number
  }

  interface Statement {
    bind(params?: unknown[]): boolean
    step(): boolean
    getAsObject(params?: Record<string, unknown>): Record<string, unknown>
    get(params?: unknown[]): unknown[]
    free(): boolean
    reset(): void
  }

  interface QueryExecResult {
    columns: string[]
    values: unknown[][]
  }

  interface SqlJsStatic {
    Database: new (data?: ArrayLike<number>) => Database
  }

  interface InitSqlJsOptions {
    locateFile?: (file: string) => string
  }

  export default function initSqlJs(options?: InitSqlJsOptions): Promise<SqlJsStatic>
  export type { Database, Statement, QueryExecResult, SqlJsStatic }
}
