import { SupabaseClient } from '@supabase/supabase-js';
import { queryCache } from './cache';

export interface QueryOptions {
  cache?: {
    enabled?: boolean;
    ttl?: number;
    key?: string;
  };
  pagination?: {
    page?: number;
    pageSize?: number;
    cursor?: string;
  };
  optimize?: {
    selectOnly?: string[]; // Only select specific columns
    includeCount?: boolean; // Include total count for pagination
    indexHints?: string[]; // Database index hints
  };
}

export class OptimizedQuery {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Create an optimized query builder
   */
  from(table: string) {
    return new QueryBuilder(this.supabase, table);
  }

  /**
   * Execute a cached query
   */
  async cached<T>(
    key: string,
    queryFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    return queryCache.get(key, queryFn, ttl);
  }

  /**
   * Invalidate cache entries
   */
  invalidateCache(pattern: string | RegExp) {
    queryCache.invalidatePattern(pattern);
  }
}

class QueryBuilder {
  private query: any;
  private options: QueryOptions = {};

  constructor(
    private supabase: SupabaseClient,
    private table: string
  ) {
    this.query = this.supabase.from(table);
  }

  /**
   * Configure query options
   */
  withOptions(options: QueryOptions): this {
    this.options = { ...this.options, ...options };
    return this;
  }

  /**
   * Select specific columns for optimization
   */
  select(columns?: string | string[]): this {
    if (Array.isArray(columns)) {
      this.query = this.query.select(columns.join(','));
    } else if (columns) {
      this.query = this.query.select(columns);
    } else if (this.options.optimize?.selectOnly) {
      this.query = this.query.select(this.options.optimize.selectOnly.join(','));
    } else {
      this.query = this.query.select('*');
    }
    return this;
  }

  /**
   * Add filtering
   */
  filter(column: string, operator: string, value: any): this {
    this.query = this.query.filter(column, operator, value);
    return this;
  }

  /**
   * Add multiple filters
   */
  filters(filters: Array<{ column: string; operator: string; value: any }>): this {
    filters.forEach(f => {
      this.query = this.query.filter(f.column, f.operator, f.value);
    });
    return this;
  }

  /**
   * Add ordering
   */
  order(column: string, options?: { ascending?: boolean; nullsFirst?: boolean }): this {
    this.query = this.query.order(column, options);
    return this;
  }

  /**
   * Apply cursor-based pagination
   */
  paginate(): this {
    const { pagination } = this.options;
    
    if (pagination?.cursor) {
      // Cursor-based pagination
      this.query = this.query.gt('id', pagination.cursor);
      if (pagination.pageSize) {
        this.query = this.query.limit(pagination.pageSize);
      }
    } else if (pagination?.page && pagination?.pageSize) {
      // Offset-based pagination
      const offset = (pagination.page - 1) * pagination.pageSize;
      this.query = this.query.range(offset, offset + pagination.pageSize - 1);
    }
    
    return this;
  }

  /**
   * Execute the query with caching
   */
  async execute<T>(): Promise<{
    data: T[] | null;
    error: any;
    count?: number;
    nextCursor?: string;
  }> {
    const executeQuery = async () => {
      let result;
      
      if (this.options.optimize?.includeCount) {
        // Execute with count
        result = await this.query.then((res: any) => ({
          ...res,
          count: res.count || res.data?.length || 0
        }));
      } else {
        result = await this.query;
      }
      
      // Add next cursor for pagination
      if (result.data && result.data.length > 0 && this.options.pagination?.pageSize) {
        const lastItem = result.data[result.data.length - 1];
        result.nextCursor = lastItem.id;
      }
      
      return result;
    };

    // Use cache if enabled
    if (this.options.cache?.enabled) {
      const cacheKey = this.options.cache.key || this.generateCacheKey();
      return queryCache.get(cacheKey, executeQuery, this.options.cache.ttl);
    }

    return executeQuery();
  }

  /**
   * Execute and get single result
   */
  async single<T>(): Promise<{ data: T | null; error: any }> {
    this.query = this.query.single();
    
    const executeQuery = async () => {
      return this.query;
    };

    if (this.options.cache?.enabled) {
      const cacheKey = this.options.cache.key || this.generateCacheKey();
      return queryCache.get(cacheKey, executeQuery, this.options.cache.ttl);
    }

    return executeQuery();
  }

  /**
   * Generate cache key from query parameters
   */
  private generateCacheKey(): string {
    const parts = [
      'query',
      this.table,
      JSON.stringify(this.options),
      // Add any filters, ordering, etc. from the query object
    ];
    return parts.join(':');
  }
}

// Export singleton instance
let optimizedQueryInstance: OptimizedQuery | null = null;

export function createOptimizedQuery(supabase: SupabaseClient): OptimizedQuery {
  if (!optimizedQueryInstance) {
    optimizedQueryInstance = new OptimizedQuery(supabase);
  }
  return optimizedQueryInstance;
}

// Utility functions for common optimizations

/**
 * Create indexes on commonly queried fields
 * Run these as migrations in your database
 */
export const RECOMMENDED_INDEXES = {
  // Objekt table indexes
  objekt: [
    'CREATE INDEX idx_objekt_status ON objekt(status)',
    'CREATE INDEX idx_objekt_typ ON objekt(typ)',
    'CREATE INDEX idx_objekt_created_at ON objekt(created_at DESC)',
    'CREATE INDEX idx_objekt_user_id ON objekt(user_id)',
    'CREATE INDEX idx_objekt_pris ON objekt(pris)',
    'CREATE INDEX idx_objekt_kommun ON objekt(kommun)',
  ],
  
  // Kontakter table indexes
  kontakter: [
    'CREATE INDEX idx_kontakter_typ ON kontakter(typ)',
    'CREATE INDEX idx_kontakter_status ON kontakter(status)',
    'CREATE INDEX idx_kontakter_created_at ON kontakter(created_at DESC)',
    'CREATE INDEX idx_kontakter_user_id ON kontakter(user_id)',
    'CREATE INDEX idx_kontakter_email ON kontakter(email)',
  ],
  
  // Visningar table indexes
  visningar: [
    'CREATE INDEX idx_visningar_objekt_id ON visningar(objekt_id)',
    'CREATE INDEX idx_visningar_datum ON visningar(datum)',
    'CREATE INDEX idx_visningar_status ON visningar(status)',
  ],
};

/**
 * Query optimization tips
 */
export const OPTIMIZATION_TIPS = {
  // Use specific column selection instead of SELECT *
  selectColumns: 'Always specify exact columns needed instead of using SELECT *',
  
  // Use proper indexing
  indexing: 'Ensure indexes exist on columns used in WHERE, ORDER BY, and JOIN clauses',
  
  // Limit result sets
  pagination: 'Always paginate large result sets using cursor-based pagination when possible',
  
  // Cache frequently accessed data
  caching: 'Cache read-heavy queries that don\'t change frequently',
  
  // Batch operations
  batching: 'Batch multiple operations into single transactions when possible',
  
  // Avoid N+1 queries
  eager: 'Use joins or batch fetching to avoid N+1 query problems',
};