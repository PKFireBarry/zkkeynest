'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useVault } from '@/contexts/VaultContext';
import { createApiKey } from '@/lib/database';
import { 
  exportApiKeys, 
  downloadBackup, 
  parseBackupFile, 
  importApiKeys,
  getBackupStats,
  BackupData 
} from '@/lib/backup';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Download, Upload, FileText, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import ConfirmationModal from './ConfirmationModal';

interface BackupExportProps {
  onRefresh?: () => void;
}

export default function BackupExport({ onRefresh }: BackupExportProps) {
  const { user } = useUser();
  const { encryptKey, decryptKey } = useVault();
  const { hasExportFunctionality } = useSubscription();
  
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [importStats, setImportStats] = useState<{ imported: number; errors: string[] } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  const handleExportClick = () => {
    setShowExportModal(true);
  };

  const handleConfirmExport = async () => {
    if (!user) return;
    
    setIsExporting(true);
    setError('');
    setSuccess('');
    
    try {
      // Create a backup-specific encryption key
      const backupKey = await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
      
      const encryptBackupKey = async (data: string) => {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);
        const iv = crypto.getRandomValues(new Uint8Array(12));
        
        const encryptedBuffer = await crypto.subtle.encrypt(
          { name: 'AES-GCM', iv },
          backupKey,
          dataBuffer
        );
        
        return {
          encryptedData: btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer))),
          iv: btoa(String.fromCharCode(...iv))
        };
      };
      
      const backupData = await exportApiKeys(user.id, decryptKey, encryptBackupKey);
      
      // Add the backup key to the backup data (this will be encrypted with the user's unlock password)
      const backupKeyExport = await crypto.subtle.exportKey('raw', backupKey);
      const backupKeyString = btoa(String.fromCharCode(...new Uint8Array(backupKeyExport)));
      
      // Encrypt the backup key with the user's unlock password
      const { encryptedData: encryptedBackupKey, iv: backupKeyIv } = await encryptKey(backupKeyString);
      
      const finalBackupData = {
        ...backupData,
        backupKey: encryptedBackupKey,
        backupKeyIv: backupKeyIv
      };
      
      downloadBackup(finalBackupData);
      setSuccess('Backup exported successfully!');
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
    }
  };

  const handleImport = async () => {
    if (!user || !selectedFile) return;
    
    setIsImporting(true);
    setError('');
    setSuccess('');
    setImportStats(null);
    
    try {
      const backupData = await parseBackupFile(selectedFile);
      const stats = getBackupStats(backupData);
      
      // Show preview dialog
      setImportStats({
        imported: 0,
        errors: []
      });
      
      // Create a function to decrypt backup keys
      const decryptBackupKey = async (encryptedData: string, iv: string) => {
        // First decrypt the backup key using the user's unlock password
        const encryptedBackupKey = backupData.backupKey;
        const backupKeyIv = backupData.backupKeyIv;
        
        if (!encryptedBackupKey || !backupKeyIv) {
          throw new Error('Backup file is missing encryption key');
        }
        
        const backupKeyString = await decryptKey(encryptedBackupKey, backupKeyIv);
        const backupKeyBuffer = Uint8Array.from(atob(backupKeyString), c => c.charCodeAt(0));
        const backupKey = await crypto.subtle.importKey(
          'raw',
          backupKeyBuffer,
          { name: 'AES-GCM', length: 256 },
          false,
          ['decrypt']
        );
        
        // Now decrypt the API key using the backup key
        const encryptedBuffer = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
        const ivBuffer = Uint8Array.from(atob(iv), c => c.charCodeAt(0));
        
        const decryptedBuffer = await crypto.subtle.decrypt(
          { name: 'AES-GCM', iv: ivBuffer },
          backupKey,
          encryptedBuffer
        );
        
        const decoder = new TextDecoder();
        return decoder.decode(decryptedBuffer);
      };
      
      // Import the keys
      const result = await importApiKeys(
        backupData,
        user.id,
        decryptBackupKey,
        encryptKey,
        createApiKey
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import backup');
    } finally {
      setIsImporting(false);
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
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export Backup
              </h3>
              <p className="text-sm text-muted-foreground">
                Download all your API keys as a securely encrypted JSON file.
              </p>
              <Button 
                onClick={handleExportClick} 
                disabled={isExporting}
                className="w-full"
              >
                {isExporting ? 'Exporting...' : 'Export Backup'}
              </Button>
            </div>
            
            {/* Import Section */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Import Backup
              </h3>
              <p className="text-sm text-muted-foreground">
                Import API keys from an encrypted backup file.
              </p>
              
              <div className="space-y-2">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="backup-file"
                />
                <label htmlFor="backup-file">
                  <Button variant="outline" className="w-full" asChild>
                    <span>
                      {selectedFile ? selectedFile.name : 'Choose File'}
                    </span>
                  </Button>
                </label>
                
                {selectedFile && (
                  <Button 
                    onClick={handleImport} 
                    disabled={isImporting}
                    className="w-full"
                  >
                    {isImporting ? 'Importing...' : 'Import Backup'}
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

        <ConfirmationModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          onConfirm={handleConfirmExport}
          title="Export Backup File"
          description={`⚠️ IMPORTANT: Please understand the following before exporting:

• This backup file contains all your encrypted API keys
• The file is encrypted with your current unlock password
• If you reset your unlock password later, this backup file will become unusable
• This backup should be used to recover accidentally deleted keys, not as a password recovery method
• Store this file securely and delete it after use

The backup file will only work with your current unlock password. Are you sure you want to export your API keys?`}
          confirmText="Yes, Export Backup"
          cancelText="Cancel"
          variant="default"
          delaySeconds={3}
        />
      </CardContent>
    </Card>
  );
} 