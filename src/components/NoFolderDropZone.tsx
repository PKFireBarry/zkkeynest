'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FolderX } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface NoFolderDropZoneProps {
  apiKeyCount: number;
  isOver: boolean;
  onDrop: () => void;
}

export default function NoFolderDropZone({
  apiKeyCount,
  isOver,
  onDrop
}: NoFolderDropZoneProps) {
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
      if (data.apiKeyId && data.currentFolderId) {
        onDrop();
      }
    } catch (err) {
      console.error('Error parsing drag data:', err);
    }
  };

  // Touch drop handler
  const handleTouchDrop = (e: CustomEvent) => {
    const { apiKey, folderId } = e.detail;
    if (apiKey && folderId === null && apiKey.folderId) {
      onDrop();
    }
  };

  // Add touch drop event listener
  useEffect(() => {
    const cardElement = document.querySelector(`[data-folder-id="null"]`);
    if (cardElement) {
      cardElement.addEventListener('touch-drop', handleTouchDrop as EventListener);
      return () => {
        cardElement.removeEventListener('touch-drop', handleTouchDrop as EventListener);
      };
    }
  }, []);

  return (
    <Card 
      className={`transition-all ${isDragOver || isOver ? 'border-primary border-2 bg-primary/5' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-droppable="true"
      data-folder-id="null"
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center gap-2">
          <FolderX className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
          <span className="font-medium text-sm sm:text-base">Unsorted</span>
          <Badge variant="outline" className="ml-2 text-xs flex-shrink-0">
            {apiKeyCount} {apiKeyCount === 1 ? 'key' : 'keys'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}