/**
 * Base Service Abstract Class
 *
 * Provides common CRUD operations for all domain services.
 * Implements SOLID principles with template method pattern.
 *
 * Features:
 * - Generic CRUD operations
 * - Consistent error handling
 * - Type-safe query building
 * - Pagination support
 * - Soft delete support
 * - Audit logging hooks
 *
 * @module services/supabase/base
 */

import { supabase } from './client';
import {
  handleSupabaseError,
  NotFoundError,
  ValidationError,
  type ServiceError,
} from './errors';
import type { PaginatedResponse, PaginationParams } from './types';

/**
 * Base configuration for services
 */
export interface BaseServiceConfig {
  readonly tableName: string;
  readonly idColumn?: string;
  readonly softDelete?: boolean;
  readonly deletedAtColumn?: string;
}

/**
 * Abstract base service class
 * All domain services should extend this class
 *
 * @template TRow - The database table row type
 * @template TInsert - The database table insert type
 * @template TUpdate - The database table update type
 */
export abstract class BaseService<TRow, TInsert, TUpdate> {
  protected abstract readonly config: BaseServiceConfig;

  /**
   * Get table name for this service
   */
  protected get tableName(): string {
    return this.config.tableName;
  }

  /**
   * Get ID column name (defaults to 'id')
   */
  protected get idColumn(): string {
    return this.config.idColumn ?? 'id';
  }

  /**
   * Check if soft delete is enabled
   */
  protected get softDeleteEnabled(): boolean {
    return this.config.softDelete ?? false;
  }

  /**
   * Get deleted_at column name
   */
  protected get deletedAtColumn(): string {
    return this.config.deletedAtColumn ?? 'deleted_at';
  }

  // ==========================================================================
  // CRUD Operations
  // ==========================================================================

  /**
   * Fetch all records
   * Excludes soft-deleted records if soft delete is enabled
   *
   * @param select - Columns to select (defaults to '*')
   * @returns Array of records
   */
  async getAll(select = '*'): Promise<TRow[]> {
    try {
      let query = supabase.from(this.tableName).select(select);

      // Exclude soft-deleted records
      if (this.softDeleteEnabled) {
        query = query.is(this.deletedAtColumn, null);
      }

      const { data, error } = await query;

      if (error) {
        throw handleSupabaseError(error, `getAll ${this.tableName}`);
      }

      return (data ?? []) as TRow[];
    } catch (error) {
      throw handleSupabaseError(error, `getAll ${this.tableName}`);
    }
  }

  /**
   * Fetch paginated records
   *
   * @param params - Pagination parameters
   * @param select - Columns to select
   * @returns Paginated response
   */
  async getPaginated(
    params: PaginationParams = {},
    select = '*'
  ): Promise<PaginatedResponse<TRow>> {
    try {
      const page = params.page ?? 1;
      const pageSize = params.pageSize ?? 10;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from(this.tableName)
        .select(select, { count: 'exact' });

      // Exclude soft-deleted records
      if (this.softDeleteEnabled) {
        query = query.is(this.deletedAtColumn, null);
      }

      const { data, error, count } = await query.range(from, to);

      if (error) {
        throw handleSupabaseError(error, `getPaginated ${this.tableName}`);
      }

      const totalCount = count ?? 0;
      const hasMore = to < totalCount - 1;

      return {
        data: (data ?? []) as TRow[],
        count: totalCount,
        page,
        pageSize,
        hasMore,
      };
    } catch (error) {
      throw handleSupabaseError(error, `getPaginated ${this.tableName}`);
    }
  }

  /**
   * Fetch a single record by ID
   *
   * @param id - Record ID
   * @param select - Columns to select
   * @returns Single record
   * @throws {NotFoundError} If record not found
   */
  async getById(id: string, select = '*'): Promise<TRow> {
    try {
      let query = supabase
        .from(this.tableName)
        .select(select)
        .eq(this.idColumn, id);

      // Exclude soft-deleted records
      if (this.softDeleteEnabled) {
        query = query.is(this.deletedAtColumn, null);
      }

      const { data, error } = await query.single();

      if (error) {
        throw handleSupabaseError(error, `getById ${this.tableName}`);
      }

      if (!data) {
        throw new NotFoundError(this.tableName, id);
      }

      return data as TRow;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw handleSupabaseError(error, `getById ${this.tableName}`);
    }
  }

  /**
   * Create a new record
   *
   * @param data - Record data to insert
   * @returns Created record
   */
  async create(data: TInsert): Promise<TRow> {
    try {
      // Validate data before insert
      await this.validateInsert(data);

      // Call before hook
      const processedData = await this.beforeCreate(data);

      const { data: created, error } = await supabase
        .from(this.tableName)
        .insert(processedData)
        .select()
        .single();

      if (error) {
        throw handleSupabaseError(error, `create ${this.tableName}`);
      }

      if (!created) {
        throw new ValidationError(`Failed to create ${this.tableName}`);
      }

      // Call after hook
      await this.afterCreate(created as TRow);

      return created as TRow;
    } catch (error) {
      throw handleSupabaseError(error, `create ${this.tableName}`);
    }
  }

  /**
   * Update an existing record
   *
   * @param id - Record ID
   * @param data - Data to update
   * @returns Updated record
   * @throws {NotFoundError} If record not found
   */
  async update(id: string, data: TUpdate): Promise<TRow> {
    try {
      // Validate data before update
      await this.validateUpdate(id, data);

      // Call before hook
      const processedData = await this.beforeUpdate(id, data);

      let query = supabase
        .from(this.tableName)
        .update(processedData)
        .eq(this.idColumn, id);

      // Exclude soft-deleted records
      if (this.softDeleteEnabled) {
        query = query.is(this.deletedAtColumn, null);
      }

      const { data: updated, error } = await query.select().single();

      if (error) {
        throw handleSupabaseError(error, `update ${this.tableName}`);
      }

      if (!updated) {
        throw new NotFoundError(this.tableName, id);
      }

      // Call after hook
      await this.afterUpdate(updated as TRow);

      return updated as TRow;
    } catch (error) {
      throw handleSupabaseError(error, `update ${this.tableName}`);
    }
  }

  /**
   * Delete a record (hard or soft delete)
   *
   * @param id - Record ID
   * @throws {NotFoundError} If record not found
   */
  async delete(id: string): Promise<void> {
    try {
      // Call before hook
      await this.beforeDelete(id);

      if (this.softDeleteEnabled) {
        // Soft delete - set deleted_at timestamp
        const { error } = await supabase
          .from(this.tableName)
          .update({ [this.deletedAtColumn]: new Date().toISOString() } as unknown as TUpdate)
          .eq(this.idColumn, id)
          .is(this.deletedAtColumn, null);

        if (error) {
          throw handleSupabaseError(error, `delete ${this.tableName}`);
        }
      } else {
        // Hard delete
        const { error } = await supabase
          .from(this.tableName)
          .delete()
          .eq(this.idColumn, id);

        if (error) {
          throw handleSupabaseError(error, `delete ${this.tableName}`);
        }
      }

      // Call after hook
      await this.afterDelete(id);
    } catch (error) {
      throw handleSupabaseError(error, `delete ${this.tableName}`);
    }
  }

  /**
   * Restore a soft-deleted record
   * Only works if soft delete is enabled
   *
   * @param id - Record ID
   * @throws {ValidationError} If soft delete not enabled
   */
  async restore(id: string): Promise<TRow> {
    if (!this.softDeleteEnabled) {
      throw new ValidationError('Restore operation requires soft delete to be enabled');
    }

    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({ [this.deletedAtColumn]: null } as unknown as TUpdate)
        .eq(this.idColumn, id)
        .select()
        .single();

      if (error) {
        throw handleSupabaseError(error, `restore ${this.tableName}`);
      }

      if (!data) {
        throw new NotFoundError(this.tableName, id);
      }

      return data as TRow;
    } catch (error) {
      throw handleSupabaseError(error, `restore ${this.tableName}`);
    }
  }

  /**
   * Check if a record exists
   *
   * @param id - Record ID
   * @returns True if record exists
   */
  async exists(id: string): Promise<boolean> {
    try {
      let query = supabase
        .from(this.tableName)
        .select(this.idColumn, { count: 'exact', head: true })
        .eq(this.idColumn, id);

      // Exclude soft-deleted records
      if (this.softDeleteEnabled) {
        query = query.is(this.deletedAtColumn, null);
      }

      const { count, error } = await query;

      if (error) {
        throw handleSupabaseError(error, `exists ${this.tableName}`);
      }

      return (count ?? 0) > 0;
    } catch (error) {
      throw handleSupabaseError(error, `exists ${this.tableName}`);
    }
  }

  /**
   * Count total records
   *
   * @returns Total record count
   */
  async count(): Promise<number> {
    try {
      let query = supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true });

      // Exclude soft-deleted records
      if (this.softDeleteEnabled) {
        query = query.is(this.deletedAtColumn, null);
      }

      const { count, error } = await query;

      if (error) {
        throw handleSupabaseError(error, `count ${this.tableName}`);
      }

      return count ?? 0;
    } catch (error) {
      throw handleSupabaseError(error, `count ${this.tableName}`);
    }
  }

  // ==========================================================================
  // Lifecycle Hooks (Override in subclasses)
  // ==========================================================================

  /**
   * Validate data before insert
   * Override in subclass for custom validation
   */
  protected async validateInsert(data: TInsert): Promise<void> {
    // Default: no validation
    // Subclasses should override this method
  }

  /**
   * Validate data before update
   * Override in subclass for custom validation
   */
  protected async validateUpdate(id: string, data: TUpdate): Promise<void> {
    // Default: no validation
    // Subclasses should override this method
  }

  /**
   * Hook called before creating a record
   * Override in subclass for custom preprocessing
   */
  protected async beforeCreate(data: TInsert): Promise<TInsert> {
    return data;
  }

  /**
   * Hook called after creating a record
   * Override in subclass for side effects
   */
  protected async afterCreate(data: TRow): Promise<void> {
    // Default: no action
  }

  /**
   * Hook called before updating a record
   * Override in subclass for custom preprocessing
   */
  protected async beforeUpdate(id: string, data: TUpdate): Promise<TUpdate> {
    return data;
  }

  /**
   * Hook called after updating a record
   * Override in subclass for side effects
   */
  protected async afterUpdate(data: TRow): Promise<void> {
    // Default: no action
  }

  /**
   * Hook called before deleting a record
   * Override in subclass for validation
   */
  protected async beforeDelete(id: string): Promise<void> {
    // Default: no action
  }

  /**
   * Hook called after deleting a record
   * Override in subclass for cleanup
   */
  protected async afterDelete(id: string): Promise<void> {
    // Default: no action
  }
}
