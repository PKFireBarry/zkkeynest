'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { validateDataIntegrity, repairDataIssues, runMigrations, needsMigration } from '@/lib/migration';
import { clearUserData } from '@/lib/database';
import BackupExport from './BackupExport';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import ConfirmationModal from './ConfirmationModal';
import { useSubscription } from '@/hooks/useSubscription';
import { 
  Database, 
  Shield, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Wrench,
  Download,
  Upload,
  Trash2
} from 'lucide-react';

interface DataManagementProps {
  onRefresh?: () => void;
}

export default function DataManagement({ onRefresh }: DataManagementProps) {
  const { user } = useUser();
  const { hasExportFunctionality } = useSubscription();
  
  const [integrityCheck, setIntegrityCheck] = useState<{
    valid: boolean;
    issues: string[];
  } | null>(null);
  const [repairResult, setRepairResult] = useState<{
    repaired: number;
    errors: string[];
  } | null>(null);
  const [migrationResult, setMigrationResult] = useState<{
    success: boolean;
    migrated: number;
    errors: string[];
    version: string;
  }[] | null>(null);
  const [needsMigrationCheck, setNeedsMigrationCheck] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isRepairing, setIsRepairing] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [showClearDataModal, setShowClearDataModal] = useState(false);

  const handleClearData = () => {
    setShowClearDataModal(true);
  };

  const handleConfirmClearData = async () => {
    if (user) {
      try {
        await clearUserData(user.id);
        window.location.reload();
      } catch (error) {
        console.error('Failed to clear data:', error);
      }
    }
  };

  const handleIntegrityCheck = async () => {
    if (!user) return;
    
    setIsChecking(true);
    setIntegrityCheck(null);
    
    try {
      const result = await validateDataIntegrity(user.id);
      setIntegrityCheck(result);
    } catch (error) {
      setIntegrityCheck({
        valid: false,
        issues: [`Failed to check data integrity: ${error instanceof Error ? error.message : 'Unknown error'}`]
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleRepairData = async () => {
    if (!user) return;
    
    setIsRepairing(true);
    setRepairResult(null);
    
    try {
      const result = await repairDataIssues(user.id);
      setRepairResult(result);
      
      if (result.repaired > 0) {
        onRefresh?.();
      }
    } catch (error) {
      setRepairResult({
        repaired: 0,
        errors: [`Failed to repair data: ${error instanceof Error ? error.message : 'Unknown error'}`]
      });
    } finally {
      setIsRepairing(false);
    }
  };

  const handleRunMigrations = async () => {
    if (!user) return;
    
    setIsMigrating(true);
    setMigrationResult(null);
    
    try {
      const results = await runMigrations(user.id);
      setMigrationResult(results);
      
      // Check if any migrations were successful
      const hasSuccessfulMigrations = results.some(result => result.success && result.migrated > 0);
      if (hasSuccessfulMigrations) {
        onRefresh?.();
      }
    } catch (error) {
      setMigrationResult([{
        success: false,
        migrated: 0,
        errors: [`Failed to run migrations: ${error instanceof Error ? error.message : 'Unknown error'}`],
        version: 'unknown'
      }]);
    } finally {
      setIsMigrating(false);
    }
  };

  const checkMigrationStatus = async () => {
    if (!user) return;
    
    try {
      const needsMigrationStatus = await needsMigration(user.id);
      setNeedsMigrationCheck(needsMigrationStatus);
    } catch (error) {
      console.error('Error checking migration status:', error);
    }
  };

  useEffect(() => {
    checkMigrationStatus();
  }, [user]);

  return (
    <div className="space-y-6">
      {/* Data Integrity Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Data Integrity
          </CardTitle>
          <CardDescription>
            Check and repair data integrity issues in your API keys.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={handleIntegrityCheck} 
              disabled={isChecking}
              variant="outline"
            >
              {isChecking ? 'Checking...' : 'Check Integrity'}
            </Button>
            
            {integrityCheck && !integrityCheck.valid && (
              <Button 
                onClick={handleRepairData} 
                disabled={isRepairing}
                variant="destructive"
              >
                {isRepairing ? 'Repairing...' : 'Repair Issues'}
              </Button>
            )}
          </div>
          
          {integrityCheck && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {integrityCheck.valid ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm font-medium">
                  {integrityCheck.valid ? 'Data integrity check passed' : 'Data integrity issues found'}
                </span>
              </div>
              
              {integrityCheck.issues.length > 0 && (
                <div className="space-y-1">
                  {integrityCheck.issues.map((issue, index) => (
                    <div key={index} className="text-xs text-muted-foreground pl-6">
                      {issue}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {repairResult && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">
                  Repaired {repairResult.repaired} items
                </span>
              </div>
              
              {repairResult.errors.length > 0 && (
                <div className="space-y-1">
                  {repairResult.errors.map((error, index) => (
                    <div key={index} className="text-xs text-red-500 pl-6">
                      {error}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Migration Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Database Migrations
          </CardTitle>
          <CardDescription>
            Run database migrations to update your data schema.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleRunMigrations} 
              disabled={isMigrating}
              variant="outline"
            >
              {isMigrating ? 'Running...' : 'Run Migrations'}
            </Button>
            
            {needsMigrationCheck !== null && (
              <Badge variant={needsMigrationCheck ? "destructive" : "secondary"}>
                {needsMigrationCheck ? 'Migrations Available' : 'Up to Date'}
              </Badge>
            )}
          </div>
          
          {migrationResult && (
            <div className="space-y-2">
              {migrationResult.map((result, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center gap-2">
                    {result.success ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm font-medium">
                      Migration {result.version}: {result.success ? 'Success' : 'Failed'}
                    </span>
                    {result.migrated > 0 && (
                      <Badge variant="outline">
                        {result.migrated} items
                      </Badge>
                    )}
                  </div>
                  
                  {result.errors.length > 0 && (
                    <div className="space-y-1">
                      {result.errors.map((error, errorIndex) => (
                        <div key={errorIndex} className="text-xs text-red-500 pl-6">
                          {error}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Backup & Export Section - Pro Feature */}
      {hasExportFunctionality && (
        <BackupExport onRefresh={onRefresh} />
      )}

      {/* Clear All Data Section */}
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Clear All Data
          </CardTitle>
          <CardDescription>
            Permanently delete all your encrypted API keys, settings, and vault data. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> This will permanently delete all your data including API keys, folders, settings, and your master password. You will need to set up your vault from scratch.
            </AlertDescription>
          </Alert>
          
          <Button 
            onClick={handleClearData}
            variant="destructive"
            className="w-full"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All Data
          </Button>
        </CardContent>
      </Card>

      {/* Clear Data Confirmation Modal */}
      <ConfirmationModal
        isOpen={showClearDataModal}
        onClose={() => setShowClearDataModal(false)}
        onConfirm={handleConfirmClearData}
        title="Clear All Data"
        description={`⚠️ WARNING: This action will permanently delete ALL your data:

• All encrypted API keys will be deleted
• Your unlock password will be reset
• All folders and organization will be lost
• All settings and preferences will be reset

This action cannot be undone. You will need to set up your vault again from scratch.

Are you absolutely sure you want to clear all your data?`}
        confirmText="Yes, Clear All Data"
        cancelText="Cancel"
        variant="destructive"
        delaySeconds={3}
      />
    </div>
  );
} 