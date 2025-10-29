/**
 * Migration Configuration
 * Controls the localStorage → Supabase migration phases
 *
 * @author typescript-pro
 * @date 2025-01-28
 */

export const MIGRATION_PHASES = {
  LOCALSTORAGE_ONLY: 0,      // Legacy (before migration starts)
  READ_FALLBACK: 1,           // Phase 1: Read Supabase, fallback to localStorage
  WRITE_BOTH: 2,              // Phase 2: Write to both, read from Supabase
  SUPABASE_ONLY: 3            // Phase 3: Full migration complete
} as const;

export type MigrationPhase = typeof MIGRATION_PHASES[keyof typeof MIGRATION_PHASES];

export interface MigrationConfig {
  readonly currentPhase: MigrationPhase;
  readonly enableLogging: boolean;
  readonly validateConsistency: boolean;
  readonly autoCleanupAfterMigration: boolean;
  readonly batchSize: number;
  readonly retryAttempts: number;
  readonly retryDelay: number; // milliseconds
}

// Default configuration
export const defaultMigrationConfig: MigrationConfig = {
  currentPhase: MIGRATION_PHASES.LOCALSTORAGE_ONLY,
  enableLogging: process.env.NODE_ENV === 'development',
  validateConsistency: true,
  autoCleanupAfterMigration: false,
  batchSize: 50,
  retryAttempts: 3,
  retryDelay: 1000,
};

// Feature flags for gradual rollout
export interface MigrationFeatureFlags {
  readonly enableMigration: boolean;
  readonly enablePhase1: boolean; // Read fallback
  readonly enablePhase2: boolean; // Write both
  readonly enablePhase3: boolean; // Supabase only
  readonly rolloutPercentage: number; // 0-100
}

export const defaultFeatureFlags: MigrationFeatureFlags = {
  enableMigration: false,
  enablePhase1: false,
  enablePhase2: false,
  enablePhase3: false,
  rolloutPercentage: 0,
};

/**
 * Get current migration phase from localStorage
 */
export const getCurrentMigrationPhase = (): MigrationPhase => {
  try {
    const stored = localStorage.getItem('migration-phase');
    if (stored) {
      const phase = parseInt(stored, 10);
      if (phase in MIGRATION_PHASES) {
        return phase as MigrationPhase;
      }
    }
  } catch (error) {
    console.error('Failed to read migration phase:', error);
  }
  return MIGRATION_PHASES.LOCALSTORAGE_ONLY;
};

/**
 * Set migration phase
 */
export const setMigrationPhase = (phase: MigrationPhase): void => {
  try {
    localStorage.setItem('migration-phase', phase.toString());
    if (defaultMigrationConfig.enableLogging) {
      console.log(`Migration phase updated to: ${phase}`);
    }
  } catch (error) {
    console.error('Failed to set migration phase:', error);
  }
};

/**
 * Get feature flags (can be overridden via environment or remote config)
 */
export const getFeatureFlags = (): MigrationFeatureFlags => {
  // In production, this would fetch from a feature flag service
  // For now, read from environment variables
  return {
    enableMigration: process.env.VITE_ENABLE_MIGRATION === 'true',
    enablePhase1: process.env.VITE_ENABLE_PHASE_1 === 'true',
    enablePhase2: process.env.VITE_ENABLE_PHASE_2 === 'true',
    enablePhase3: process.env.VITE_ENABLE_PHASE_3 === 'true',
    rolloutPercentage: parseInt(process.env.VITE_ROLLOUT_PERCENTAGE || '0', 10),
  };
};

/**
 * Check if user is in migration rollout
 */
export const isUserInRollout = (userId: string): boolean => {
  const flags = getFeatureFlags();
  if (!flags.enableMigration) {
    return false;
  }

  // Simple hash-based rollout
  const hash = userId.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);

  const percentage = Math.abs(hash % 100);
  return percentage < flags.rolloutPercentage;
};

/**
 * Log migration event (if logging enabled)
 */
export const logMigrationEvent = (
  event: string,
  data?: Record<string, any>
): void => {
  if (defaultMigrationConfig.enableLogging) {
    console.log(`[Migration] ${event}`, data || '');
  }
};

/**
 * Migration phase names for UI display
 */
export const MIGRATION_PHASE_NAMES: Record<MigrationPhase, string> = {
  [MIGRATION_PHASES.LOCALSTORAGE_ONLY]: 'localStorage Only',
  [MIGRATION_PHASES.READ_FALLBACK]: 'Phase 1: Read with Fallback',
  [MIGRATION_PHASES.WRITE_BOTH]: 'Phase 2: Write to Both',
  [MIGRATION_PHASES.SUPABASE_ONLY]: 'Phase 3: Supabase Only',
};
