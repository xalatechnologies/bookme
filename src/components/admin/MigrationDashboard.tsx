/**
 * Migration Dashboard Component
 * UI for managing localStorage → Supabase migration with progress tracking
 *
 * @author typescript-pro
 * @date 2025-01-28
 */

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  MIGRATION_PHASES,
  MIGRATION_PHASE_NAMES,
  getCurrentMigrationPhase,
  setMigrationPhase,
  type MigrationPhase,
} from '@/config/migrationConfig';
import {
  migrateBookingsToSupabase,
  validateDataConsistency,
  rollbackToLocalStorage,
  cleanupLocalStorage,
  getMigrationValidation,
  exportMigrationData,
  type MigrationProgress,
} from '@/utils/migrationUtils';
import type { MigrationResult, ValidationResult } from '@/types/supabase/database.types';
import { AlertCircle, CheckCircle, Database, Download, Upload, RefreshCw } from 'lucide-react';

interface MigrationDashboardProps {
  readonly userId: string;
}

export const MigrationDashboard = ({ userId }: MigrationDashboardProps): JSX.Element => {
  const [currentPhase, setCurrentPhase] = useState<MigrationPhase>(getCurrentMigrationPhase());
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<MigrationProgress | null>(null);
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePhaseChange = useCallback((newPhase: MigrationPhase) => {
    setMigrationPhase(newPhase);
    setCurrentPhase(newPhase);
    setError(null);
  }, []);

  const handleMigrate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setProgress(null);
    setMigrationResult(null);

    try {
      const result = await migrateBookingsToSupabase(userId, (prog) => {
        setProgress(prog);
      });

      setMigrationResult(result);

      if (result.success) {
        // Automatically advance to next phase on success
        if (currentPhase === MIGRATION_PHASES.LOCALSTORAGE_ONLY) {
          handlePhaseChange(MIGRATION_PHASES.READ_FALLBACK);
        } else if (currentPhase === MIGRATION_PHASES.READ_FALLBACK) {
          handlePhaseChange(MIGRATION_PHASES.WRITE_BOTH);
        }
      } else {
        setError(`Migration completed with ${result.errors.length} errors`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Migration failed');
    } finally {
      setIsLoading(false);
    }
  }, [userId, currentPhase, handlePhaseChange]);

  const handleValidate = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const isConsistent = await validateDataConsistency(userId);
      const validation = await getMigrationValidation();

      setValidationResult(validation);

      if (!isConsistent) {
        setError('Data consistency validation failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Validation failed');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const handleRollback = useCallback(async () => {
    if (!confirm('Are you sure you want to rollback the migration? This will reset migration status in Supabase.')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await rollbackToLocalStorage(userId);
      handlePhaseChange(MIGRATION_PHASES.LOCALSTORAGE_ONLY);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rollback failed');
    } finally {
      setIsLoading(false);
    }
  }, [userId, handlePhaseChange]);

  const handleCleanup = useCallback(async () => {
    if (!confirm('Are you sure you want to clear localStorage? This cannot be undone. Make sure migration is successful!')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await cleanupLocalStorage(['pendingBookings', 'processedBookings', 'draftBooking']);
      handlePhaseChange(MIGRATION_PHASES.SUPABASE_ONLY);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cleanup failed');
    } finally {
      setIsLoading(false);
    }
  }, [handlePhaseChange]);

  const handleExport = useCallback(() => {
    try {
      exportMigrationData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    }
  }, []);

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Migration Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage localStorage → Supabase data migration
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleExport}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Backup
          </Button>
        </div>
      </div>

      {/* Current Phase */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Current Phase</h2>
          <div className={`px-4 py-2 rounded-lg font-medium ${
            currentPhase === MIGRATION_PHASES.SUPABASE_ONLY
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
          }`}>
            {MIGRATION_PHASE_NAMES[currentPhase]}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          {Object.entries(MIGRATION_PHASE_NAMES).map(([phaseNum, phaseName]) => {
            const phase = parseInt(phaseNum) as MigrationPhase;
            const isActive = phase === currentPhase;
            const isCompleted = phase < currentPhase;

            return (
              <div
                key={phase}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isActive
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                    : isCompleted
                    ? 'border-green-500 bg-green-50 dark:bg-green-950'
                    : 'border-gray-300 bg-gray-50 dark:bg-gray-900'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phase {phase}
                  </span>
                  {isCompleted && <CheckCircle className="h-5 w-5 text-green-600" />}
                  {isActive && <RefreshCw className="h-5 w-5 text-blue-600 animate-pulse" />}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">{phaseName}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Progress */}
      {progress && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Migration Progress
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>
                  {progress.phase.charAt(0).toUpperCase() + progress.phase.slice(1)}
                </span>
                <span>
                  {progress.current} / {progress.total} ({Math.round(progress.percentage)}%)
                </span>
              </div>
              <Progress value={progress.percentage} className="h-3" />
            </div>
          </div>
        </Card>
      )}

      {/* Migration Result */}
      {migrationResult && (
        <Card className="p-6">
          <div className="flex items-start gap-3">
            {migrationResult.success ? (
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
            ) : (
              <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Migration Result
              </h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {migrationResult.bookings_migrated}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Bookings Migrated</div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {migrationResult.preferences_migrated}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Preferences Migrated</div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {migrationResult.drafts_migrated}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Drafts Migrated</div>
                </div>
              </div>

              {migrationResult.errors.length > 0 && (
                <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                  <h4 className="font-medium text-yellow-900 dark:text-yellow-200 mb-2">
                    Errors ({migrationResult.errors.length})
                  </h4>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {migrationResult.errors.map((err, idx) => (
                      <p key={idx} className="text-sm text-yellow-800 dark:text-yellow-300">
                        • {err}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Validation Result */}
      {validationResult && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Validation Results
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {validationResult.total_migrated}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Total Migrated</div>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
              <div className="text-xl font-bold text-red-900 dark:text-red-200">
                {validationResult.invalid_dates}
              </div>
              <div className="text-xs text-red-600 dark:text-red-400">Invalid Dates</div>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
              <div className="text-xl font-bold text-red-900 dark:text-red-200">
                {validationResult.invalid_prices}
              </div>
              <div className="text-xs text-red-600 dark:text-red-400">Invalid Prices</div>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
              <div className="text-xl font-bold text-red-900 dark:text-red-200">
                {validationResult.missing_facilities}
              </div>
              <div className="text-xs text-red-600 dark:text-red-400">Missing Facilities</div>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
              <div className="text-xl font-bold text-red-900 dark:text-red-200">
                {validationResult.missing_users}
              </div>
              <div className="text-xs text-red-600 dark:text-red-400">Missing Users</div>
            </div>
          </div>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="p-6 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-2">Error</h3>
              <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            onClick={handleMigrate}
            disabled={isLoading || currentPhase === MIGRATION_PHASES.SUPABASE_ONLY}
            className="h-12 flex items-center justify-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Start Migration
          </Button>

          <Button
            onClick={handleValidate}
            disabled={isLoading || currentPhase === MIGRATION_PHASES.LOCALSTORAGE_ONLY}
            variant="outline"
            className="h-12 flex items-center justify-center gap-2"
          >
            <Database className="h-4 w-4" />
            Validate Data
          </Button>

          <Button
            onClick={handleRollback}
            disabled={isLoading || currentPhase === MIGRATION_PHASES.LOCALSTORAGE_ONLY}
            variant="outline"
            className="h-12 flex items-center justify-center gap-2 text-yellow-600 border-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-950"
          >
            <RefreshCw className="h-4 w-4" />
            Rollback
          </Button>

          <Button
            onClick={handleCleanup}
            disabled={isLoading || currentPhase !== MIGRATION_PHASES.WRITE_BOTH}
            variant="destructive"
            className="h-12 flex items-center justify-center gap-2"
          >
            <AlertCircle className="h-4 w-4" />
            Clear localStorage
          </Button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">Migration Guide</h4>
          <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-300">
            <li>• <strong>Phase 0:</strong> Only localStorage (current state)</li>
            <li>• <strong>Phase 1:</strong> Read from Supabase, fallback to localStorage</li>
            <li>• <strong>Phase 2:</strong> Write to both, validate consistency</li>
            <li>• <strong>Phase 3:</strong> Supabase only, localStorage cleared</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};
