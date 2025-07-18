'use client';

import { useState, useEffect } from 'react';
import { Folder } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, FolderOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface DroppableFolderProps {
  folder: Folder;
  apiKeyCount: number;
  isOver: boolean;
  onEdit: (folder: Folder) => void;
  onDelete: (id: string) => void;
  onDrop: (folderId: string) => void;
  isEditing: boolean;
  editName: string;
  onEditNameChange: (name: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
}

export default function DroppableFolder({
  folder,
  apiKeyCount,
  isOver,
  onEdit,
  onDelete,
  onDrop,
  isEditing,
  editName,
  onEditNameChange,
  onSaveEdit,
  onCancelEdit
}: DroppableFolderProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data.apiKeyId && data.currentFolderId !== folder.id) {
        onDrop(folder.id);
      }
    } catch (err) {
      console.error('Error parsing drag data:', err);
    }
  };

  // Touch drop handler
  const handleTouchDrop = (e: CustomEvent) => {
    const { apiKey, folderId } = e.detail;
    if (apiKey && folderId === folder.id && apiKey.folderId !== folder.id) {
      onDrop(folder.id);
    }
  };

  // Add touch drop event listener
  useEffect(() => {
    const cardElement = document.querySelector(`[data-folder-id="${folder.id}"]`);
    if (cardElement) {
      cardElement.addEventListener('touch-drop', handleTouchDrop as EventListener);
      return () => {
        cardElement.removeEventListener('touch-drop', handleTouchDrop as EventListener);
      };
    }
  }, [folder.id]);

  return (
    <Card 
      className={`transition-all ${isDragOver || isOver ? 'border-primary border-2 bg-primary/5' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-droppable="true"
      data-folder-id={folder.id}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <FolderOpen className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
            
            {isEditing ? (
              <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center flex-1">
                <Input 
                  value={editName} 
                  onChange={(e) => onEditNameChange(e.target.value)}
                  className="h-8 text-sm flex-1"
                  autoFocus
                />
                <div className="flex gap-1 w-full sm:w-auto">
                  <Button size="sm" onClick={onSaveEdit} disabled={!editName.trim()} className="flex-1 sm:flex-none">Save</Button>
                  <Button size="sm" variant="ghost" onClick={onCancelEdit} className="flex-1 sm:flex-none">Cancel</Button>
                </div>
              </div>
            ) : (
              <>
                <span className="font-medium text-sm sm:text-base truncate">{folder.name}</span>
                <Badge variant="outline" className="ml-2 text-xs flex-shrink-0">
                  {apiKeyCount} {apiKeyCount === 1 ? 'key' : 'keys'}
                </Badge>
              </>
            )}
          </div>
          
          {!isEditing && (
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <Button size="sm" variant="ghost" onClick={() => onEdit(folder)} className="h-7 w-7 sm:h-8 sm:w-8 p-0">
                <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-destructive hover:text-destructive h-7 w-7 sm:h-8 sm:w-8 p-0"
                onClick={() => onDelete(folder.id)}
              >
                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}