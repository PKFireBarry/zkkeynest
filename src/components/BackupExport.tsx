'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useVault } from '@/contexts/VaultContext';
import { createApiKey } from '@/lib/database';
import { 
  exportApiKeys, 
  downloadBackup, 
  parseBackupFile, 
  importApiKeys,
  getBackupStats,
  BackupData,
  LegacyBackupData 
} from '@/lib/backup';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Upload, FileText, AlertTriangle, CheckCircle, XCircle, Lock, Key, Clock, Eye, EyeOff } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import ConfirmationModal from './ConfirmationModal';

interface BackupExportProps {
  onRefresh?: () => void;
}

// Export Timer Component
function ExportTimer({ onComplete }: { onComplete: () => void }) {
  const [timeLeft, setTimeLeft] = useState(3);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsComplete(true);
      onComplete();
    }
  }, [timeLeft, onComplete]);

  return (
    <div className="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border">
      <div className="flex items-center gap-3">
        <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Please read the information above
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Export button will be enabled in {timeLeft} second{timeLeft !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function BackupExport({ onRefresh }: BackupExportProps) {
  const { user } = useUser();
  const { encryptKey, decryptKey, isUnlocked } = useVault();
  const { hasExportFunctionality } = useSubscription();
  
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [importStats, setImportStats] = useState<{ imported: number; errors: string[] } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [unlockPassword, setUnlockPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [backupData, setBackupData] = useState<BackupData | LegacyBackupData | null>(null);
  const [canExport, setCanExport] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleExportClick = () => {
    if (!isUnlocked) {
      setError('Please unlock your vault before exporting a backup');
      return;
    }
    setShowExportModal(true);
    setCanExport(false); // Reset timer when modal opens
  };

  const handleConfirmExport = async () => {
    if (!user) return;
    
    setIsExporting(true);
    setError('');
    setSuccess('');
    
    try {
      // Use the current unlock password for backup encryption
      // Since the vault is unlocked, we can use the current unlock password
      const backupData = await exportApiKeys(user.id, decryptKey, unlockPassword);
      downloadBackup(backupData);
      setSuccess('Backup exported successfully!');
      setShowExportModal(false);
      setUnlockPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);
      setCanExport(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export backup');
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError('');
      setSuccess('');
      setUnlockPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);
      setBackupData(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const jsonFile = files.find(file => file.type === 'application/json' || file.name.endsWith('.json'));
    
    if (jsonFile) {
      setSelectedFile(jsonFile);
      setError('');
      setSuccess('');
      setUnlockPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);
      setBackupData(null);
    } else {
      setError('Please select a valid JSON backup file');
    }
  };

  const handleImportClick = async () => {
    if (!selectedFile) return;
    
    try {
      const parsedBackupData = await parseBackupFile(selectedFile);
      setBackupData(parsedBackupData);
      setShowImportModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse backup file');
    }
  };

  const handleConfirmImport = async () => {
    if (!user || !backupData) return;
    
    if (!unlockPassword) {
      setError('Please enter the unlock password');
      return;
    }
    
    setIsImporting(true);
    setError('');
    setSuccess('');
    setImportStats(null);
    
    try {
      const result = await importApiKeys(
        backupData,
        user.id,
        unlockPassword,
        encryptKey,
        createApiKey,
        backupData.version < '2.0.0' ? decryptKey : undefined // Pass decryptKey for legacy backups
      );
      
      setImportStats(result);
      
      if (result.imported > 0) {
        setSuccess(`Successfully imported ${result.imported} API keys`);
        onRefresh?.();
      }
      
      if (result.errors.length > 0) {
        setError(`${result.errors.length} keys failed to import`);
      }
      
      setSelectedFile(null);
      setBackupData(null);
      setUnlockPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);
      setShowImportModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import backup');
    } finally {
      setIsImporting(false);
    }
  };

  const getBackupVersionInfo = (backupData: BackupData | LegacyBackupData) => {
    if (backupData.version >= '2.0.0') {
      return {
        type: 'Unlock password-based backup',
        description: 'This backup was encrypted with the unlock password used when it was created.',
        icon: <Key className="h-4 w-4 text-green-500" />,
        passwordLabel: 'Original Unlock Password',
        passwordPlaceholder: 'Enter the unlock password used when creating this backup'
      };
    } else {
      return {
        type: 'Legacy backup',
        description: 'This backup requires your current unlock password to import.',
        icon: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
        passwordLabel: 'Current Unlock Password',
        passwordPlaceholder: 'Enter your current unlock password'
      };
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Backup & Export
        </CardTitle>
        <CardDescription>
          Export your API keys as a secure backup file or import from a previous backup.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        
        {hasExportFunctionality && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Export Section */}
            <div className="space-y-3 flex flex-col">
              <div className="flex-1">
              <h3 className="font-semibold flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export Backup
              </h3>
              <p className="text-sm text-muted-foreground">
                Download all your API keys as a securely encrypted JSON file.
              </p>
              </div>
              <div className="flex flex-col gap-2">
              <Button 
                onClick={handleExportClick} 
                  disabled={isExporting || !isUnlocked}
                className="w-full"
              >
                {isExporting ? 'Exporting...' : 'Export Backup'}
              </Button>
                {!isUnlocked && (
                  <p className="text-xs text-muted-foreground">
                    Please unlock your vault first
                  </p>
                )}
              </div>
            </div>
            
            {/* Import Section */}
            <div className="space-y-3 flex flex-col">
              <div className="flex-1">
              <h3 className="font-semibold flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Import Backup
              </h3>
              <p className="text-sm text-muted-foreground">
                Import API keys from an encrypted backup file.
              </p>
              </div>
              
              <div className="space-y-3">
                {/* File Selection Area */}
                <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="backup-file"
                />
                  <label htmlFor="backup-file" className="cursor-pointer">
                    <div 
                      className={`
                        border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200
                        ${selectedFile 
                          ? 'border-green-500 bg-green-50 dark:bg-green-950/20' 
                          : isDragOver
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400'
                        }
                      `}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      {selectedFile ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-center gap-2">
                            <FileText className="h-5 w-5 text-green-600" />
                            <span className="font-medium text-green-700 dark:text-green-300">
                              File Selected
                    </span>
                          </div>
                          <p className="text-sm text-green-600 dark:text-green-400 font-mono">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-green-500 dark:text-green-400">
                            {(selectedFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className={`h-8 w-8 mx-auto ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />
                          <div>
                            <p className={`font-medium ${isDragOver ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>
                              {isDragOver ? 'Drop backup file here' : 'Choose backup file'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {isDragOver ? 'Release to upload' : 'Click to browse or drag and drop'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
                
                {/* Import Button */}
                {selectedFile && (
                  <Button 
                    onClick={handleImportClick} 
                    disabled={isImporting}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    size="lg"
                  >
                    {isImporting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Import Backup
                      </>
                    )}
                  </Button>
                )}
                
                {/* Clear Selection Button */}
                {selectedFile && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSelectedFile(null);
                      setError('');
                      setSuccess('');
                      setUnlockPassword('');
                      setBackupData(null);
                    }}
                    disabled={isImporting}
                    className="w-full"
                    size="sm"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Clear Selection
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Import Results */}
        {importStats && (
          <div className="space-y-2">
            <h4 className="font-medium">Import Results</h4>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">
                Successfully imported: {importStats.imported} keys
              </span>
            </div>
            
            {importStats.errors.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">
                    Failed imports: {importStats.errors.length}
                  </span>
                </div>
                <div className="pl-6 space-y-1">
                  {importStats.errors.map((error, index) => (
                    <div key={index} className="text-xs text-muted-foreground">
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Security Notice */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Security Notice:</strong> Backup files are encrypted with your unlock password. 
            Store them securely and delete them after use. Only you can decrypt these files.
          </AlertDescription>
        </Alert>

        {/* Export Modal */}
        <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Lock className="h-6 w-6 text-blue-600" />
                Export Secure Backup
              </DialogTitle>
              <DialogDescription className="text-base">
                Create a secure backup of all your API keys
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Security Information */}
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <Lock className="h-3 w-3 text-blue-600" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100">Backup Security</h4>
                    <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <p>• Encrypted with the password you choose below</p>
                      <p>• Independent of your vault unlock password</p>
                      <p>• Can be restored anytime with the backup password</p>
                      <p>• Store securely and delete after use</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="flex-shrink-0 w-6 h-6 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-3 w-3 text-amber-600" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-amber-900 dark:text-amber-100">Important Notes</h4>
                    <div className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
                      <p>• This file contains all your encrypted API keys</p>
                      <p>• Keep this file secure - anyone with the file and your password can access your keys</p>
                      <p>• This is for backup purposes only, not for sharing</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="export-password" className="text-sm font-medium">
                    Backup Password
                  </label>
                  <div className="relative">
                    <Input
                      id="export-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Choose a password for this backup"
                      value={unlockPassword}
                      onChange={(e) => setUnlockPassword(e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="confirm-password" className="text-sm font-medium">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your backup password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {confirmPassword && unlockPassword !== confirmPassword && (
                    <p className="text-xs text-destructive">
                      Passwords do not match
                    </p>
                  )}
                </div>
                
                <p className="text-xs text-muted-foreground">
                  Choose any password to encrypt your backup. You can use your current unlock password or create a new one specifically for this backup.
                </p>
              </div>

              {/* Timer and Button */}
              <div className="space-y-4">
                <ExportTimer onComplete={() => setCanExport(true)} />
                
                <div className="flex gap-3">
                  <Button 
                    onClick={handleConfirmExport} 
                    disabled={isExporting || !canExport || !unlockPassword.trim() || unlockPassword !== confirmPassword}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    size="lg"
                  >
                    {isExporting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Export Backup
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowExportModal(false);
                      setUnlockPassword('');
                      setConfirmPassword('');
                      setShowPassword(false);
                      setShowConfirmPassword(false);
                    }}
                    disabled={isExporting}
                    size="lg"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Import Modal */}
        <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Restore from Backup
              </DialogTitle>
              <DialogDescription>
                Enter the unlock password that was used when this backup was created.
              </DialogDescription>
            </DialogHeader>
            
            {backupData && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  {getBackupVersionInfo(backupData).icon}
                  <div>
                    <p className="font-medium text-sm">{getBackupVersionInfo(backupData).type}</p>
                    <p className="text-xs text-muted-foreground">{getBackupVersionInfo(backupData).description}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="import-unlock-password">{getBackupVersionInfo(backupData).passwordLabel}</Label>
                  <div className="relative">
                    <Input
                      id="import-unlock-password"
                      type={showPassword ? "text" : "password"}
                      placeholder={getBackupVersionInfo(backupData).passwordPlaceholder}
                      value={unlockPassword}
                      onChange={(e) => setUnlockPassword(e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleConfirmImport} 
                    disabled={isImporting || !unlockPassword}
                    className="flex-1"
                  >
                    {isImporting ? 'Importing...' : 'Import Backup'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowImportModal(false)}
                    disabled={isImporting}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
} 